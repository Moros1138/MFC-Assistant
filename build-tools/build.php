<?php
date_default_timezone_set('America/New_York');

require('config.php');

switch( $argv[1] ) {
	case 'update-home':
		update_home_page();
		break;

	case 'chrome':
		chrome();
		break;
	
	case 'firefox':
		firefox();
		break;
		
	case 'buildall':
		update_home_page();
		chrome();
		firefox();
		break;
		
	default:
		usage();
		break;
		
}
