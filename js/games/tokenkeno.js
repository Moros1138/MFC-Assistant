
var MATokenKeno = (function () {
	
	var rendered = false;
	
	var remaining = [];
	var prizes = [];
	
	var running = false;
	var repostInterval = null;
	
	var settings = {
		start: 1,
		end: 50,
		prizes: 1,
		repostDelay: 5
	};

	function loadSettings() {
		
		// load settings from local storage
		if(localStorage.maKenoSettings !== undefined) {
			settings = JSON.parse(localStorage.maKenoSettings);
		}
		
		$('#matk-msg-text').val( settings.msg );
		$('#matk-start-number').val( settings.start );
		$('#matk-end-number').val( settings.end );
		$('#matk-number-of-prizes').val( settings.prizes );
		$('#matk-repost-delay').val( settings.repostDelay );

		$('body').on('keyup', '#matk-msg-text', function() {
			updateSettings();
		});

		$('body').on('keyup', '#matk-start-number', function() {
			updateSettings();
		});
		
		$('body').on('keyup', '#matk-end-number', function() {
			updateSettings();
		});

		$('body').on('keyup', '#matk-number-of-prizes', function() {
			updateSettings();
		});

		$('body').on('keyup', '#matk-repost-delay', function() {
			updateSettings();
		});
		
	}
	
	function updateSettings() {
		
		settings = {
			msg: $('#matk-msg-text').val(),
			start: parseInt($('#matk-start-number').val()),
			end: parseInt($('#matk-end-number').val()),
			prizes: parseInt($('#matk-number-of-prizes').val()),
			repostDelay: parseInt($('#matk-repost-delay').val())
		},

		localStorage.maKenoSettings = JSON.stringify(settings);
		
	}

	/* Start Keno
	 ******************************************************/
	function start() {
		
		if( isNaN(settings.start) ) {
			alert('Starting number must be a number!\nAborting token keno!');
			return;
		}
		
		if(isNaN(settings.end)) {
			alert('Starting number must be a number!\nAborting token keno!');
			return;
		}

		if(isNaN(settings.prizes)) {
			alert('Starting number must be a number!\nAborting token keno!');
			return;
		}
		
		for(var i = settings.start; i <= settings.end; i++) {
			remaining.push(i);
		}
		
		var prize;
		
		for(i = 1; i <= settings.prizes; i++) {
			
			var flag = false;
			
			while(!flag) {
				
				prize = Math.floor(Math.random() * (settings.end - settings.start + 1)) + settings.start;
				
				if( prizes.indexOf(prize) == -1 ) {
					
					prizes.push(prize);
					flag = true;
					
				}
				
			}
			
		}
		
		MAssist.sendMsg('Token Keno is now running.');
		
		running = true;

		$('#matk-start-stop').button('option', 'label', 'Stop');
		
		repostInterval = setInterval(function() {
			
			repost();
			
		}, (1000 * 60 * settings.repostDelay));

		repost();
		
	}

	/* Stop Keno
	 ******************************************************/
	function stop() {
		
		running = false;
		
		clear();

		MAssist.debug('Keno: stopped and cleared.');
		MAssist.sendMsg('Token Keno has ended.');

		$('#matk-start-stop').button('option', 'label', 'Start');
		clearInterval(repostInterval);
		
	}


	/* Re-post remaining numbers
	 ******************************************************/
	function repost() {

		if(!running)
			return;
		
		var output = '';
		var runs = [];
		
		var start = -1;
		var end = -1;
		
		for( var i=0; i < remaining.length; i++ ) {
			
			if(start == -1) {
				start = i;
			}
			
			if( i == 0 ) {
				
				// check the before and after
				if((remaining[i+1] != remaining[i]+1)) {
					runs.push({start: remaining[i], end: remaining[i]});
					start = -1;
					end = -1;
					continue;
				}
				
			}
			
			if( i != 0 ) {
				
				// check the before and after
				if((remaining[i-1] != remaining[i]-1) && (remaining[i+1] != remaining[i]+1)) {
					runs.push({start: remaining[i], end: remaining[i]});
					start = -1;
					end = -1;
					continue;
				}
				
				if( remaining[i]-1 == remaining[i-1] ) {
					
					end = i;
					
					if(remaining[i]+1 != remaining[i+1]) {

						runs.push({start: remaining[start], end: remaining[end]});
						
						start = -1;
						end = -1;
						continue;
						
					}
					
				}
				
			}
			
		}

		output = '';
		for(i=0; i< runs.length; i++) {
			
			if(runs[i].start == runs[i].end) {
				output += runs[i].start + ',';
			} else if(runs[i].start+1 == runs[i].end) {
				output += runs[i].start + ',';
				output += runs[i].end + ',';
			} else {
				output += runs[i].start + '-' + runs[i].end + ',';
			}
			
		}
		
		output = output.slice(0, -1);
		
		MAssist.sendMsg(settings.msg);
		MAssist.sendMsg('Remaining Numbers: '+output);
		
	}
	
	/* Clear game variabls
	 ******************************************************/
	function clear() {
		
		remaining = [];
		prizes = [];

		MAssist.debug('Keno: cleared.');
		
	}
	
	
	/* Handle Tip
	 ******************************************************/
	function handleTip(tip) {
		
		var i;
		
		if(!running)
			return;
		
		// Find and remove item from an array
		i = remaining.indexOf(tip[2]);
		if(i != -1) {
			
			remaining.splice(i, 1);
			
			i = prizes.indexOf(tip[2]);
			if(i != -1) {
				
				prizes.splice(i, 1);
				MAssist.sendMsg(tip[2]+' IS A WINNER! Congrats '+tip[1]+'!!');
				
			} else {
				
				if( (tip[2] >= settings.start) || (tip[2] <= settings.end) ) {
					
					MAssist.sendMsg(tip[2]+' is not a winner, sorry!');
					
				}
				
			}
			
		}
		
		if(prizes.length == 0) {
			MAssist.sendMsg('All prizes have been WON!!');
			stop();
			return;
		}
		
		if(remaining.length == 0) {
			MAssist.sendMsg('No more numbers remain!');
			stop();
			return;
		}
		
		repost();
		
	}

	// capture and handle tip events
	$('body').on('ma:tip', function(e, tip) { 
		handleTip(tip);
	});

	$('body').on('ma:model-changed', function() {
		running = false;
		clear();
		$('#matk-start-stop').button('option', 'label', 'Start');
	});

	$('body').on('ma:reset-rendering', function() {
		rendered = false;
		running = false;
		clear();
	});

	$('body').on('ma:renderHTML', function() {
		
		if(rendered)
			return;
	
		$('#ma-games-container').append([
'<h3>Token Keno</h3>',
'<div class="ma-dialog-body">',
	'<fieldset>',
		'<p>',
			'<label>Game Message:</label>',
			'<textarea id="matk-msg-text"></textarea>',
		'</p>',
		'<p>',
			'<label>Start #:</label>',
			'<input type="text" id="matk-start-number">',
		'</p>',
		'<p>',
			'<label>End #:</label>',
			'<input type="text" id="matk-end-number">',
		'</p>',
		'<p id="matk-total"></p>',
		'<p>',
			'<label>Number of Prizes:</label>',
			'<input type="text" id="matk-number-of-prizes">',
		'</p>',
		'<p>',
			'<label>Repost Delay (Minutes):</label>',
			'<input type="text" id="matk-repost-delay">',
		'</p>',
		'<p class="buttons">',
			'<button type="button" class="ui-button ui-widget ui-corner-all" id="matk-start-stop">Start</button> ',
			'<button type="button" class="ui-button ui-widget ui-corner-all" id="matk-repost">Post #s</button>',
		'</p>',
	'</fieldset>',
'</div>'
		].join(''));
		
		rendered = true;
		loadSettings();
		
		
		$('body').on('click', '#matk-start-stop', function(e) {
			
			if($(this).find('.ui-button-text').html() == 'Start') {
				start();
				return;
			}
			
			if($(this).find('.ui-button-text').html() == 'Stop') {
				stop();
				return;
			}
			
		});

		$('body').on('click', '#matk-repost', function(e) {
			repost();
		});
		
	});

	return {
		start: start,
		stop: stop,
		repost: repost
	};
	
})();
