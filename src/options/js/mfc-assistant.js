var MAssistOptions = (function() {

	var initInterval = null;

	/**
	 * Initializer
	 ******************************************************************/
	function init() {
		
		initInterval = setInterval(function() {
			
			sendToTab({from: 'options-page', subject: 'ma:init', s: { debug_mode: optionsData.settings.debug_mode, send_messages: optionsData.settings.send_messages }}, function(response) {
				if(response) {
					if(response.running) {
						$('body').trigger('ma:ready');
						clearInterval(initInterval);
					}
				}
			});
			
		}, 1000);
		
	}
	
	/**
	 * Update settings on injected scripts
	 ******************************************************************/
	$('body').on('ma:update-settings', function(e) {
		sendToTab({from: 'options-page', subject: 'ma:update-settings', s: { debug_mode: optionsData.settings.debug_mode, send_messages: optionsData.settings.send_messages }});
	});
	
	/**
	 * Show a jquery ui dialog
	 ******************************************************************/
	function dialog(message, title, yesCallback, noCallback) {
		
		var buttons;
		
		if( (yesCallback === undefined || yesCallback == null) || (noCallback === undefined || noCallback === null)) {
			
			buttons = [{
				text: 'Ok',
				click: function() {
					$(this).dialog('close');
				}
			}];
			
		} else {

			buttons = [{
				text: 'Yes',
				click: yesCallback
			},{
				text: 'No',
				click: noCallback
			}];
		
		}
		
		$('#modal-dialog p').html(message);
		$('#modal-dialog').dialog({
			modal: true,
			title: title,
			buttons: buttons,
			autoOpen: true,
			open: function(e,ui) {
				
				$('.ui-dialog').find("button").each(function() {
					$(this).toggleClass('btn');

					if($(this).html() == 'Yes') {
						$(this).toggleClass('btn-primary');
					}

					if($(this).html() == 'No') {
						$(this).toggleClass('btn-info');
					}
					
				});
			}
		});

	}

	function sendToTab(object, callback) {
		
		chrome.tabs.query({currentWindow: false}, function(tabs) {
			
			for(var i=0; i < tabs.length; i++) {
				if(tabs[i].url !== undefined) {
					if(-1 !== tabs[i].url.indexOf('//www.myfreecams.com')) {
						if(callback === undefined) {
							chrome.tabs.sendMessage(tabs[i].id, object);
						} else {
							chrome.tabs.sendMessage(tabs[i].id, object, callback);
						}
					}
				}
			}
			
		});
		
	}

	/**
	 * Listen for messages from "content"
	 ******************************************************************/
	chrome.runtime.onMessage.addListener( function(request, sender, response) {
		
		if(request === undefined)
			return;
		
		if(request.from != 'content') {
			return;
		}
		
		/**
		 * Fire our local ma:chat-message event passing mfcMsg
		 *
		 * mfcMsg.memberName
		 * mfcMsg.message
		 ******************************************************************/
		if(request.subject == 'ma:chat-message') {
			$('body').trigger('ma:chat-message', [ request.mfcMsg ]);
		}
		
		/**
		 * Fire our local ma:tip event passing mfcMsg
		 *
		 * mfcMsg.Data.memberName
		 * mfcMsg.Data.tipAmount
		 ******************************************************************/
		if(request.subject == 'ma:tip') {
			$('body').trigger('ma:tip', [ request.mfcMsg ]);
		}
		
		/**
		 * MFC Assistant is ready, spread the word!
		 ******************************************************************/
		if(request.subject == 'ma:ready') {
			$('body').trigger('ma:ready');
		}
		
		if(request.subject == 'ma:not-ready') {
			$('body').trigger('ma:not-ready');
		}
		
	});
	
	/**
	 * Generate a fake tip for testing purposes.
	 *
	 * This sends a message to the content script
	 ******************************************************************/
	function fakeTip(num) {
		
		if(num.trim() == '')
			return;
		
		num = parseInt(num);
		
		dialog(
			'You are about to inject a fake tip! This is intended to be used for testing purposes and is only visible to you!<br><br>You are not actually tipping the model!',
			'Fake Tip',
			function() {
				sendToTab({from: 'options-page', subject: 'ma:fake-tip', tip_amount: num});
				$(this).dialog('close');
			},
			function() {
				$(this).dialog('close');
			}
		);
		
	}

	/**
	 * Send a chat message
	 *
	 * This sends a message to the content script
	 ******************************************************************/
	function sendMsg(msg, bypass_dialog) {
		
		if(msg == undefined || msg.trim() == '')
			return;
		
		sendToTab({from: 'options-page', subject: 'ma:send-msg', msg: msg});
	}

	/**
	 * filter emotes
	 ******************************************************************/
	function filterEmotes(msg) {

		// TODO: do it better!
		return unescape(msg).replace(new RegExp('#~(.*?)~#', 'g'),'EMOTE');
		
	}
	
	$(document).ready(function() {
		
		init();
		
		$('body').on('ma:ready', function(e) {
			sendToTab({from: 'options-page', subject: 'ma:update-settings', s: { debug_mode: optionsData.settings.debug_mode, send_messages: optionsData.settings.send_messages }});
		});

		// resize the body's padding based on footer's height
		$(window).resize(function() {
			$('body').css('padding-bottom', $('.footer').height()+'px');
		});
		
	});
	
	return {
		init: init,
		sendMsg: sendMsg,
		fakeTip: fakeTip,
		dialog: dialog,
		filterEmotes: filterEmotes
	};
	
})();
