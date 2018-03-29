
( function ( rootNamespace ) {

	/*
	 * Utility constants
	 */
	var error = new Error( '#ERROR!' );

	/*
	 * Utility functions
	 */
	var utils = { };

	utils.anyIsError = function anyIsError () {
		var n = arguments.length;
		while ( n-- ) {
			if ( arguments[ n ] instanceof Error ) {
				return true;
			}
		}
		return false;
	};

	utils.parseNumber = function parseNumber ( string ) {
		if ( string === undefined || string === '' ) {
			return error.value;
		}
		if ( !isNaN( string ) ) {
			return parseFloat( string );
		}
		return error.value;
	};


	/*
	 * Formulae functions
	 */
	var formulaes = { };

	formulaes.ROUNDDOWN = function( number, digits ) {
		number = utils.parseNumber( number );
		if ( digits === void 0 ) digits = 0;
		digits = utils.parseNumber( digits );
		if ( utils.anyIsError( number, digits ) ) {
			return error.value;
		}
		var sign = ( number > 0 ) ? 1 : -1;
		return sign * ( Math.floor( Math.abs( number ) * Math.pow( 10, digits ) ) ) / Math.pow( 10, digits );
	}

	rootNamespace.formulaParser = formulaes;

} )( window )
