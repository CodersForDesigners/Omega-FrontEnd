
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
		var template = $( ".js_template_floor_availability" ).html();
		var markup = "";
		// floorAvailabilityLists[ unitType ].forEach( function ( data ) {
		// 	markup += __UTIL__.renderTemplate( template, data );
		// } );
		var floorAvailabilityList = getFloorAvailabilityListByType( allUnits, unitType );
		floorAvailabilityList.forEach( function ( data ) {
			markup += __UTIL__.renderTemplate( template, data );
		} );
		$( ".js_set_floor" )
			.html( markup )
			.val( unitFilters.Floor )

		// the Unit list
		var template = $( ".js_template_unit" ).html();
		var markup = "";
		var units = getApartmentsBasedOnCriteria( allUnits, unitFilters )
		units.forEach( function ( data ) {
			markup += __UTIL__.renderTemplate( template, data );
		} );
		if ( ! markup.trim() ) markup = "<h3>No units found. :(</h3>";
		$( ".js_units_list" ).html( markup );

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
		var template = $( ".js_template_unit" ).html();
		var markup = "";
		var units = getApartmentsBasedOnCriteria( allUnits, unitFilters )
		units.forEach( function ( data ) {
			markup += __UTIL__.renderTemplate( template, data );
		} );
		if ( ! markup.trim() ) markup = "<h3>No units found. :(</h3>";
		$( ".js_units_list" ).html( markup );

		// Re-enable the interface
		$( ".js_ui_input" ).prop( "disabled", false );

	} );

	// On selecting an individual apartment
	// Show the Apartment's details
	$( document ).on( "click", ".js_unit_view", function ( event ) {

		// Get the unitId and set it to the UI state
		var unitId = $( event.target ).closest( "[ data-unit ]" ).data( "unit" );

		var unitParameters = window.__PRICING_ENGINE__.unitParameters;
		unitParameters.unit = unitId;

		// Calculate data from the spreadsheet
		var unit = getComputedApartmentDetails( workbook, { unit: unitId } );
		var unitData = window.__PRICING_ENGINE__.unitData;
		unitData = unit;

		// Build and plonk in the markup
		var template = $( ".js_template_unit_information" ).html();
		var markup = __UTIL__.renderTemplate( template, unit );
		// Show / Hide the modification widgets accordingly
		$( ".js_unit_mod" ).addClass( "hidden" );
		if ( unit.mod_toggle_collapsable_bedroom_wall == 1 ) {
			$( ".js_mod_toggle_collapsable_bedroom_wall" ).removeClass( "hidden" )
		}
		$( ".js_unit_info" ).html( markup );

		$( ".js_enquiry_form [ name = enquiry-unit ]" ).val( unitId );

	} );

	$( document ).on( "input", ".js_rate_per_sqft_discount", onCustomApartmentValues );
	$( document ).on( "change", ".js_mod_toggle_collapsable_bedroom_wall input", onCustomApartmentValues );


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
			url: "server/get-lead-details.php",
			method: "POST",
			data: requestPayload
		} )
		.done( function ( response ) {
			var responseFormatted;
			try {
				responseFormatted = JSON.parse( response )
			} catch ( e ) {}
			console.log( responseFormatted )

			if ( responseFormatted.status == "alright" ) {
				var $enquiryForm = $( ".js_enquiry_form" );
				$enquiryForm.find( "[ name='enquiry-name' ]" )
					.val( responseFormatted.data.name );
				$enquiryForm.find( "[ name='enquiry-email' ]" )
					.val( responseFormatted.data.email );
			}

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
		var $enquiryForm = $( ".js_lead_query_form" );
		var $apartmentModsForm = $( ".js_unit_mods" );

		// Disable the input fields
		$form.find( "input, select, textarea" ).prop( "disabled", true );
		$enquiryForm.find( "input, select, textarea" ).prop( "disabled", true );
		$apartmentModsForm.find( "input, select, textarea" ).prop( "disabled", true );

		// Pull values from the form
		var phoneNumber = $( ".js_lead_query_form" ).find( "[ name = 'enquiry-phone' ]" ).val();
		var name = $form.find( "[ name='enquiry-name' ]" ).val();
		var email = $form.find( "[ name='enquiry-email' ]" ).val();
		var unit = $form.find( "[ name='enquiry-unit' ]" ).val();
		var user = $form.find( "[ name='enquiry-user' ]" ).val();
		var discount = $apartmentModsForm.find( "[ name='enquiry-discount' ]" ).val();

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

		// Show the loading indicator
		var $loadingIndicator = $form.find( ".js_loading_indicator.js_lead_fetch" );
		$loadingIndicator.removeClass( "hidden" );

		// Make the request
		var ajaxRequest = $.ajax( {
			url: "http://localhost:9999/enquire",
			method: "GET",
			data: requestPayload
		} )
		.done( function ( response ) {

			console.log( response )

			if ( response.status == "alright" ) {
				console.log( "ya baba!" )
			}

			// Re-enable the input fields
			$form.find( "input, select, textarea" ).prop( "disabled", false );
			$enquiryForm.find( "input, select, textarea" ).prop( "disabled", false );
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
		storeRoom: null
	},
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
					criteria[ criterion ]
					&& unit[ criterion ] != criteria[ criterion ]
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
	inputRangeValues.push( parameters.discount ? parameters.discount : "" );
	inputRangeValues.push( parameters.collapsibleBedroomWall ? parameters.collapsibleBedroomWall : "" );

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
	// The range values have been hard-coded; need to change it in the original sheet
	// outputRange = { s: { c: 0, r: 0 }, e: { c: 17, r: 1 } }

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

	// Translate certain values to be human-readable
	// unit.carpark_type = ( { c: "covered", sc: "semi-covered" } )[ unit.carpark_type ];
	// unit.mod_toggle_collapsable_bedroom_wall = unit.mod_toggle_collapsable_bedroom_wall == 1;
	// unit.mod_toggle_living_dining_room_swap = unit.mod_toggle_living_dining_room_swap == 1;
	// unit.mod_toggle_pooja_room = unit.mod_toggle_pooja_room == 1;
	// unit.mod_toggle_store_room = unit.mod_toggle_store_room == 1;
	// unit.mod_toggle_car_park = unit.mod_toggle_car_park == 1;

	return unit;

}

/*
 *
 * An event handler that runs whenever parameters of an apartment are modified
 *
 */
function onCustomApartmentValues ( event ) {

	// Pull in the custom parameters
	var discount = $( ".js_rate_per_sqft_discount" ).val();
	var collapsibleBedroomWall = $( ".js_mod_toggle_collapsable_bedroom_wall input" ).val();
	// console.log( discount );

	var unitParameters = window.__PRICING_ENGINE__.unitParameters;
	unitParameters.discount = discount;
	unitParameters.collapsibleBedroomWall = collapsibleBedroomWall;
	var inputData = {
		unit: unitParameters.unit,
		discount: discount,
		collapsibleBedroomWall: collapsibleBedroomWall
	};
	var unit = getComputedApartmentDetails( workbook, inputData )
	window.__PRICING_ENGINE__.unitData = unit;

	// Build and plonk in the markup
	var template = $( ".js_template_unit_information" ).html();
	var markup = __UTIL__.renderTemplate( template, unit );
	$( ".js_unit_info" ).html( markup );

};
