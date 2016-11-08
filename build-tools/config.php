<?php

define(	'ABSPATH', dirname(dirname(__FILE__)) );
define( 'SRCPATH', ABSPATH . '/src' );
define( 'DISTPATH', ABSPATH . '/dist' );

require( ABSPATH . '/build-tools/libs/parsedown/Parsedown.php' );
require( ABSPATH . '/build-tools/inc/functions.php' );

$pd = new Parsedown();
