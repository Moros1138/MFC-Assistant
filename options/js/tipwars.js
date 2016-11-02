
var MATipWars = (function() {
	
	var even_counter = 0;
	var odd_counter = 0;
	
	var running = false;
	var repostInterval = null;
	
	var settings = {
		team_odds: 'Team Odds',
		team_evens: 'Team Evens',
		use_winning: true,
		winning_amount: 500,
		repostDelay: 5
	};

	function init() {
		loadSettings();
	}
	
	function loadSettings() {
		
		// load settings from local storage
		if(localStorage.maTipWarsSettings !== undefined) {
			settings = JSON.parse(localStorage.maTipWarsSettings);
		}
		
		$('#matw-msg-text').val( settings.msg );
		$('#matw-team-odds').val( settings.team_odds );
		$('#matw-team-evens').val( settings.team_evens );
		
		$('input[name="matw-use-winning-amount"]').each( function(e) {
			
			if($(this).val() == 'yes' && settings.use_winning)
				$(this).prop('checked', true);
			
			if($(this).val() == 'no' && !settings.use_winning)
				$(this).prop('checked', true);

		});

		$('#matw-winning-amount').val( settings.winning_amount );
		$('#matw-repost-delay').val( settings.repostDelay );

		// Force errors on required number fields that don't contain numbers
		$('#matw-winning-amount').checkNaN();
		$('#matw-repost-delay').checkNaN();

		$('body').on('keyup', '#matw-msg-text', function() {
			updateSettings();
		});
		
		$('body').on('keyup', '#matw-team-odds', function() {
			updateSettings();
		});
		
		$('body').on('keyup', '#matw-team-evens', function() {
			updateSettings();
		});
		
		$('body').on('click', 'input[name="matw-use-winning-amount"]', function() {
			updateSettings();
		});

		$('body').on('keyup', '#matw-winning-amount', function() {
			updateSettings();
		});
		
		$('body').on('keyup', '#matw-repost-delay', function() {
			updateSettings();
		});
		
	}
	
	function updateSettings() {
		
		settings = {
			msg: $('#matw-msg-text').val(),
			team_odds: ( $('#matw-team-odds').val() != '' ) ? $('#matw-team-odds').val() : 'Team Odds',
			team_evens: ( $('#matw-team-evens').val() != '' ) ? $('#matw-team-evens').val() : 'Team Evens',
			use_winning:  ($('input[name=matw-use-winning-amount]:checked').val() == 'yes') ? true : false,
			winning_amount: parseInt($('#matw-winning-amount').val()),
			repostDelay: parseInt($('#matw-repost-delay').val())
		};
		
		localStorage.maTipWarsSettings = JSON.stringify(settings);
		
		$('#matw-winning-amount').checkNaN();
		$('#matw-repost-delay').checkNaN();
		
	}

	/**
	 * Basically a wrapper for console.log that we can control via
	 * our custom settings.
	 ******************************************************************/
	function debug(msg) {
		
		console.log(msg);
		
	}

	/* Start the Tip War
	 ******************************************************/
	function start() {
		
		var winning = false;
		
		if( settings.use_winning ) {
			
			debug("Tipwars: using winning amount.");

			if( isNaN(settings.winning_amount) || settings.winning_amount == 0 ) {
				
				debug("Tipwars: ERROR! winning amount not set.");
				alert('Winning amount must be a number!\nAborting tip war!');
				return;
				
			}
			
			winning = true;
			
		}

		running = true;
		
		repost();
		
		if(isNaN(settings.repostDelay)) {
			settings.repostDelay = 5;
		}
		
		repostInterval = setInterval(function() {
			
			repost(true);
			
		}, (1000 * 60 * settings.repostDelay));

		
		$('#matw-start-stop').toggleClass('btn-danger', true);
		$('#matw-start-stop').toggleClass('btn-primary', false);
		$('#matw-start-stop').html('Stop');

	}
	
	/* Stop the Tip War
	 ******************************************************/
	function stop() {
		
		running = false;
		clear();
		
		MAssistOptions.sendMsg('The tip war has been stopped.');
		debug('Tipwars: stopped and cleared.');

		$('#matw-start-stop').toggleClass('btn-danger', false);
		$('#matw-start-stop').toggleClass('btn-primary', true);
		$('#matw-start-stop').html('Start');

		clearInterval(repostInterval);
		
	}

	
	/* Re-post the Tip War
	 ******************************************************/
	function repost(just_score) {
		
		if(just_score == undefined) {
			just_score == false;
		}
		
		if(!running)
			return;
		
		if(!just_score) {
			
			if(settings.msg != '') {
				MAssistOptions.sendMsg(settings.msg);
			} else {
				MAssistOptions.sendMsg('A tip war is currently running.');	
			}
			
			MAssistOptions.sendMsg('Tip even numbers for '+settings.team_evens);
			MAssistOptions.sendMsg('Tip odd numbers for '+settings.team_odds);
			
			if(settings.use_winning) {
				MAssistOptions.sendMsg('First team to '+settings.winning_amount+' wins! Good Luck!');
			}
			
			MAssistOptions.sendMsg('Current Score: '+settings.team_evens+': '+even_counter+ ' | '+settings.team_odds+': '+odd_counter);
			
		} else {
			MAssistOptions.sendMsg('Tip even numbers for '+settings.team_evens);
			MAssistOptions.sendMsg('Tip odd numbers for '+settings.team_odds);
			MAssistOptions.sendMsg('Current Score: '+settings.team_evens+': '+even_counter+ ' | '+settings.team_odds+': '+odd_counter);
		}
		
	}
	
	/* Clear game variabls
	 ******************************************************/
	function clear() {
		
		even_counter = 0;
		odd_counter = 0;
		
		debug('Tipwars: cleared.');

	}
	
	/* Handle Tip
	 ******************************************************/
	function handleTip(mfcMsg) {
		
		if(!running)
			return;

		/*
			request.mfcMsg.Data.m[2]   == model name
			request.mfcMsg.Data.tokens == tip amount
			request.mfcMsg.Data.u[2]   == member name
			request.mfcMsg.Data.msg    == tip note
		*/
		
		if((mfcMsg.Data.tokens % 2) == 0) {
			even_counter += mfcMsg.Data.tokens;
		} else {
			odd_counter += mfcMsg.Data.tokens;
		}
		
		MAssistOptions.sendMsg( settings.team_evens+': '+even_counter+ ' - '+settings.team_odds+': '+odd_counter);

		// determine winner?
		if(settings.use_winning && settings.winning_amount > 0) {
			
			if( even_counter >= settings.winning_amount ) {

				MAssistOptions.sendMsg(settings.team_evens+' is the winner!');
				stop();
				
			}
			
			if( odd_counter >= settings.winning_amount ) {
				
				MAssistOptions.sendMsg(settings.team_odds+' is the winner!');
				stop();
				
			}
			
		}
		
	}
	
	$(document).ready(function() {
	
		init();
		
		$('body').on('ma:tip', function(e, mfcMsg) {
			handleTip(mfcMsg);
		});
		
		$('#matw-start-stop').click(function(e) {

			if($(this).html() == 'Start') {
				start();
				return;
			}
			
			if($(this).html() == 'Stop') {
				stop();
				return;
			}
			
		});

		$('#matw-repost').click(function(e) {
			repost();
		});
		
	});

	return {
		start: start,
		stop: stop,
		repost: repost
	};
	
})();
