<?php

require('config.php');

// CHROME
rcopy( SRCPATH, DISTPATH.'/chrome');

if(file_exists(DISTPATH.'/chrome/options/options.html')) {

	$readme = file_get_contents( ABSPATH . '/README.md' );
	$readme = $pd->text($readme);

	$options = file_get_contents(DISTPATH.'/chrome/options/options.html');
	
$options = str_replace('		<div id="home" class="page container" style="display: none;">
			<div class="jumbotron">
			</div>
		</div>',
		'		<div id="home" class="page container" style="display: none;">
			<div class="jumbotron">
				'.$readme.'
			</div>
		</div>', $options );
	
	
	file_put_contents(DISTPATH.'/chrome/options/options.html', $options);
	
}
