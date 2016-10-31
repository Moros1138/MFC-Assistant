//polyfill for unsafeWindow on Chrome
if (navigator.userAgent.match(/chrome/i)) {
    unsafeWindow = (function () {
        var el = document.createElement('p');
        el.setAttribute('onclick', 'return window;');
        return el.onclick();
    } ());
}

var MAssist = (function () {
	
	var modelChangedCounter = 0;
	var mfcLoadPlayer;
	
	var settingsInterval = null;
	var renderInterval = null;

	var rendered = false;
	
	// flag used to determine if we're parsing messages
	var parsing = false;
	
	// regex
	var tipRegex = '';
	
	var settings = {
		debug_mode: true,
		send_messages: false,
		theme: 'ui-darkness'
	}
	
	setTimeout(function () {
		mfcLoadPlayer = unsafeWindow.LoadPlayer;
		unsafeWindow.LoadPlayer = myLoadPlayer;
	}, 500);		

	function myLoadPlayer(sAction, hOptions) {
		
		var modelId = hOptions ? hOptions['broadcaster_id'] : location.search.match(/broadcaster_id=(\d+)/)[1];
		mfcLoadPlayer(sAction, hOptions);
		modelChanged(hOptions ? hOptions['broadcaster_id'] : null);
		
	}
	
	function modelChanged(modelId) {

		if (undefined !== unsafeWindow.t.g_hLoungeIds[modelId] || null == modelId) {

			// forece remove html
			$('#ma-dialog').remove();
			$('#ma-open').remove();
			
			// reset rendering
			$('body').trigger('ma:reset-rendering');
			rendered = false;
			return;
			
		}
		
		$('body').trigger('ma:model-changed');

		// try to render our html
		renderInterval = setInterval( function() {
			
			renderHTML();
			if(rendered)
				clearInterval(renderInterval);
			
		}, 1000);
		
		currentModelName = unsafeWindow.t.g_hUsers[modelId]["username"];
		tipRegex = "(.[^:]+) has tipped $$model$$ (.*) tokens.".replace("$$model$$", currentModelName);
		killRegex = "^the soap is a lye$";
		
		//setup the parser
		var chatboxInterval = setInterval(function() {
			
			if($('#chat_box').length == 0)
				return;
			
			clearInterval(chatboxInterval);

			$('#chat_box').on('DOMNodeInserted', function() {
				
				if(parsing)
					return;
				
				parsing = true;
				
				// grab all chat messages we haven't processed
				$('#chat_box span.chat:not(.processed)').each(function() {
					
					var msg = $(this).html();
					
					// parse msg for tips
					var tip = msg.match(tipRegex);
					
					//is this a tip?
					if( tip && ($(this).hasClass('chat_system')) ) {
						
						// make sure the tip amount is an integer
						tip[2] = parseInt(tip[2]);
						
						// check for tip message
						if( $(this).find('.tipMsg').length > 0 ) {
							tip[3] = $(this).find('.tipMsg').html();
						} else {
							tip[3] = 'no message';
						}
						
						$('body').trigger('ma:tip', [ tip ] );
						
					}
					
					// parse msg for chat commands
					//var chat = msg.match(chat_regex);
					
					$(this).toggleClass('processed', true);
					
				});

				parsing = false;
				
			});
			
		}, 1000 );
		
	}
	
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
		
		$('#ma-theme-select').val(settings.theme);
		
		$("#ma-jquery-ui").attr("href", $("#ma-jquery-ui").data('theme-path')+settings.theme+"/jquery-ui.min.css");
		$("#ma-jquery-ui-theme").attr("href", $("#ma-jquery-ui-theme").data('theme-path')+settings.theme+"/theme.css");

		$('body').on('click', 'input[name="ma-debug-mode"]', function() {
			updateSettings();
		});

		$('body').on('click', 'input[name="ma-send-messages"]', function() {
			updateSettings();
		});

		$('body').on('change', '#ma-theme-select', function() {
			
			updateSettings();
			
			$("#ma-jquery-ui").attr("href", $("#ma-jquery-ui").data('theme-path')+settings.theme+"/jquery-ui.min.css");
			$("#ma-jquery-ui-theme").attr("href", $("#ma-jquery-ui-theme").data('theme-path')+settings.theme+"/theme.css");
			
		});
		
	}
	
	function updateSettings() {
		
		settings = {
			debug_mode: ($('input[name=ma-debug-mode]:checked').val() == 'yes') ? true : false,
			send_messages: ($('input[name=ma-send-messages]:checked').val() == 'yes') ? true : false,
			theme: $('#ma-theme-select').val()
		};

		localStorage.maSettings = JSON.stringify(settings);
		
	}

	function renderHTML() {
		
		if(rendered)
			return;
		
		if($('#chat_box').length == 0)
			return;
		
		$('#chat_box').prepend([
			'<button type="button" id="ma-open" class="ma-buttons">MFC Assistant</button> '
		].join(''));

		$('body').find('#chat_box').prepend([

'<div id="ma-dialog" title="Myfreecams Assistant">',
	
	'<div id="ma-tabs">',
		'<ul>',
			'<li><a href="#ma-options">Options</a></li>',
			'<li><a href="#ma-games">Games</a></li>',
			'<li><a href="#ma-about">About</a></li>',
		'</ul>',

		'<div class="ma-tab" id="ma-options">',
			'<div class="ma-dialog-body">',
				'<fieldset id="ma-fake-tips">',
					'<legend>Fake Tip</legend>',
					'<p>',
						'<label>Amount:</label>',
						'<input type="text" id="ma-fake-tip-amount">',
					'</p>',
					'<p class="buttons">',
						'<button type="button" class="ui-button ui-widget ui-corner-all" id="ma-fake-tip-button">Fake Tip</button>',
					'</p>',
				'</fieldset>',
				'<fieldset id="ma-send-msg">',
					'<legend>Send Message</legend>',
					'<p>',
						'<label>Message:</label>',
						'<textarea id="ma-send-msg-text"></textarea>',
					'</p>',
					'<p class="buttons">',
						'<button class="ui-button ui-widget ui-corner-all" id="ma-send-msg-button">Send Message</button>',
					'</p>',
				'</fieldset>',
				'<fieldset id="ma-debug-options">',
					'<legend>Misc Options</legend>',
					'<p>',
						'<label>Theme:</label>',
						'<select id="ma-theme-select">',
							'<option value="blitzer">Blitzer</option>',
							'<option value="cupertino">Cupertino</option>',
							'<option value="dark-hive">Dark Hive</option>',
							'<option value="eggplant">Eggplant</option>',
							'<option value="excite-bike">Excite Bike</option>',
							'<option value="flick">Flick</option>',
							'<option value="hot-sneaks">Hot Sneaks</option>',
							'<option value="humanity">Humanity</option>',
							'<option value="le-frog">LE Frog</option>',
							'<option value="mint-choc">Mint Choc</option>',
							'<option value="overcast">Overcast</option>',
							'<option value="pepper-grinder">Pepper Grinder</option>',
							'<option value="redmond">Redmond</option>',
							'<option value="smoothness">Smoothness</option>',
							'<option value="south-street">South Street</option>',
							'<option value="start">Start</option>',
							'<option value="sunny">Sunny</option>',
							'<option value="swanky-purse">Swanky Purse</option>',
							'<option value="trontastic">Trontastic</option>',
							'<option value="ui-darkness">UI Darkness</option>',
							'<option value="ui-lightness">UI Lightness</option>',
							'<option value="vader">Vader</option>',
						'</select>',
					'</p>',
				'</fieldset>',
				'<fieldset id="ma-debug-options">',
					'<legend>Debug Options</legend>',
					'<p>',
						'<label>Send Debug Info to Console:</label>',
						'<label><input type="radio" name="ma-debug-mode" value="yes"> Yes</label>',
						'<label><input type="radio" name="ma-debug-mode" value="no"> No</label>',
					'</p>',
					'<p>',
						'<label>Send Messages Publicly:</label>',
						'<label><input type="radio" name="ma-send-messages" value="yes"> Yes</label>',
						'<label><input type="radio" name="ma-send-messages" value="no"> No</label>',
					'</p>',
				'</fieldset>',
			'</div><!-- #ma-options-container -->',
		'</div><!-- #ma-options -->',

		
		'<div class="ma-tab" id="ma-games">',
			'<div id="ma-games-container">',
			'</div><!-- #ma-games-container -->',
		'</div><!-- #ma-games -->',		

		'<div class="ma-tab" id="ma-about">',
			'<h2 style="text-align: center;">Welcome to the Myfreecams Assistant</h2>',
			'<p>PLACEHOLDER: I have a long story to tell here.</p>',
			'<p>Shout out to KradekMFC for his work on the MFC Assistant userscript on github (this work is based, however loosely, on that)</p>',
		'</div><!-- #ma-about -->',		
	
	'</div><!-- #ma-tabs -->',
	
'</div><!-- #ma-dialog -->'
		].join(''));

		$('body').trigger('ma:renderHTML');
		
		rendered = true;
		loadSettings();
		
	}

	function debug(msg) {
		
		if(settings.debug_mode)
			console.log(msg);
		
	}
	
	function sendMsg(msg) {
		
		/*
			Solution for splitting long text at spaces.
			http://stackoverflow.com/questions/16246031/how-do-i-split-a-string-at-a-space-after-a-certain-number-of-characters-in-javas
		*/
		msg = msg.replace(/.{100}\S*\s+/g, "$&@").split(/\s+@/);

		if(settings.send_messages) {
			for(var i=0; i<msg.length;i++) {
				$('#message_input').val(msg[i]);
				$('#send_button').click();
			}
		} else {
			for(var i=0; i<msg.length;i++) {
				fakeMsg(msg[i]);
			}
		}
		
		if(settings.debug_mode)
			debug(msg);
		
	}

	function fakeMsg(msg) {
		$('#chat_box #chat_contents').append('<div class="chat_queue_buffer"><div class="chat_container"><img style="border-radius:2px;margin-right:3px;" src="https://img.mfcimg.com/photos2/162/16212199/avatar.20x20.jpg" class="tiny_avatar_border" height="16" width="16"><a href="#" style="text-decoration:none;"><span class="name_premium name_self" style="text-decoration:none;font-family:Palatino Linotype, Book Antiqua;color:#A62A2A ! important;font-weight:bold;">Moros1138 (TestBot):</span></a> <span class="chat   chat_premium  chat_self     " style="font-family:Palatino Linotype, Book Antiqua;color:#A62A2A ! important;font-weight:bold;"> '+msg+' </span>	</div></div>');
		$('.chat_contents').scrollTop( $('.chat_contents')[0].scrollHeight );	
	}
	
	function fakeTip(num) {
		$('#chat_box #chat_contents').append('<div class="chat_queue_buffer"><div class="chat_container " data-stamp="1477648084783" data-user_id="13369694"><span class="chat   chat_system  chat_[object Object]     " style="color:#008000;background-color:#FFFF00;"> Moros1138 has tipped '+currentModelName+' '+num+' tokens. </span></div></div>');
		$('.chat_contents').scrollTop( $('.chat_contents')[0].scrollHeight );	
	}

	// Basically, this is our real document ready.
	$('body').on('ma:renderHTML', function() {
		
		// Fake Tip
		$('body').on('click', '#ma-fake-tip-button', function(e) {
			var tip_amount = parseInt($('body').find('#ma-fake-tip-amount').val());
			if(!isNaN(tip_amount)) {
				fakeTip(tip_amount);
			}
		});

		// Send Message
		$('body').on('click', '#ma-send-msg-button', function(e) {
			sendMsg($('#ma-send-msg-text').val());
		});
		
	});
	
	return {
		sendMsg: sendMsg,
		fakeTip: fakeTip,
		debug: debug
	};
	
})();
