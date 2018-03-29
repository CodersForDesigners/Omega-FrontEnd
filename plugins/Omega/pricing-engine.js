
/*
 * Extend XLSX-calc with formulae from the Formula Parser library
 */
XLSX_CALC.import_functions( formulaParser );

getWorkbook();

$( document ).on( "load:spreadsheet", function ( event, workbook ) {

	window.workbook = workbook;
	var allUnits = XLSX.utils.sheet_to_row_object_array( workbook.Sheets.unit_constants );
	window.allUnits = allUnits;


	/*
	 * Pre-calculate some data-sets
	 */
	// Floor Availability Lists by Apartment Type
	var floorAvailabilityLists = {
		"1": getFloorAvailabilityListByType( allUnits, 1 ),
		"2": getFloorAvailabilityListByType( allUnits, 2 ),
		"3": getFloorAvailabilityListByType( allUnits, 3 )
	};

	// On setting the Apartment Type
	$( ".js_set_unit_type" ).on( "change", function ( event ) {

		var $unitType = $( event.target );

		// Disable the interface
		$( ".js_ui_input" ).prop( "disabled", true );

		// Get the apartment type and set it to the UI state
		var unitType = $unitType.val();

		var unitFilters = window.__PRICING_ENGINE__.unitFilters;
		unitFilters.BHK = unitType;

		// Build and plonk in the markup
		// the Floor Selector list
		// var template = $( ".js_template_floor_availability" ).html();
		// var markup = "";
		// floorAvailabilityLists[ unitType ].forEach( function ( data ) {
		// 	markup += __UTIL__.renderTemplate( template, data );
		// } );
		var floorAvailabilityList = getFloorAvailabilityListByType( allUnits, unitType );
		// floorAvailabilityList.forEach( function ( data ) {
		// 	markup += __UTIL__.renderTemplate( template, data );
		// } );
		// $( ".js_set_floor" )
		// 	.html( markup )
		// 	.val( unitFilters.Floor )
		$( ".js_set_floor" )
			.load( "server/templates/floor-availability.php", { floorAvailabilityList: floorAvailabilityList }, function () {
					$( ".js_set_floor" ).val( unitFilters.Floor )
			} )

		// the Unit list
		var units = getApartmentsBasedOnCriteria( allUnits, unitFilters )
		$( ".js_units_list" ).load(
			"server/templates/unit-list.php",
			{ units: units }
		);

		// Re-enable the interface
		$( ".js_ui_input" ).prop( "disabled", false );

	} );

	// On setting the Apartment Floor
	$( ".js_set_floor" ).on( "change", function ( event ) {

		var $floorInput = $( event.target );

		// Disable the interface
		$( ".js_ui_input" ).prop( "disabled", true );

		// Get the floor and set it to the UI state
		var selectedFloor = $floorInput.val();

		var unitFilters = window.__PRICING_ENGINE__.unitFilters;
		unitFilters.Floor = selectedFloor;

		// Build and plonk in the markup
		var units = getApartmentsBasedOnCriteria( allUnits, unitFilters )
		$( ".js_units_list" ).load(
			"server/templates/unit-list.php",
			{ units: units }
		);

		// Re-enable the interface
		$( ".js_ui_input" ).prop( "disabled", false );

	} );

	// On selecting an individual apartment
	// Show the Apartment's details
	$( document ).on( "click", ".js_unit_view", function ( event ) {

		var pricingEngine = window.__PRICING_ENGINE__;

		// Get the unitId and set it to the UI state
		var unitId = $( event.target ).closest( "[ data-unit ]" ).data( "unit" );
		var unitParameters = pricingEngine.unitParameters;
		for ( var param in unitParameters ) {
			unitParameters[ param ] = null;
		}
		unitParameters.unit = unitId;

		// Assign unit constants to the local state
		var unitIndex;
		allUnits.some( function ( unit, index ) {
			if ( unit.Unit == unitId ) {
				unitIndex = index;
				return true;
			}
		} );
		pricingEngine.unitConstants = allUnits[ unitIndex ];

		// Calculate data from the spreadsheet and assign to the local state
		// var unit = getComputedApartmentDetails( workbook, { unit: unitId } );
		// var unitData = pricingEngine.unitData;
		// unitData = unit;
		pricingEngine.unitData = getComputedApartmentDetails( workbook, { unit: unitId } );

		// Build and plonk in the markup
		$( ".js_section_unit_info" ).load(
			"server/templates/unit-information.php",
			$.extend( pricingEngine.unitConstants, pricingEngine.unitData, pricingEngine.unitParameters )
		);

		$( ".js_enquiry_form [ name = enquiry-unit ]" ).val( unitId );

	} );

	$( document ).on( "submit", ".js_unit_discount", onCustomApartmentValues );
	$( document ).on( "change", ".js_mod_toggle_collapsable_bedroom_wall input", onCustomApartmentValues );
	$( document ).on( "change", ".js_mod_toggle_living_dining_room_swap input", onCustomApartmentValues );
	$( document ).on( "change", ".js_multipurpose_space select", onCustomApartmentValues );
	$( document ).on( "change", ".js_mod_car_park_switch input", onCustomApartmentValues );


	/*
	 * On submitting a phone number
	 * We pull any information we can find and pre-populate the form
	 */
	$( ".js_lead_query_form" ).on( "submit", function ( event ) {

		event.preventDefault();

		var $form = $( event.target );

		// Pull data from the form
		var phoneNumber = $form.find( "[ name = 'enquiry-phone' ]" ).val()

		// Show the loading indicator
		var $loadingIndicator = $form.find( ".js_loading_indicator.js_lead_fetch" )
		$loadingIndicator.removeClass( "hidden" );

		// Build the payload
		var requestPayload = { phoneNumber: phoneNumber };

		// Make the request
		var ajaxRequest = $.ajax( {
			url: "http://ser.om/get-lead",
			method: "POST",
			data: requestPayload
		} )
		.done( function ( response ) {
			var responseFormatted;
			try {
				responseFormatted = JSON.parse( response )
			} catch ( e ) {
				responseFormatted = response
			}
			console.log( responseFormatted )
			if ( typeof responseFormatted != "object" ) return;

			var $enquiryForm = $( ".js_enquiry_form" );
			$enquiryForm.find( "[ name='enquiry-name' ]" )
				.val( responseFormatted.data.name );
			$enquiryForm.find( "[ name='enquiry-email' ]" )
				.val( responseFormatted.data.email );
		} )
		.fail( function ( jqXHR ) {
			var responseFormatted;
			try {
				responseFormatted = JSON.parse( jqXHR.statusText )
			} catch ( e ) {
				responseFormatted = jqXHR.statusText;
			}
			console.log( responseFormatted )
		} )
		.always( function () {
			// Hide the loading indicator
			$loadingIndicator.addClass( "hidden" );
		} )

	} );

	/*
	 * On submitting the enquiry form
	 */
	$( ".js_enquiry_form" ).on( "submit", function ( event ) {

		event.preventDefault();

		var $form = $( event.target );
		var $leadFetchForm = $( ".js_lead_query_form" );
		var $apartmentModsForm = $( ".js_unit_mods" );

		// Disable the input fields
		$form.find( "input, select, textarea" ).prop( "disabled", true );
		$leadFetchForm.find( "input, select, textarea" ).prop( "disabled", true );
		$apartmentModsForm.find( "input, select, textarea" ).prop( "disabled", true );

		// Pull values from the form
		var phoneNumber = $( ".js_lead_query_form" ).find( "[ name = 'enquiry-phone' ]" ).val();
		var name = $form.find( "[ name='enquiry-name' ]" ).val();
		var email = $form.find( "[ name='enquiry-email' ]" ).val();
		var unit = $form.find( "[ name='enquiry-unit' ]" ).val();
		var user = $form.find( "[ name='enquiry-user' ]" ).val();

		var unitParameters = window.__PRICING_ENGINE__.unitParameters;
		var unitData = window.__PRICING_ENGINE__.unitData;

		// Build the payload
		var requestPayload = { };
		for ( var p in unitParameters ) {
			requestPayload[ p ] = unitParameters[ p ];
		}
		for ( var p in unitData ) {
			requestPayload[ p ] = unitData[ p ];
		}
		requestPayload.phoneNumber = phoneNumber;
		requestPayload.name = name;
		requestPayload.email = email;
		requestPayload.unit = unit;
		requestPayload.user = user;
		requestPayload.source = 'Web Pricing';

		// Show the loading indicator
		var $loadingIndicator = $form.find( ".js_loading_indicator.js_lead_fetch" );
		$loadingIndicator.removeClass( "hidden" );

		// Make the request
		var ajaxRequest = $.ajax( {
			url: "http://ser.om/enquire",
			method: "GET",
			data: requestPayload,
			xhrFields: {
				withCredentials: true
			}
		} )
		.done( function ( response ) {
			var responseFormatted;
			if ( typeof response != "object" ) {
				try {
					responseFormatted = JSON.parse( response )
				} catch ( e ) {
					responseFormatted = response
				}
			}
			else {
				responseFormatted = response;
			}
			console.log( responseFormatted )
			if ( typeof responseFormatted != "object" ) return;

			console.log( "ya baba!" );
			$form.find( "[ type = 'submit' ]" ).text( "All good." )
		} )
		.fail( function ( jqXHR ) {
			var responseFormatted;
			try {
				responseFormatted = JSON.parse( jqXHR.statusText )
			} catch ( e ) {
				responseFormatted = jqXHR.statusText;
			}
			console.log( responseFormatted )

			console.log( "noihee!" );
			$form.find( "[ type = 'submit' ]" ).text( "Try again later." )
		} )
		.always( function () {

			// Re-enable the input fields
			$form.find( "input, select, textarea" ).prop( "disabled", false );
			$leadFetchForm.find( "input, select, textarea" ).prop( "disabled", false );
			$apartmentModsForm.find( "input, select, textarea" ).prop( "disabled", false );
			// Hide the loading indicator
			$loadingIndicator.addClass( "hidden" );

		} )

	} );


} );















/*
 * The data structure that represents the state of the Pricing Engine
 */
window.__PRICING_ENGINE__ = {
	unitFilters: {
		Availability: 1,
		BHK: null,
		Floor: null
	},
	unitParameters: {
		unit: null,
		discount: null,
		collapsibleBedroomWall: null,
		livingDiningSwap: null,
		poojaRoom: null,
		storeRoom: null,
		carParkSwitch: null
	},
	unitConstants: { },
	unitData: { }
};

/*
 *
 * Fetches the workbook and triggers a "load:spreadsheet" event once it has it
 *
 */
function getWorkbook () {

	var workbookFile = "plugins/Omega/Assets/numbers.xlsx";

	// Set up an async GET request
	var request = new XMLHttpRequest();
	request.open( "GET", workbookFile, true );
	request.responseType = "arraybuffer";

	request.onload = function ( event ) {

		var data = new Uint8Array( request.response );
		var workbook = XLSX.read(
			data,
			{
				type: "array",
				cellHTML: false,
				cellText: false
			}
		);

		$( document ).trigger( "load:spreadsheet", workbook );

	}

	request.send();

}

/*
 *
 * Return the list of apartments that match the given conditions.
 * Conditions include,
 * 	- Type
 * 	- Floor
 * 	- Availability
 *
 */
function getApartmentsBasedOnCriteria ( units, criteria ) {

	var theUnits = units
		.filter( function ( unit ) {
			var criterion;
			for ( criterion in criteria ) {
				if (
					( criteria[ criterion ] != void 0 )
					&& ( unit[ criterion ] != criteria[ criterion ] )
				) {
					return false;
				}
			}
			return true;
		} );

	return theUnits;

}

/*
 *
 * Returns a list of floors along with the number of units available on them
 * for a given apartment type
 *
 */
function getFloorAvailabilityListByType ( units, type ) {

	// Create a floor availability template object
	var floorAvailabilityListTemplateObject =
		[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ]
		.map( function ( number ) {
			return { floor: number, available: 0 };
		} );

	var floorAvailabilityList = units
		.filter( function ( unit ) { return unit.BHK == type && unit.Availability == 1 } )
		.reduce( function ( floorAvailability, unit ) {
			floorAvailability[ unit.Floor ].available += 1;
			return floorAvailability;
		}, $.extend( true, [ ], floorAvailabilityListTemplateObject ) )
		.map( function ( floor ) {
			floor.attrs = floor.available <= 0 ? "disabled" : "";
			return floor;
		} )

	floorAvailabilityList.unshift( { floor: "", available: "all", attrs: "selected" } )

	return floorAvailabilityList;

}

/*
 *
 * This function runs the input through the spreadsheet and returns the computed values
 * More specifically, it
 *	- takes in input
 *	- writes it to the spreadsheet
 *	- performs a re-calculation
 *	- reads out the values
 *
 */
function getComputedApartmentDetails ( workbook, parameters ) {

	var inputRangeValues = [ ];
	inputRangeValues.push( parameters.unit ? parameters.unit : "" );
	inputRangeValues.push( parameters.discount || "" );
	inputRangeValues.push( parameters.collapsibleBedroomWall ? 1 : "" );
	inputRangeValues.push( parameters.livingDiningSwap ? 1 : "" );
	inputRangeValues.push( parameters.poojaRoom ? 1 : "" );
	inputRangeValues.push( parameters.storeRoom ? 1 : "" );
	inputRangeValues.push( parameters.carParkSwitch ? 1 : "" );

	// Resolve the input and output ranges where data will be written and read out of
	var namedRanges = workbook.Workbook.Names.reduce( function ( ranges, currentRange ) {
		var name = currentRange.Name;
		var sheet = currentRange.Ref.split( "!" )[ 0 ];
		var cells = currentRange.Ref.split( "!" )[ 1 ];
		ranges[ name ] = { sheet: sheet, cells: cells };
		return ranges;
	}, {} )
	var inputRangeSheetName = namedRanges.inputRangeStart.sheet;
	var inputRangeStart = namedRanges.inputRangeStart.cells;
	var outputRangeSheet = workbook.Sheets[ namedRanges.outputRange.sheet ];
	var outputRange = XLSX.utils.decode_range( namedRanges.outputRange.cells );

	// write in the input
	XLSX.utils.sheet_add_aoa( workbook.Sheets[ inputRangeSheetName ], [ inputRangeValues ], { origin: inputRangeStart } )

	// Trigger a re-calculation on the spreadsheet
	XLSX_CALC( workbook );

	// Extract the computed values
	var unit = {};
	for ( var c = outputRange.s.c; c <= outputRange.e.c; c += 1 ) {
		var cellAddressOfKey = XLSX.utils.encode_cell( { r: 0, c: c } );
		var key = outputRangeSheet[ cellAddressOfKey ].v;
		var cellAddressOfValue = XLSX.utils.encode_cell( { r: 1, c: c } );
		var value = outputRangeSheet[ cellAddressOfValue ].v;
		unit[ key ] = value;
	}

	return unit;

}

/*
 *
 * An event handler that runs whenever parameters of an apartment are modified
 *
 */
function onCustomApartmentValues ( event ) {

	event.preventDefault();

	// Pull in the custom parameters
	var discount = $( ".js_rate_per_sqft_discount" ).val();
	var collapsibleBedroomWall = $( ".js_mod_toggle_collapsable_bedroom_wall input" ).is( ":checked" );
	var livingDiningSwap = $( ".js_mod_toggle_living_dining_room_swap input" ).is( ":checked" );
	var poojaRoom = $( ".js_multipurpose_space select" ).val() == $( ".js_mod_toggle_pooja_room" ).val();
	var storeRoom = $( ".js_multipurpose_space select" ).val() == $( ".js_mod_toggle_store_room" ).val();
	var carParkSwitch = $( ".js_mod_car_park_switch input" ).is( ":checked" );

	var pricingEngine = window.__PRICING_ENGINE__;

	var unitParameters = pricingEngine.unitParameters;
	unitParameters.discount = discount;
	unitParameters.collapsibleBedroomWall = collapsibleBedroomWall;
	unitParameters.livingDiningSwap = livingDiningSwap;
	unitParameters.poojaRoom = poojaRoom;
	unitParameters.storeRoom = storeRoom;
	unitParameters.carParkSwitch = carParkSwitch;

	pricingEngine.unitData = getComputedApartmentDetails( workbook, unitParameters );

	// Build and plonk in the markup
	$( ".js_section_unit_info" ).load(
		"server/templates/unit-information.php",
		$.extend( pricingEngine.unitConstants, pricingEngine.unitData, pricingEngine.unitParameters )
	);

};
