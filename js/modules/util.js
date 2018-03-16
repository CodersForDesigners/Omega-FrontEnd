
window.__UTIL__ = { };

__UTIL__.debounceHandler = function debounceHandler ( eventHandler, timeOffset ) {

	timeOffset = timeOffset || 51; // 51 milli-seconds
	var animationFrameId = null;
	var timeoutId = null;

	return function ( event, otherArgs ) {

		if ( timeoutId ) {
			window.clearTimeout( timeoutId );
			timeoutId = null;
		}
		timeoutId = window.setTimeout( function () {

			if ( animationFrameId ) {
				window.cancelAnimationFrame( animationFrameId );
				animationFrameId = null;
			}
			animationFrameId = window.requestAnimationFrame(
				eventHandler.bind( null, event, otherArgs )
			);

		}, timeOffset );
	};

}

__UTIL__.renderTemplate = function () {

	var d;
	function replaceWith ( m ) {

		var pipeline = m.slice( 2, -2 ).trim().split( / *\| */ );
		var value = d[ pipeline[ 0 ] ];
		for ( var _i = 1; _i < pipeline.length; _i +=1 ) {
			value = __UTIL__.template[ pipeline[ _i ] ]( value );
		}

		return value;

	}

	return function renderTemplate ( template, data ) {
		d = data;
		return template.replace( /({{[^{}]+}})/g, replaceWith );
	}

}();

__UTIL__.template = { };

__UTIL__.template.INR = function formatNumberToIndianRupee ( number ) {

	// var reg = new RegExp( "\B(?=(\d{2})+(?!\d))", "g" );
	var formattedNumber;

	var integerAndFractionalParts = ( number + "" ).split( "." );
	var integerPart = integerAndFractionalParts[ 0 ];
	var fractionalPart = integerAndFractionalParts[ 1 ];

	var lastThreeDigitsOfIntegerPart = integerPart.slice( -3 );
	var allButLastThreeDigitsOfIntegerPart = integerPart.slice( 0, -3 );

	formattedNumber = allButLastThreeDigitsOfIntegerPart.replace( /\B(?=(\d{2})+(?!\d))/g, "," );
	// formattedNumber = allButLastThreeDigitsOfIntegerPart.replace( reg, "," );

	if ( allButLastThreeDigitsOfIntegerPart ) {
		formattedNumber += ",";
	}
	formattedNumber += lastThreeDigitsOfIntegerPart;

	if ( fractionalPart ) {
		formattedNumber += "." + fractionalPart;
	}

	return formattedNumber;

};
