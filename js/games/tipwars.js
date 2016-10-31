
var MATipWars = (function () {
	
	var rendered = false;
	
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
		
	}

	/* Start the Tip War
	 ******************************************************/
	function start() {
		
		var winning = false;
		
		if( settings.use_winning ) {
			
			MAssist.debug("Tipwars: using winning amount.");

			if( isNaN(settings.winning_amount) || settings.winning_amount == 0 ) {
				
				MAssist.debug("Tipwars: ERROR! winning amount not set.");
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

		
		$('#matw-start-stop').button('option', 'label', 'Stop');
	}
	
	/* Stop the Tip War
	 ******************************************************/
	function stop() {
		
		running = false;
		clear();
		
		MAssist.sendMsg('The tip war has been stopped.');
		MAssist.debug('Tipwars: stopped and cleared.');

		$('#matw-start-stop').button('option', 'label', 'Start');
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
				MAssist.sendMsg(settings.msg);
			} else {
				MAssist.sendMsg('A tip war is currently running.');	
			}
			
			MAssist.sendMsg('Tip even numbers for '+settings.team_evens);
			MAssist.sendMsg('Tip odd numbers for '+settings.team_odds);
			
			if(settings.use_winning) {
				MAssist.sendMsg('First team to '+settings.winning_amount+' wins! Good Luck!');
			}
			
			MAssist.sendMsg('Current Score: '+settings.team_evens+': '+even_counter+ ' | '+settings.team_odds+': '+odd_counter);
			
		} else {
			MAssist.sendMsg('Tip even numbers for '+settings.team_evens);
			MAssist.sendMsg('Tip odd numbers for '+settings.team_odds);
			MAssist.sendMsg('Current Score: '+settings.team_evens+': '+even_counter+ ' | '+settings.team_odds+': '+odd_counter);
		}
		
	}
	
	/* Clear game variabls
	 ******************************************************/
	function clear() {
		
		even_counter = 0;
		odd_counter = 0;
		
		MAssist.debug('Tipwars: cleared.');

	}
	
	/* Handle Tip
	 ******************************************************/
	function handleTip(tip) {
		
		if(!running)
			return;
		
		if((tip[2] % 2) == 0) {
			even_counter += tip[2];
		} else {
			odd_counter += tip[2];
		}
		
		MAssist.sendMsg( settings.team_evens+': '+even_counter+ ' - '+settings.team_odds+': '+odd_counter);

		// determine winner?
		if(settings.use_winning && settings.winning_amount > 0) {
			
			if( even_counter >= settings.winning_amount ) {

				MAssist.sendMsg(settings.team_evens+' is the winner!');
				stop();
				
			}
			
			if( odd_counter >= settings.winning_amount ) {
				
				MAssist.sendMsg(settings.team_odds+' is the winner!');
				stop();
				
			}
			
		}
		
	}

	$('body').on('ma:reset-rendering', function() {
		rendered = false;
		running = false;
		clear();
	});

	// capture and handle tip events
	$('body').on('ma:tip', function(e, tip) { 
		handleTip(tip);
	});

	$('body').on('ma:model-changed', function() {
		running = false;
		clear();
		$('#matw-start-stop').button('option', 'label', 'Start');
	});
	
	$('body').on('ma:renderHTML', function() {
		
		if(rendered)
			return;

		$('#ma-games-container').append([
'<h3>Tip War</h3>',
'<div class="ma-dialog-body">',
	'<fieldset>',
		'<p>',
			'<label>Game Message:</label>',
			'<textarea id="matw-msg-text"></textarea>',
		'</p>',
		'<p>',
			'<label>Team Evens:</label>',
			'<input type="text" id="matw-team-evens">',
		'</p>',
		'<p>',
			'<label>Team Odds:</label>',
			'<input type="text" id="matw-team-odds">',
		'</p>',
		'<p>',
			'<label>Use Winning Amount?</label>',
			'<label><input type="radio" name="matw-use-winning-amount" value="yes"> Yes</label>',
			'<label><input type="radio" name="matw-use-winning-amount" value="no"> No</label>',
		'</p>',
		'<p id="matw-winning-amount-container">',
			'<label>Winning Amount:</label>',
			'<input type="text" id="matw-winning-amount">',
		'</p>',
		'<p>',
			'<label>Repost Delay (Minutes):</label>',
			'<input type="text" id="matw-repost-delay">',
		'</p>',
		'<p class="buttons">',
			'<button type="button" class="ui-button ui-widget ui-corner-all" id="matw-start-stop">Start</button> ',
			'<button type="button" class="ui-button ui-widget ui-corner-all" id="matw-repost">Repost</button>',
		'</p>',
	'</fieldset>',
'</div>'
		].join(''));
		
		rendered = true;
		loadSettings();

		$('body').on('click', '#matw-start-stop', function(e) {
			
			if($(this).find('.ui-button-text').html() == 'Start') {
				start();
				return;
			}
			
			if($(this).find('.ui-button-text').html() == 'Stop') {
				stop();
				return;
			}
			
		});

		$('body').on('click', '#matw-repost', function(e) {
			repost();
		});
		
	});

	return {
		start: start,
		stop: stop,
		repost: repost
	};
	
})();
