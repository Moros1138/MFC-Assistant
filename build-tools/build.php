<?php

require('config.php');

/**
 * CHROME EXTENSION
 ******************************************/
rcopy( SRCPATH, DISTPATH.'/chrome');
update_home_page('chrome');

/**
 * FIREFOX EXTENSION
 ******************************************/
rcopy( SRCPATH, DISTPATH.'/firefox');
update_home_page('firefox');

chdir(DISTPATH.'/firefox');
//system( 'web-ext sign --api-key='.$jwt_issuer.' --api-secret='.$jwt_secret );
