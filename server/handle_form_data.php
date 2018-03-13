<?php

//pulling from the webpage
$for = $_REQUEST[ "for" ];
$name = $_REQUEST[ "name" ];
$email = $_REQUEST[ "email" ];
$contact = $_REQUEST[ "contact" ] ?? '';

$message = <<<EOT
for: $for
<br>
name: $name
<br>
email: $email
<br>
contact: $contact
<br>
EOT;

require "contact-form-emailer.php";

$response[ "data" ] = [
	"from" => "us",
	"to" => "them"
];

return $response;
