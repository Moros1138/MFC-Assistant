<?php

define(	'ABSPATH', dirname(dirname(__FILE__)) );
define( 'SRCPATH', ABSPATH . '/src' );
define( 'DISTPATH', ABSPATH . '/dist' );

$jwt_id = ''; // Set your extension id
$jwt_issuer = ''; // Set your mozilla issuer
$jwt_secret = ''; // Set your mozilla secret
$jwt_update_url = ''; // Set your firefox update url

require( ABSPATH . '/build-tools/libs/parsedown/Parsedown.php' );
require( ABSPATH . '/build-tools/inc/functions.php' );
require( ABSPATH . '/build-tools/inc/mozilla-api.php' );

// make sure DISTPATH exists
if( !file_exists(DISTPATH)) mkdir(DISTPATH);
