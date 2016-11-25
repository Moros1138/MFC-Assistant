/**
 * Opens options/options.html in a new tab
 *
 * Adapted from Adam Feuer's example
 * https://adamfeuer.com/notes/2013/01/26/chrome-extension-making-browser-action-icon-open-options-page/
 ******************************************************************/
function openOrFocusOptionsPage() {
	
	var extensionURL = {
		url: chrome.extension.getURL('options/index.html'),
		found: false
	};
	
	chrome.windows.getAll({ populate: true }, function(wins) {
		
		for(var wi=0; wi<wins.length; wi++) {
			
			var win = wins[wi];
			
			for(var ti=0; ti<win.tabs.length; ti++) {
				
				var tab = win.tabs[ti];
				
				if(tab.url !== undefined) {

					if(extensionURL.url == tab.url) {
						extensionURL.found = true;
						chrome.windows.update(win.id, {"focused": true});
						chrome.tabs.update(tab.id, {"highlighted": true});
					}
					
				}
				
			}
			
		}
		
		// if it's not already open, create a new tab
		if (!extensionURL.found) {
			chrome.windows.create({url: extensionURL.url});
		}
		
	});
	
}

chrome.runtime.onMessage.addListener(function (request, sender, response) {
	
	if(request.from == 'content' && request.showPageAction == 'openOptionsPage') {
		openOrFocusOptionsPage();
	}
	
});

/**
 * Open options page when browserAction is clicked
 ******************************************************************/
chrome.browserAction.onClicked.addListener(function(tab) {

	openOrFocusOptionsPage();
	
});




