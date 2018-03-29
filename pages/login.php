<?php

$provider = require __DIR__ . '/../inc/oauth-google-provider.php';

$authUrl = $provider->getAuthorizationUrl();
$provider->getState();

header( 'Location: ' . $authUrl );

exit;
