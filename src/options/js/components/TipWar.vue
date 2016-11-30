<template>
	<div id="tipwar">
		<h1>Tip War</h1>
		<fieldset>
			<text-input type="textarea" :disabled="(running) ? 'disabled' : ''" label="Game Message" placeholder="Type a game message..." maxlength="160" v-model="settings.msg" @input="updateSettings"></text-input>
			<text-input :disabled="(running) ? 'disabled' : ''" label="Team Evens" placeholder="Type the name of Team Evens..." v-model="settings.teamEvens" @input="updateSettings"></text-input>
			<text-input :disabled="(running) ? 'disabled' : ''" label="Team Odds" placeholder="Type the name of Team Odds..." v-model="settings.teamOdds" @input="updateSettings"></text-input>
			<yes-no-input :disabled="(running) ? 'disabled' : ''" name="use-winning" label="Use Winning Amount?" v-model="settings.useWinning" @input="updateSettings"></yes-no-input>
			<number-input :disabled="(running) ? 'disabled' : ''" label="Winning Amount" placeholder="Type in a winning amount..." v-model="settings.winningAmount" @input="updateSettings"></number-input>
			<number-input :disabled="(running) ? 'disabled' : ''" :label="((isDebugMode) ? 'Repost Delay (Seconds)' : 'Repost Delay (Minutes)')" placeholder="Type in the repost delay..." v-model="settings.repostDelay" @input="updateSettings"></number-input>
			<p class="buttons">
				<button type="button" class="btn" :class="(running) ? 'btn-danger' : 'btn-primary'" @click="startStopWar">{{ (running) ? 'Stop' : 'Start' }}</button>
				<button type="button" class="btn btn-info" @click="repost">Repost</button>
			</p>
		</fieldset>
	</div>
</template>

<script>
window.tipWarData = {
	evenCounter: 0,
	oddCounter: 0,
	running: false,
	repostInterval: null,
	settings: {
		msg: 'A war declareth hense!',
		teamOdds: 'Team Odds',
		teamEvens: 'Team Evens',
		useWinning: true,
		winningAmount: 500,
		repostDelay: 5
	}
}

if(localStorage.maTipWarsSettings !== undefined)
	window.tipWarData.settings = morosObjectConformSettings(JSON.parse(localStorage.maTipWarsSettings))

	
export default {
	name: 'tipwar',
	data () {
		
		var _self = this;
		
		if(localStorage.maTipWarsSettings === undefined) {
			// first load? update settings.
			setTimeout(function() {
				_self.updateSettings();	
			}, 1000);
		}
		
		return window.tipWarData;
		
	},
	mounted: function() {
		
		var _self = this;
		
		$('body').on('ma:not-ready', function() {
			if(_self.running) {
				$('body').off('ma:tip', _self.handleTip);
				_self.running = false;
				clearInterval(_self.repostInterval);
				_self.clear();
			}
		});
		
	},
	computed: {
		isDebugMode: function() {
			return window.optionsData.settings.debug_mode;
		}
	},
	methods: {
		
		/**
		 * update settings
		 ******************************************************************/
		updateSettings: function(closing) {
			
			var settings = JSON.parse(JSON.stringify(this.settings));
			morosObjectConformSettings(this.settings);
			this.$nextTick(function() {
				localStorage.maTipWarsSettings = JSON.stringify(settings);
			});
		},
		
		/**
		 * Start/Stop the Tip War
		 ******************************************************************/
		startStopWar: function(e) {
			
			var _self = this;
			
			if(!this.running) {
				
				// no delay?
				if(isNaN(this.settings.repostDelay)) {
					this.settings.repostDelay = 5;
				}
				
				this.running = true;
				$('body').on('ma:tip', this.handleTip);
				
				this.repost();
				
				this.repostInterval = setInterval(function() {
					_self.repost();
				}, (1000 * ((optionsData.settings.debug_mode) ? 1 : 60) * this.settings.repostDelay));
				
			} else {
				
				$('body').off('ma:tip', this.handleTip);
				this.running = false;
				clearInterval(this.repostInterval);
				this.clear();
				
			}

		},

		/**
		 * Clear the Tip War variables
		 ******************************************************************/
		clear: function() {

			this.evenCounter = 0;
			this.oddCounter = 0;
			console.log('Tipwars: cleared.');

		},
		
		/**
		 * Repost the Tip War scores
		 ******************************************************************/
		repost: function(just_score) {
			
			if(just_score == undefined)
				just_score == false;
			
			if(!this.running)
				return;
			
			if(!just_score) {
				
				if(this.settings.msg != '') {
					this.sendMsg(this.settings.msg);
				} else {
					this.sendMsg('A tip war is currently running.');
				}
				
				this.sendMsg('Tip even numbers for '+this.settings.teamEvens);
				this.sendMsg('Tip odd numbers for '+this.settings.teamOdds);
				
				if(this.settings.useWinning) {
					this.sendMsg('First team to '+this.settings.winningAmount+' wins! Good Luck!');
				}
				
				this.sendMsg('Current Score: '+this.settings.teamEvens+': '+this.evenCounter+ ' | '+this.settings.teamOdds+': '+this.oddCounter);
				
			} else {
				this.sendMsg('Tip even numbers for '+this.settings.teamEvens);
				this.sendMsg('Tip odd numbers for '+this.settings.teamOdds);
				this.sendMsg('Current Score: '+this.settings.teamEvens+': '+this.evenCounter+ ' | '+this.settings.teamOdds+': '+this.oddCounter);
			}			
			
		},
		
		handleTip: function(e, mfcMsg) {
			
			if(!this.running)
				return;
				
			if((mfcMsg.tipAmount % 2) == 0) {
				this.evenCounter += mfcMsg.tipAmount;
			} else {
				this.oddCounter += mfcMsg.tipAmount;
			}
			
			MAssistOptions.sendMsg( this.settings.teamEvens+': '+this.evenCounter+ ' - '+this.settings.teamOdds+': '+this.oddCounter);

			// determine winner?
			if(this.settings.useWinning && this.settings.winningAmount > 0) {
				
				if( this.evenCounter >= this.settings.winningAmount ) {

					MAssistOptions.sendMsg(this.settings.teamEvens+' is the winner!');
					this.startStopWar();
					
				}
				
				if( this.oddCounter >= this.settings.winningAmount ) {
					
					MAssistOptions.sendMsg(this.settings.teamOdds+' is the winner!');
					this.startStopWar();
					
				}
				
			}
			
		},
		
		sendMsg: function(msg) {
			MAssistOptions.sendMsg(msg);
		}
		
	},
	components:{
		NumberInput,
		TextInput,
		YesNoInput
	}
}
</script>