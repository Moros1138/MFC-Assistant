
// probably overkill, but fuck it!
if(	-1 !== window.location.href.indexOf('//www.myfreecams.com/_html/player.html') ) {

var MAssist = (function() {
	
	var running = false;
	var readingMessages = false;
	var myName = null;
	var currentModelName = null;
	
	// default settings
	var settings = {
		debug_mode: true,
		send_messages: false
	}
	
	/**
	 * Initializes MFC Assistant
	 */
	function init() {
		
		var initInterval = setInterval(function() {
			
			if($("#chat_contents").length > 0) {

				// get my name
				myName = window.top.window.$('#top_level')[0].contentWindow.$('a[title="Go to My Account"]').text();
				
				// get model name
				currentModelName = window.top.window.location.hash.substr(1);
				
				if(myName != 'Moros1138') {
					
					if(myName == currentModelName) {
						running = true;
					}
					
				} else {
					running = true;
				}
				
				
				debug('MA: my name is - '+myName);
				debug('MA: model name is - '+currentModelName);
				
				if(running) {
					readMessages();
					chrome.runtime.sendMessage({from: 'content', subject: 'ma:ready'});
					console.log('MA: ma:ready triggered');
					clearInterval(initInterval);
				}
				
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
		$(".chat_container").toggleClass('ma-processed', true);
		debug('MA: all chat messages prior to init have been set to processed and ignored.');
		
		$("#chat_contents").on('DOMNodeInserted', function() {
			
			var memberName = '';
			var message = '';
			var tokens = 0;
			
			// no double-ups please
			if(readingMessages)
				return;
			
			readingMessages = true;

			debug('MA: new chat message arrived.');
			
			$(".chat_container:not(.ma-processed)").each(function() {
				
				// CHAT MESSAGE
				if( ($(this).find('.name_other,.name_model,.name_self').length > 0) && ($(this).find('.chat_other,.chat_model,.chat_self').length > 0) ) {
					
					memberName = $(this).find('.name_other,.name_model,.name_self').text().replace(':','');
					message = $(this).find('.chat_other,.chat_model,.chat_self');
					
					// replace images with their title, if title is not set, replace with src
					message.find('img').each(function() {
						
						// if we have a title, it's probably an emote
						if($(this).attr('title') !== undefined) {
							$(this).html($(this).attr('title'));	
						} else {
							$(this).html('#~'+$(this).attr('src')+'~#');
						}
						
					});
					
					message = message.text().trim();
					
					// chat message
					chrome.runtime.sendMessage({from: 'content', subject: 'ma:chat-message', mfcMsg: {memberName: memberName, message: message}});
					
				}
				
				// TIP
				if($(this).find('.chat_system').length > 0) {
					
					if($(this).find('.chat_system').attr('style') == 'color:#008000;background-color:#FFFF00;') {
						
						var tip = $(this).find('.chat_system').html().match("(.[^:]+) has tipped (.*) (.*) tokens.");
						
						memberName = tip[1];
						tokens = parseInt(tip[3]);
						
						// public/visible tip
						chrome.runtime.sendMessage({from: 'content', subject: 'ma:tip', mfcMsg: {memberName: memberName, tipAmount: tokens}});
						
					}
					
				}
				
				// set this item to processed.
				$(this).toggleClass('ma-processed', true);
				
			}); // each message
		
			readingMessages = false;
			
		}); // DOMNodeInserted
		
		// if the chat disappears, re-run the init
		var sanityCheck = setInterval(function() {
			
			var tempName = window.top.window.location.hash.substr(1);
			
			if(tempName != currentModelName) {
				currentModelName = tempName;
				init();
				clearInterval(sanityCheck);
				chrome.runtime.sendMessage({from: 'content', subject: 'ma:not-ready'});
				running = false;
				return;
			}
			
			if($("#chat_contents").length == 0) {
				init();
				console.log('MA: we lost the chatbox.');
				clearInterval(sanityCheck);
				chrome.runtime.sendMessage({from: 'content', subject: 'ma:not-ready'});
				running = false;
				return;
			}
			
		}, 1000);
		
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
				$("#message_input").val(msg[i]);
				$("#send_button").trigger('click');
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
		
		$("#chat_contents").append([
			'<div class="chat_queue_buffer">',
				'<div class="chat_container">',
					'<a href="#" style="text-decoration:none;">',
						'<span class="name_premium name_other" style="text-decoration:none;font-family:Arial;color:#2F2F4F !important;font-weight:bold;">MFCAssistant:</span>',
					'</a>',
					'<span class="chat chat_premium chat_other" style="font-family:Arial;color:#2F2F4F ! important;font-weight:bold;">',
						msg,
					'</span>',
				'</div>',
			'</div>'
		].join(''));

		// force the scroll down.
		$("#chat_contents")[0].scrollTop = $("#chat_contents")[0].scrollHeight;
	}
	
	/**
	 * Generate a fake tip for testing purposes.
	 ******************************************************************/
	function fakeTip(num) {
		
		if(!running) {
			debug('MA: error creating fake tip. not running');
			return;
		}

		$("#chat_contents").append([
			'<div class="chat_queue_buffer">',
				'<div class="chat_container " data-stamp="1479023245131" data-user_id="21683715">',
					'<span class="chat chat_system chat_[object Object]" style="color:#008000;background-color:#FFFF00;">',
						'MFCAssistant has tipped '+currentModelName+' '+num+' tokens.',
					'</span>',
				'</div>',
			'</div>'
		].join(''));

		// force the scroll down.
		$("#chat_contents")[0].scrollTop = $("#chat_contents")[0].scrollHeight;
		
	}
	
	function updateSettings(s) {
		settings = s;
	}
	
	/**
	 * Get our settings.
	 ******************************************************************/
	document.body.dispatchEvent(new Event('ma:get-settings'));
	
	// Inform the background page that this tab should have a page-action
	chrome.runtime.sendMessage({from: 'content', subject: 'openOptionsPage'});

	return {
		init: init,
		sendMsg: sendMsg,
		fakeTip: fakeTip,
		debug: debug,
		updateSettings: updateSettings,
		isRunning: isRunning
	};
	
})();

MAssist.init();

}

chrome.runtime.onMessage.addListener(function (request, sender, response) {
	
	if(	-1 !== window.location.href.indexOf('//www.myfreecams.com/_html/player.html') ) {
		
		switch(request.subject) {
			case 'ma:fake-tip':
				console.log('MA: fake tip');
				MAssist.fakeTip(request.tip_amount);
				return true;
				break;
			case 'ma:send-msg':
				console.log('MA: send message');
				MAssist.sendMsg(request.msg);
				return true;
				break;
			case 'ma:debug':
				MAssist.debug(request);
				return true;
				break;
			case 'ma:update-settings':
				console.log('MA: update settings');
				MAssist.updateSettings(request.s);
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

