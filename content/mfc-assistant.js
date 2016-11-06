// probably overkill, but fuck it!
if(	0 === window.location.href.indexOf('http://www.myfreecams.com/modelweb') || 0 === window.location.href.indexOf('https://www.myfreecams.com/modelweb') ) {
	
var MAssist = (function() {
	
	var initInterval = null;
	
	var running = false;
	
	var readingMessages = false;
	
	// default settings
	var settings = {
		debug_mode: true,
		send_messages: false
	}
	
	/**
	 * Initializes MFC Assistant
	 */
	function init() {
		
		initInterval = setInterval(function() {
			
			if($("#centertabs-body div[id$='channeltab'] div[id$='channeltext']").length > 0) {
				$('body').trigger('ma:ready');
				console.log('MA: ma:ready triggered');
				clearInterval(initInterval);
				running = true;
			}
			
		}, 1000);		
		
	}
	
	function isRunning() {
		return running;
	}

	/**
	 * Grabs messages from the DOM and parses them for chat
	 * messages and tips.
	 ******************************************************************/
	function readMessages() {
		
		// set all current messages as processed
		$("#centertabs-body div[id$='channeltab'] div[id$='channeltext'] p").toggleClass('ma-processed', true);
		debug('MA: all chat messages prior to init have been set to processed and ignored.');
		
		$("#centertabs-body div[id$='channeltab'] div[id$='channeltext']").on('DOMNodeInserted', function() {
		
			// no double-ups please
			if(readingMessages)
				return;
			
			readingMessages = true;

			debug('MA: new chat message arrived.');
			
			$("#centertabs-body div[id$='channeltab'] div[id$='channeltext'] p:not(.ma-processed)").each(function() {
				
				// probably a tip, process it here
				if( $(this).children()[0].tagName.toLowerCase() == 'font' ) {
					
					var tipRegEx = /Received\s+a\s+(\d+)\s+tokens?\s+tip\s+from\s+(.*)\s*!/i;
					var thisMessage = $.trim($(this).text()).replace(/\s+/ig, " ");
					var tipInfo = tipRegEx.exec(thisMessage);
					
					if(tipInfo) {
						
						var memberName = tipInfo[2];
						tipInfo[1] = parseInt(tipInfo[1]);
						
						if( $(this).find('span[style="display: inline; background-color: #C8C8C8;"]').length == 0 ) {
							chrome.runtime.sendMessage({from: 'content', subject: 'ma:tip', mfcMsg: {memberName: memberName, tipAmount: tipInfo[1]}});
						}
						
					}
					
				}

				// probably a chat message, process it here
				if($(this).children()[0].tagName.toLowerCase() == 'a') {
					
					if($(this).children().length == 2) {
						
						var memberName = $(this).find('> a').text();
						var message = $(this).find('> font');
						
						// replace images with their title, if title is not set, replace with src
						message.find('img').each(function() {
							
							// if we have a title, it's probably an emote
							if($(this).attr('title') !== undefined) {
								$(this).html($(this).attr('title'));	
							} else {
								$(this).html('#~'+$(this).attr('src')+'~#');
							}
							
						});
						
						// trim off the first 2 chars ": " from the message
						message = message.text().substr(2);
						
						if(memberName && message) {
							chrome.runtime.sendMessage({from: 'content', subject: 'ma:chat-message', mfcMsg: {memberName: memberName, message: message}});
						}
						
					}
					
				}
				
				// set this item to processed.
				$(this).toggleClass('ma-processed', true);
				
			}); // each message
		
			readingMessages = false;
			
		}); // DOMNodeInserted
		
	}
	
	/**
	 * Basically a wrapper for console.log that we can control via
	 * our custom settings.
	 ******************************************************************/
	function debug(msg) {
		
		if(settings.debug_mode)
			console.log(msg);
		
	}
	
	/**
	 * Send a chat message
	 ******************************************************************/
	function sendMsg(msg) {

		if(!running) {
			debug('MA: error sending message. not running');
			return;
		}
	
		/**
		 * Split strings into 100(ish) long string arrays
		 *
		 * Originally By: georg on Stack Overflow
		 * http://stackoverflow.com/questions/16246031/how-do-i-split-a-string-at-a-space-after-a-certain-number-of-characters-in-javas
		 ******************************************************************/
		msg = msg.replace(/.{100}\S*\s+/g, "$&@").split(/\s+@/);
		
		if(settings.send_messages) {
			for(var i=0; i<msg.length;i++) {
				$("#centertabs-body div[id$='channeltab'] input[id$='message_input']").val(msg[i]);
				$("#centertabs-body div[id$='channeltab'] input[type='button']").trigger('click');
			}
		} else {
			for(var i=0; i<msg.length;i++) {
				fakeMsg(msg[i]);
			}
		}
		
		if(settings.debug_mode)
			debug(msg);
		
	}

	/**
	 * Generate a fake message for testing purposes.
	 ******************************************************************/
	function fakeMsg(msg) {
		
		// TODO: match DOM of an actual chat message.
		$("#centertabs-body div[id$='channeltab'] div[id$='channeltext']").append([
			'<p>',
				'<a onclick="UI.UserInfoDisplay(16212199,false, true);">',
					'<font face="Palatino Linotype" color="#A62A2A" style="font-size:29px"><b>MFC Assistant</b></font>',
				'</a>',
				'<font face="Palatino Linotype" color="#A62A2A" style="font-size:29px"><b>:&nbsp;'+msg+'</b></font>',
			'</p>',
		].join(''));

		// force the scroll down.
		$("#centertabs-body div[id$='channeltab'] div[id$='channeltext']")[0].scrollTop = $("#centertabs-body div[id$='channeltab'] div[id$='channeltext']")[0].scrollHeight;
	}
	
	/**
	 * Generate a fake tip for testing purposes.
	 ******************************************************************/
	function fakeTip(num) {
		
		if(!running) {
			debug('MA: error creating fake tip. not running');
			return;
		}
		
		
		$("#centertabs-body div[id$='channeltab'] div[id$='channeltext']").append([
			'<p class="uid16212199 sid176065692">',
			'<font face="Arial" color="#DC0000" style="font-size:34px">',
			'<span style="display: inline; background-color: #FFFF00;">',
			'<b>Received a '+num+' token tip from <a style="cursor:pointer" ondblclick="ConversationManager.NewConversation(16212199,true)" onclick="UI.UserInfoDisplay(16212199)"><font face="Palatino Linotype" color="#A62A2A" style="font-size:34px"><b>MFC Assistant (Testing)</b></font></a>!</b></span></font>',
			'</p>'
		].join(''));

		// force the scroll down.
		$("#centertabs-body div[id$='channeltab'] div[id$='channeltext']")[0].scrollTop = $("#centertabs-body div[id$='channeltab'] div[id$='channeltext']")[0].scrollHeight;
		
	}
	
	/**
	 * Event listener for: ma:send-msg
	 ******************************************************************/
	document.body.addEventListener('ma:debug', function(e) {
		debug('MA: debug');
		debug(e.detail);
	}, false );

	/**
	 * Event listener for: ma:send-msg
	 ******************************************************************/
	document.body.addEventListener('ma:send-msg', function(e) {
		debug('MA: send message listener');
		sendMsg(e.detail.msg);
	}, false );

	/**
	 * Event listener for: ma:fake-tip
	 ******************************************************************/
	document.body.addEventListener('ma:fake-tip', function(e) {
		debug('MA: fake tip listener');
		fakeTip(e.detail.tip_amount);
	}, false );

	/**
	 * Event listener for: ma:update-settings
	 ******************************************************************/
	document.body.addEventListener('ma:update-settings', function(e) {
		debug('MA: update settings listener');
		settings = e.detail.s;
	}, false );

	/**
	 * Get our settings.
	 ******************************************************************/
	document.body.dispatchEvent(new Event('ma:get-settings'));

	$('body').on('ma:ready', function() {
		readMessages();
		chrome.runtime.sendMessage({from: 'content', subject: 'ma:ready'});
	});
	
	// Inform the background page that this tab should have a page-action
	chrome.runtime.sendMessage({from:    'content', subject: 'openOptionsPage'});

	return {
		init: init,
		sendMsg: sendMsg,
		fakeTip: fakeTip,
		debug: debug,
		isRunning: isRunning
	};
	
})();

MAssist.init();

}

chrome.runtime.onMessage.addListener(function (request, sender, response) {
	
	// probably overkill, but fuck it!
	if(	0 === window.location.href.indexOf('http://www.myfreecams.com/modelweb') || 0 === window.location.href.indexOf('https://www.myfreecams.com/modelweb') ) {
		
		switch(request.subject) {
			case 'ma:fake-tip':
				document.body.dispatchEvent(new CustomEvent('ma:fake-tip', {detail: request}));
				return true;
				break;
			case 'ma:send-msg':
				document.body.dispatchEvent(new CustomEvent('ma:send-msg', {detail: request}));
				return true;
				break;
			case 'ma:debug':
				document.body.dispatchEvent(new CustomEvent('ma:debug', {detail: request}));
				return true;
				break;
			case 'ma:update-settings':
				document.body.dispatchEvent(new CustomEvent('ma:update-settings', {detail: request}));
				return true;
				break;
			case 'ma:init':
				console.log('MA: ma:init recieved from options page');
				response({running: MAssist.isRunning()});
			default:
				break;
		}
		
	}
	
	return true;
});
