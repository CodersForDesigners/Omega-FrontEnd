<?php

ini_set( "display_errors", "On" );
ini_set( "error_reporting", E_ALL );

date_default_timezone_set( 'Asia/Kolkata' );

// continue processing this script even if
// the user closes the tab, or
// hits the ESC key
ignore_user_abort( true );

// do not let this script timeout
set_time_limit( 0 );

require '../vendor/autoload.php';

use CristianPontes\ZohoCRMClient\ZohoCRMClient;

$authToken = 'd26aa791c15cd144fff5857ad96aeb39';

$response = [ ];

// $inputEmail = 'adityabhat@lazaro.in';
// $inputPhone = 7760118668;
// $inputEmail = 'prateekjain707@gmail.com';
// $inputPhone = 7624919884;
// $inputPhone = 76;
$inputPhone = $_REQUEST[ 'phoneNumber' ];

if ( empty( $inputPhone ) ) {
	$response[ 'status' ] = 'error';
	$response[ 'message' ] = 'No phone number was provided.';
	die( json_encode( $response ) );
}

$leadsClient = new ZohoCRMClient( 'Leads', $authToken, 'com', 0 );

try {
	$records = $leadsClient->searchRecords()
				->where( 'Phone', $inputPhone )
				// ->where( 'Email', $inputEmail )
				// ->orWhere( 'Phone', $inputPhone )
				->request();
} catch ( Exception $e ) {
	$records = [ ];
}

if ( empty( $records ) ) {
	$response[ 'status' ] = 'error';
	$response[ 'message' ] = 'No lead or prospect matching the phone number was found.';
	die( json_encode( $response ) );
}

$lead = $records[ 1 ]->data;
$response[ 'status' ] = 'alright';
$response[ 'data' ] = [
	'email' => $lead[ 'Email' ],
	'name' => $lead[ 'Full Name' ]
];

die( json_encode( $response ) );
// var_dump( $records );
