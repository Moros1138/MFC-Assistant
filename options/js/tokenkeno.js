
var MATokenKeno = (function () {
	
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
	
	function init() {
		loadSettings();
	}
	
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

		$('#mark-max-tokens').val(calcMaxTokens());
		
		// Force errors on required number fields that don't contain numbers
		$('#matk-start-number').checkNaN();
		$('#matk-end-number').checkNaN();
		$('#matk-number-of-prizes').checkNaN();
		$('#matk-repost-delay').checkNaN();

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
		
		// re-calculate the max
		$('#mark-max-tokens').val(calcMaxTokens());
		
		// Force errors on required number fields that don't contain numbers
		$('#matk-start-number').checkNaN();
		$('#matk-end-number').checkNaN();
		$('#matk-number-of-prizes').checkNaN();
		$('#matk-repost-delay').checkNaN();
		
	}
	
	/**
	 * Basically a wrapper for console.log that we can control via
	 * our custom settings.
	 ******************************************************************/
	function debug(msg) {
		
		console.log(msg);
		
	}
	
	function calcMaxTokens() {
		
		if(!isNaN(settings.start) && !isNaN(settings.end) && settings.start != null && settings.end != null) {
			
			var total = 0;
			
			for(i=settings.start; i<=settings.end;i++) {
				total += i;
			}
			$('#mark-max-tokens').toggleClass('btn-danger', false);
			return total;
			
		}
		
		$('#mark-max-tokens').toggleClass('btn-danger', true);
		return 'Error: Start or End is not a number';
		
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
		
		running = true;

		$('#matk-start-stop').toggleClass('btn-danger', true);
		$('#matk-start-stop').toggleClass('btn-primary', false);
		$('#matk-start-stop').html('Stop');
		
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

		debug('Keno: stopped and cleared.');
		MAssistOptions.sendMsg('Token Keno has ended.');

		$('#matk-start-stop').toggleClass('btn-primary', true);
		$('#matk-start-stop').toggleClass('btn-danger', false);
		$('#matk-start-stop').html('Start');
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
		if(settings.msg != '') {
			MAssistOptions.sendMsg(settings.msg);
		} else {
			MAssistOptions.sendMsg('Token Keno is running.');
		}
		MAssistOptions.sendMsg('Remaining Numbers: '+output);
		MAssistOptions.sendMsg('There are '+prizes.length+' prizes left!');
		
	}
	
	/* Clear game variabls
	 ******************************************************/
	function clear() {
		
		remaining = [];
		prizes = [];

		debug('Keno: cleared.');
		
	}
	
	
	/* Handle Tip
	 ******************************************************/
	function handleTip(mfcMsg) {
		
		var i;
		
		if(!running)
			return;
		
		// Find and remove item from an array
		i = remaining.indexOf(mfcMsg.tipAmount);
		if(i != -1) {
			
			remaining.splice(i, 1);
			
			i = prizes.indexOf(mfcMsg.tipAmount);
			if(i != -1) {
				
				prizes.splice(i, 1);
				MAssistOptions.sendMsg(mfcMsg.tipAmount+' IS A WINNER! Congrats '+mfcMsg.memberName+'!!');
				repost();
				
			} else {
				
				if( (mfcMsg.Data.tokens >= settings.start) || (mfcMsg.Data.tokens <= settings.end) ) {
					
					MAssistOptions.sendMsg(mfcMsg.tipAmount+' is not a winner, sorry!');
					repost();
					
				}
				
				
			}
			
		}

		if(prizes.length == 0) {
			MAssistOptions.sendMsg('All prizes have been WON!!');
			stop();
			return;
		}
		
		if(remaining.length == 0) {
			MAssistOptions.sendMsg('No more numbers remain!');
			stop();
			return;
		}
		
	}


	$(document).ready(function() {
		
		init();
		
		$('#matk-start-stop').click( function(e) {
			
			if($(this).html() == 'Start') {
				start();
				return;
			}
			
			if($(this).html() == 'Stop') {
				stop();
				return;
			}
			
		});

		$('#matk-repost').click(function(e) {
			repost();
		});
		
		$('body').on('ma:tip', function(e, mfcMsg) { 
			handleTip(mfcMsg);
		});

		$('body').on('ma:ready', function() {
			
			running = false;
			clear();
			
			$('#matk-start-stop').toggleClass('btn-primary', true);
			$('#matk-start-stop').toggleClass('btn-danger', false);
			$('#matk-start-stop').html('Start');
			
		});
		
	});

	return {
		start: start,
		stop: stop,
		repost: repost
	};
	
})();
