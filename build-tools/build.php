<?php

require('config.php');

// make sure DISTPATH exists
if( !file_exists(DISTPATH)) mkdir(DISTPATH);

/**
 * CHROME EXTENSION
 ******************************************/
if( !file_exists(DISTPATH.'/chrome')) mkdir(DISTPATH.'/chrome');
rcopy( SRCPATH, DISTPATH.'/chrome');
update_home_page('chrome');

$path = str_replace( '/', '\\', DISTPATH.'/chrome' );
chdir($path);
system( 'zip -r "..\MFC Assistant (Chrome).zip" .' );

/**
 * FIREFOX EXTENSION
 ******************************************/
if( !file_exists(DISTPATH.'/firefox')) mkdir(DISTPATH.'/firefox');
rcopy( SRCPATH, DISTPATH.'/firefox');
update_home_page('firefox');

chdir(DISTPATH.'/firefox');
//system( 'web-ext sign --api-key='.$jwt_issuer.' --api-secret='.$jwt_secret );