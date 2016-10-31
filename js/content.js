function injectJs(link) {
	var scr = document.createElement("script");
	scr.type="text/javascript";
	scr.src=chrome.runtime.getURL(link);
	(document.head || document.body || document.documentElement).appendChild(scr);
}

function injectCss(link, id, theme_path) {
	var scr = document.createElement("link");
	scr.setAttribute("type", "text/css");
	scr.setAttribute("rel", "stylesheet");
	scr.setAttribute("href", chrome.runtime.getURL(link));
	
	if(id !== undefined) {
		scr.setAttribute("id", id);
	}
	
	if(theme_path !== undefined) {
		scr.setAttribute("data-theme-path", theme_path);
	}

	(document.head || document.body || document.documentElement).appendChild(scr);
}

//for some reason @match doesn't appear to work properly in Chrome, so check it here
if (0 === window.location.href.indexOf('http://www.myfreecams.com/_html/player.html')) {

	injectCss("css/jquery-ui/ui-darkness/jquery-ui.min.css", "ma-jquery-ui", chrome.runtime.getURL("css/jquery-ui/"));
	injectCss("css/jquery-ui/ui-darkness/theme.css", "ma-jquery-ui-theme", chrome.runtime.getURL("css/jquery-ui/"));

	// main css
	injectCss("css/mfc-assistant.css");

	injectJs("js/mfc-assistant.js");
	injectJs("js/games/tipwars.js");
	injectJs("js/games/tokenkeno.js");
	//injectJs("js/auto-post.js"));
	
	injectJs("js/global.js");
	
}

if (0 === window.location.href.indexOf('http://www.myfreecams.com/_html/top.html')) {


}
