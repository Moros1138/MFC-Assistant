if(!opener) {

function injectJs(link) {
	var scr = document.createElement("script");
	scr.type="text/javascript";
	scr.src=chrome.runtime.getURL(link);
	(document.head || document.body || document.documentElement).appendChild(scr);
}

if (0 === window.location.href.indexOf('http://www.myfreecams.com/_html/top.html')) {

	injectJs("content/mfc-assistant.js");
	
	document.body.addEventListener('ma:private-message', function(e) {
		chrome.runtime.sendMessage({from: 'content', subject: 'ma:private-message', mfcMsg: e.detail});
	}, false);

	document.body.addEventListener('ma:chat-message', function(e) {
		chrome.runtime.sendMessage({from: 'content', subject: 'ma:chat-message', mfcMsg: e.detail});
	}, false);

	document.body.addEventListener('ma:tip', function(e) {
		chrome.runtime.sendMessage({from: 'content', subject: 'ma:tip', mfcMsg: e.detail});
	}, false);

	document.body.addEventListener('ma:model-changed', function(e) {
		chrome.runtime.sendMessage({from: 'content', subject: 'ma:model-changed', modelName: e.detail});
	}, false);

	document.body.addEventListener('ma:model-name-not-match', function() {
		chrome.runtime.sendMessage({from: 'content', subject: 'ma:model-model-name-not-match'});
	}, false);
	
	// Inform the background page that this tab should have a page-action
	chrome.runtime.sendMessage({
		from:    'content',
		subject: 'openOptionsPage'
	});
	
}

chrome.runtime.onMessage.addListener(function (request, sender, response) {

	if(0 === window.location.href.indexOf('http://www.myfreecams.com/_html/top.html')) {

		//console.log( request );
		
		switch(request.subject) {
			case 'ma:fake-tip':
				document.body.dispatchEvent(new CustomEvent('ma:fake-tip', {detail: request}));
				break;
			case 'ma:send-msg':
				document.body.dispatchEvent(new CustomEvent('ma:send-msg', {detail: request}));
				break;
			case 'ma:debug':
				document.body.dispatchEvent(new CustomEvent('ma:debug', {detail: request}));
				break;
			case 'ma:update-settings':
				document.body.dispatchEvent(new CustomEvent('ma:update-settings', {detail: request}));
				break;
			default:
				break;
		}
		
	}
		
	return true;
		
});

}