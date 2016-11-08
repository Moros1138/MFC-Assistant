<?php

define(	'ABSPATH', dirname(dirname(__FILE__)) );
define( 'SRCPATH', ABSPATH . '/src' );
define( 'DISTPATH', ABSPATH . '/dist' );

require( ABSPATH . '/build-tools/parsedown/Parsedown.php' );
$pd = new Parsedown();

// removes files and non-empty directories
function rrmdir($dir) {
  if (is_dir($dir)) {
    $files = scandir($dir);
    foreach ($files as $file)
    if ($file != "." && $file != "..") rrmdir("$dir/$file");
    rmdir($dir);
  }
  else if (file_exists($dir)) unlink($dir);
} 

// copies files and non-empty directories
function rcopy($src, $dst) {
  if (file_exists($dst)) rrmdir($dst);
  if (is_dir($src)) {
    mkdir($dst);
    $files = scandir($src);
    foreach ($files as $file)
    if ($file != "." && $file != "..") rcopy("$src/$file", "$dst/$file"); 
  }
  else if (file_exists($src)) copy($src, $dst);
}

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
