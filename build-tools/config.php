<?php

define(	'ABSPATH', dirname(dirname(__FILE__)) );
define( 'SRCPATH', ABSPATH . '/src' );
define( 'DISTPATH', ABSPATH . '/dist' );

$jwt_issuer = ''; // Set your mozilla issuer
$jwt_secret = ''; // Set your mozilla secret

require( ABSPATH . '/build-tools/libs/parsedown/Parsedown.php' );
require( ABSPATH . '/build-tools/inc/functions.php' );
require( ABSPATH . '/build-tools/inc/mozilla-api.php' );
