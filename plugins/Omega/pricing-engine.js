
window.__PRICING_ENGINE__ = {
	unitSelector: {
		availability: 1,
		bhk: null,
		floor: null
	}
};

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

// Get the apartment availability list for a given apartment type
function getFloorAvailabilityListByType ( units, type ) {

	// Create a floor availability template object
	var floorAvailabilityListTemplateObject =
		[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ]
		.map( function ( number ) {
			return { floor: number, available: 0 };
		} );

	var floorAvailabilityList = units
		.filter( function ( unit ) { return unit.bhk == type && unit.availability == 1 } )
		.reduce( function ( floorAvailability, unit ) {
			floorAvailability[ unit[ "floor" ] ].available += 1;
			return floorAvailability;
		}, $.extend( true, [ ], floorAvailabilityListTemplateObject ) )
		.map( function ( floor ) {
			floor.attrs = floor.available <= 0 ? "disabled" : "";
			return floor;
		} )

	floorAvailabilityList.unshift( { floor: "", available: "all", attrs: "selected" } )

	return floorAvailabilityList;

}

getWorkbook();

$( document ).on( "load:spreadsheet", function ( event, workbook ) {

	window.workbook = workbook;
	// XLSX.utils.sheet_to_html( workbook.Sheets.unit_constants, "spreadsheet_dump" );
	// $( ".js_spreadsheet_dump" ).append( XLSX.utils.sheet_to_html( workbook.Sheets.unit_constants ) );

	// Build the entire apartment list
	var namedRanges = workbook.Workbook.Names.reduce( function ( ranges, currentRange ) {
		var name = currentRange.Name
		var sheet = currentRange.Ref.split( "!" )[ 0 ]
		var cells = currentRange.Ref.split( "!" )[ 1 ]
		ranges[ name ] = { sheet, cells }
		return ranges
	}, {} )
	var inputRangeSheetName = namedRanges.inputRangeStart.sheet
	var inputRangeStart = namedRanges.inputRangeStart.cells
	var outputRangeSheet = workbook.Sheets[ namedRanges.outputRange.sheet ]
	var outputRange = XLSX.utils.decode_range( namedRanges.outputRange.cells )
	outputRange = { s: { c: 0, r: 0 }, e: { c: 17, r: 1 } }
	allUnits = XLSX.utils.sheet_to_row_object_array( workbook.Sheets.unit_constants )
		.map( function ( unit ) {
			var inputRangeValues = [ [ unit.unit ] ];
			XLSX.utils.sheet_add_aoa( workbook.Sheets[ inputRangeSheetName ], inputRangeValues, { origin: inputRangeStart } )
			// Calculate spreadsheet
			XLSX_CALC( workbook );
			// return XLSX.utils.sheet_to_json( workbook.Sheets.discount_pdf )[ 0 ];
			var unit = {};
			for ( var c = outputRange.s.c; c <= outputRange.e.c; c += 1 ) {
				var cellAddressOfKey = XLSX.utils.encode_cell( { r: 0, c: c } );
				var key = outputRangeSheet[ cellAddressOfKey ].v;
				var cellAddressOfValue = XLSX.utils.encode_cell( { r: 1, c: c } );
				var value = outputRangeSheet[ cellAddressOfValue ].v;
				unit[ key ] = value;
			}
			return unit;
		} )
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

		var unitSelector = window.__PRICING_ENGINE__.unitSelector;
		unitSelector.bhk = unitType;

		// Build and plonk in the markup
		// the Floor Selector list
		var template = $( ".js_template_floor_availability" ).html();
		var markup = "";
		floorAvailabilityLists[ unitType ].forEach( function ( data ) {
			markup += __UTIL__.renderTemplate( template, data );
		} );
		$( ".js_set_floor" )
			.html( markup )
			.val( unitSelector.floor )

		// the Unit list
		var template = $( ".js_template_unit" ).html();
		var markup = "";
		var units = getApartmentsBasedOnCriteria( allUnits, unitSelector )
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

		var unitSelector = window.__PRICING_ENGINE__.unitSelector;
		unitSelector.floor = selectedFloor;

		// Build and plonk in the markup
		var template = $( ".js_template_unit" ).html();
		var markup = "";
		var units = getApartmentsBasedOnCriteria( allUnits, unitSelector )
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

		var unitId = $( event.target ).closest( "[ data-unit ]" ).data( "unit" );

		// Build and plonk in the markup
		var template = $( ".js_template_unit_information" ).html();
		var data = getApartmentsBasedOnCriteria( allUnits, { unit: unitId } )[ 0 ];
		var markup = __UTIL__.renderTemplate( template, data );
		$( ".js_unit_info" ).html( markup );

		// $( ".js_enquiry_form [ name = enquiry-unit ]" ).val( unitId );

	} );


} );
