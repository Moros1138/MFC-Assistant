jQuery.fn.extend({
	checkNaN: function() {
		
		var num = parseInt($(this).val());
		
		if(!isNaN(num) && num != '') {
			
			$(this).toggleClass('btn-danger', false);
			$(this).off('click');
			return false;
			
		} else {
			
			$(this).toggleClass('btn-danger', true);
			$(this).val('Error: This field needs to be a number is not a number');
			$(this).on('click', function() {
				$(this).val('');
			});
			return true;
			
		}
	}
});

var MAssistOptions = (function() {

	var initInterval = null;

	// default settings
	var settings = {
		debug_mode: true,
		send_messages: false,
	};
	
	/**
	 * Initializer
	 ******************************************************************/
	function init() {
		loadSettings();

		initInterval = setInterval(function() {
			
			sendToTab({from: 'options-page', subject: 'ma:init', s: settings}, function(response) {
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
	 * Loads settings from local storage, if any exists and binds
	 * them to the DOM objects they are intended for.
	 ******************************************************************/
	function loadSettings() {
		
		// load settings from local storage
		if(localStorage.maSettings !== undefined)
			settings = JSON.parse(localStorage.maSettings);
		
		$('input[name="ma-debug-mode"]').each( function(e) {
			
			if($(this).val() == 'yes' && settings.debug_mode)
				$(this).prop('checked', true);
			
			if($(this).val() == 'no' && !settings.debug_mode)
				$(this).prop('checked', true);
			
		});

		$('input[name="ma-send-messages"]').each( function(e) {
			
			if($(this).val() == 'yes' && settings.send_messages)
				$(this).prop('checked', true);
			
			if($(this).val() == 'no' && !settings.send_messages)
				$(this).prop('checked', true);

		});

		$('body').on('click', 'input[name="ma-debug-mode"]', function() {
			updateSettings();
		});

		$('body').on('click', 'input[name="ma-send-messages"]', function() {
			updateSettings();
		});

		sendToTab({from: 'options-page', subject: 'ma:update-settings', s: settings});		
		
	}
	
	/**
	 * Updates our settings in localStorage
	 ******************************************************************/
	function updateSettings() {
		
		settings = {
			debug_mode: ($('input[name=ma-debug-mode]:checked').val() == 'yes') ? true : false,
			send_messages: ($('input[name=ma-send-messages]:checked').val() == 'yes') ? true : false
		};

		localStorage.maSettings = JSON.stringify(settings);
		sendToTab({from: 'options-page', subject: 'ma:update-settings', s: settings});
		
	}

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
			$('#chatbox').append('<p><b>'+request.mfcMsg.memberName+':</b> '+filterEmotes(request.mfcMsg.message)+'</p>');
			$("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
		}
		
		/**
		 * Fire our local ma:tip event passing mfcMsg
		 *
		 * mfcMsg.Data.memberName
		 * mfcMsg.Data.tipAmount
		 ******************************************************************/
		if(request.subject == 'ma:tip') {
			$('body').trigger('ma:tip', [ request.mfcMsg ]);

			var tipMsg = '<p>';
			tipMsg += '<b>'+request.mfcMsg.memberName+'</b> has tipped you '+request.mfcMsg.tipAmount+' tokens. ';
			tipMsg += '</p>';

			$('#chatbox').append(tipMsg);
			$("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
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
		
		$('#ma-send-msg-form').submit(function(e) {
			e.preventDefault();
			sendMsg($('#ma-send-msg-text').val());
			$('#ma-send-msg-text').val('');
		});		
		
		$('#ma-fake-tip-form').submit(function(e) {
			e.preventDefault();
			fakeTip(parseInt($('#ma-fake-tip-amount').val()));
			$('#ma-fake-tip-amount').val('');
		});
		
		$('body').on('ma:ready', function(e) {
			MANavigation.navigateTo('#home');
			sendToTab({from: 'options-page', subject: 'ma:update-settings', s: settings});
		});
		
		$('body').on('ma:not-ready', function(e) {

			dialog(
				'All game variables will be cleared and timers will stopped.',
				'Lost Contact with Model Web!',
				function() {
					$(this).dialog('close');
				}
			);
		
		});
		
	});
	

	return {
		init: init,
		sendMsg: sendMsg,
		dialog: dialog
	};
	
})();
