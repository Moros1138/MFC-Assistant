<?php

/**
 * removes files and non-empty directories
 ******************************************/
function rrmdir($dir) {
  if (is_dir($dir)) {
    $files = scandir($dir);
    foreach ($files as $file)
    if ($file != "." && $file != "..") rrmdir("$dir/$file");
    @rmdir($dir);
  }
  else if (file_exists($dir)) @unlink($dir);
} 

/**
 * copies files and non-empty directories
 ******************************************/
function rcopy($src, $dst) {
  if (file_exists($dst)) rrmdir($dst);
  if (is_dir($src)) {
    @mkdir($dst);
    $files = scandir($src);
    foreach ($files as $file)
    if ($file != "." && $file != "..") rcopy("$src/$file", "$dst/$file"); 
  }
  else if (file_exists($src)) copy($src, $dst);
}

/**
 * UPDATE HOME PAGE FROM README.md
 ******************************************/
function update_home_page() {

	echo "updating home page from README.md...\n";
	if(file_exists(SRCPATH.'/options/options.html')) {
	
		$pd = new Parsedown();
		$readme = file_get_contents( ABSPATH . '/README.md' );
		$readme = $pd->text($readme);

		$options = file_get_contents(SRCPATH.'/options/options.html');
		
		$options = preg_replace(
			'#<div id="home" class="page container" style="display: none;"><div class="jumbotron">(.*)</div></div>#isU',
			'<div id="home" class="page container" style="display: none;"><div class="jumbotron">'.$readme.'</div></div>',
			$options
		);
		
		file_put_contents(SRCPATH.'/options/options.html', $options);
	
	}
	
}

function filter($text) {
	return str_replace( '/', '\\', $text );
}

/**
 * CHROME EXTENSION
 ******************************************/
function chrome() {
	
	echo "building chrome extension...\n";
	
	if( !file_exists(DISTPATH.'/mfc-assistant-chrome'))
		mkdir(DISTPATH.'/mfc-assistant-chrome');

	rcopy( SRCPATH, DISTPATH.'/mfc-assistant-chrome');

	$path = filter(DISTPATH);
	chdir($path);
	
	$filename = 'mfc-assistant-chrome.'.date('Y-m-d G.i.s').'.zip';
	
	system( 'del *.zip' );
	system( filter('zip -r "'.$filename.'" mfc-assistant-chrome') );
	system( filter('copy "'.$filename.'" "z:/emon.moros1138.com/mfc-assistant/'.$filename.'"') );
	
}

/**
 * FIREFOX EXTENSION
 ******************************************/
function firefox() {
	
	global $jwt_id, $jwt_issuer, $jwt_secret, $jwt_update_url;
	
	echo "building firefox extension...\n";
	
	if( !file_exists(DISTPATH.'/mfc-assistant-firefox'))
		mkdir(DISTPATH.'/mfc-assistant-firefox');
	
	rcopy( SRCPATH, DISTPATH.'/mfc-assistant-firefox');

	$path = filter( DISTPATH.'/mfc-assistant-firefox' );
	chdir($path);

	$manifest = file_get_contents('manifest.json');
	$manifest = json_decode($manifest, true);

	$manifest['applications'] = array(
		'gecko' => array(
			'id' => $jwt_id,
			'strict_min_version' => "42.0",
			'strict_max_version' => "50.*",
			'update_url' => $jwt_update_url
		)
	);
	
	file_put_contents('manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
	
	system( 'web-ext sign --api-key='.$jwt_issuer.' --api-secret='.$jwt_secret.' --artifacts-dir='.filter(dirname($path)) );
	
}

/**
 * USAGE
 ******************************************/
function usage() {
	
	echo "MOROS EXTENSION BUILDER 1.0\n\n\tOptions:\n\t\tupdate-home\n\t\tchrome\n\t\tfirefox\n\t\tbuildall\n\n";
	exit;
	
}
