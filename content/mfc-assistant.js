//polyfill for unsafeWindow on Chrome
if (navigator.userAgent.match(/chrome/i)) {
    unsafeWindow = (function () {
        var el = document.createElement('p');
        el.setAttribute('onclick', 'return window;');
        return el.onclick();
    } ());
}

var MAssist = (function() {
	if(opener)
		return;
	
	var rendered = false;
	var myName = '';
	
	var currentModelName = '';
	
	// default settings
	var settings = {
		debug_mode: true,
		send_messages: false
	}
	
	/**
	 * Initializes MAssist
	 */
	function init() {
		unsafeWindow.mfcParseLine = unsafeWindow.ParseLine;
		unsafeWindow.ParseLine = ParseLine;
	}

	/**
	 * Parse MFC's sMessage and convert it into a useful object.
	 *
	 * Originally By: KradekMFC on GitHub
	 * https://gist.github.com/KradekMFC/a4a337ecd7b0c71f60d88d7f4becfd29
	 ******************************************************************/
	function MFCMessage(initializer){
		
		var self = this;

		//strip newlines
		initializer = initializer.replace(/(\r\n|\n|\r)/gm, "");

		//parse out the typical pieces
		["Type","From","To","Arg1","Arg2"].forEach(function(part){
			var delimiterPos = initializer.indexOf(" ");
			self[part] = initializer.substring(0, delimiterPos);
			initializer = initializer.substring(delimiterPos + 1)
		});

		//convert Type to an int
		self.Type = +self.Type;

	   var parsed;
	   try {
		   parsed = JSON.parse(unescape(initializer));
	   } catch(err){}
	   self.Data = parsed;

	}
	
	/**
	 * Replacement for MFC's ParseLine. Allows us to fire message
	 * events for both chat messages and tips.
	 *
	 * Originally By: KradekMFC on GitHub
	 * https://gist.github.com/KradekMFC/a4a337ecd7b0c71f60d88d7f4becfd29
	 ******************************************************************/
	function ParseLine(sMessage) {

		if(sMessage.substring(0,2) == FCTYPE_LOGIN) {
			document.body.dispatchEvent(new CustomEvent('ma:update-my-name', {'detail': new MFCMessage(sMessage)}));
		}
	
		if(sMessage.substring(0,2) == FCTYPE_CMESG) {
			document.body.dispatchEvent(new CustomEvent('ma:chat-message', {'detail': new MFCMessage(sMessage)}));
		}
		
		if(sMessage.substring(0,2) == FCTYPE_TOKENINC) {
			document.body.dispatchEvent(new CustomEvent('ma:tip', {'detail': new MFCMessage(sMessage)}));
		}

		if(sMessage.substring(0,2) == FCTYPE_DETAILS) {
			document.body.dispatchEvent(new CustomEvent('ma:user-details', {'detail': new MFCMessage(sMessage)}));
		}
		
		if(sMessage.substring(0,2) == FCTYPE_STATUS) {
			document.body.dispatchEvent(new CustomEvent('ma:check-model-changed', {'detail': new MFCMessage(sMessage)}));
		}
		
		
		//call MFC's message handler
		unsafeWindow.mfcParseLine(sMessage);
		
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
		
		/**
		 * Split strings into 100(ish) long string arrays
		 *
		 * Originally By: georg on Stack Overflow
		 * http://stackoverflow.com/questions/16246031/how-do-i-split-a-string-at-a-space-after-a-certain-number-of-characters-in-javas
		 ******************************************************************/
		msg = msg.replace(/.{100}\S*\s+/g, "$&@").split(/\s+@/);
		
		if(settings.send_messages) {
			for(var i=0; i<msg.length;i++) {
				// TODO: ask Kradek about that Chat object (I CAN'T FIND IT!)
				$('#main')[0].contentWindow.$('#message_input').val(msg[i]);
				$('#main')[0].contentWindow.$('#send_button').click();
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
		
		var temp = 0;
		
		if(currentModelName.uid < 100000000) {
			temp = 100000000 + currentModelName.uid;
		} else {
			temp = currentModelName.uid;
		}
		
		ParseLine('50 '+myName.sid+' '+temp+' 0 4 {%22lv%22:2,%22msg%22:%22(Bot Test) '+msg+'%22,%22nm%22:%22'+myName.name+'%22,%22sid%22:'+myName.sid+',%22uid%22:'+myName.uid+',%22vs%22:90,%22u%22:{%22chat_color%22:%22A62A2A%22,%22chat_font%22:8}}');
	}
	
	/**
	 * Generate a fake tip for testing purposes.
	 ******************************************************************/
	function fakeTip(num) {

		var temp = 0;
		
		if(currentModelName.uid < 100000000) {
			temp = 100000000 + currentModelName.uid;
		} else {
			temp = currentModelName.uid;
		}
	
		ParseLine('6 0 '+temp+' 0 0 {%22ch%22:'+temp+',%22flags%22:24832,%22m%22:['+currentModelName.uid+',20153390,%22'+currentModelName.name+'%22],%22sesstype%22:10,%22stamp%22:1477924340,%22tokens%22:'+num+',%22u%22:['+myName.uid+',21590632,%22'+myName.name+'%22]}');
	}
	
	/**
	 * Check if the model has changed, if so fire
	 * the ma:model-changed event
	 ******************************************************************/
	document.body.addEventListener('ma:check-model-changed', function(e) {
		
		/**
		 * I cheat here because sometimes you can navigate to pages like
		 * the MFC homepage where none of the model information is
		 * available.
		 *
		 * TODO: make this smarter so we know if we're actually on the
		 *       home page or some other MFC page that likewise doesn't
		 *       have the model information.
		 ******************************************************************/
		try {
			if(currentModelName.name != unsafeWindow.t.g_hUsers[e.detail.Arg1]["username"]) {
				currentModelName = {
					name: unsafeWindow.t.g_hUsers[e.detail.Arg1]["username"],
					uid: parseInt(e.detail.Arg1)
				};
				document.body.dispatchEvent(new CustomEvent('ma:model-changed', {detail: currentModelName}));
			}
		} catch(err) {
			console.log(err);
			document.body.dispatchEvent(new Event('ma:homepage'));
		}
		
	}, false);
	

	/**
	 * Handle the ma:update-my-name event
	 ******************************************************************/
	document.body.addEventListener('ma:update-my-name', function(e) {
		
		/**
		 * User list isn't alway available when this event is
		 * fire. So we wait for it!
		 ******************************************************************/
		var my_name_interval = setInterval(function() {
			
			if(unsafeWindow.t.g_hUsers[e.detail.Arg2] == undefined)
				return; // awww fuck! here we go again!
			
			// kill the interval
			clearInterval(my_name_interval);
			
			if(myName != unsafeWindow.t.g_hUsers[e.detail.Arg2]["username"]) {
				myName = {
					name: unsafeWindow.t.g_hUsers[e.detail.Arg2]["username"],
					uid: e.detail.Arg2,
					sid: unsafeWindow.t.g_hUsers[e.detail.Arg2]["sessionid"]
				};
			}
			
			debug('MA: my name is - '+myName.name);
			
		}, 1000);
		
	}, false );


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

	return {
		init: init,
		sendMsg: sendMsg,
		fakeTip: fakeTip,
		debug: debug
	};
	
})();

MAssist.init();