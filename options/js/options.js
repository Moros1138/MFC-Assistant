


var MAssistOptions = (function() {

	// default settings
	var settings = {
		debug_mode: true,
		send_messages: false
	};
	
	/**
	 * Initializer
	 ******************************************************************/
	function init() {
		loadSettings();
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
		
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {from: 'options-page', subject: 'ma:update-settings', s: settings});
		});		
		
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
		
		chrome.tabs.query({active: true, currentWindow: false}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {from: 'options-page', subject: 'ma:update-settings', s: settings});
		});
		
	}
	
	/**
	 * Listen for messages from "content"
	 ******************************************************************/
	chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
		
		/**
		 * Fire our local ma:chat-message event passing mfcMsg
		 *
		 * mfcMsg.Data.nm  == chat user name
		 * mfcMsg.Data.msg == message
		 ******************************************************************/
		if(request.subject == 'ma:chat-message') {
			$('body').trigger('ma:chat-message', [ request.mfcMsg ]);
		}
		
		/**
		 * Fire our local ma:tip event passing mfcMsg
		 *
		 * mfcMsg.Data.m[2]   == model name
		 * mfcMsg.Data.tokens == tip amount
		 * mfcMsg.Data.u[2]   == member name
		 * mfcMsg.Data.msg    == tip note
		 ******************************************************************/
		if(request.subject == 'ma:tip') {
			$('body').trigger('ma:tip', [ request.mfcMsg ]);
		}
		
		/**
		 * Fire our local ma:model-changed event
		 ******************************************************************/
		if(request.subject == 'ma:model-changed') {
			$('body').trigger('ma:model-changed');
		}
		
	});
	
	/**
	 * Generate a fake tip for testing purposes.
	 *
	 * This sends a message to the content script
	 ******************************************************************/
	function fakeTip(num) {
		chrome.tabs.query({active: true, currentWindow: false}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {from: 'options-page', subject: 'ma:fake-tip', tip_amount: num});
		});
	}

	/**
	 * Send a chat message
	 *
	 * This sends a message to the content script
	 ******************************************************************/
	function sendMsg(msg) {
		chrome.tabs.query({active: true, currentWindow: false}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {from: 'options-page', subject: 'ma:send-msg', msg: msg});
		});
	}
	
	$(document).ready(function() {
		
		init();
		
		$('#ma-fake-tip-button').click(function() {
			fakeTip(parseInt($('#ma-fake-tip-amount').val()));
		});
		
		$('#ma-send-msg-button').click(function() {
			sendMsg($('#ma-send-msg-text').val());
		});
		
	
	});
	
	return {
		init: init,
		sendMsg: sendMsg
	};
	
})();
