<template>
	<div id="tokenkeno">
		<h1>Token Keno</h1>
		<fieldset>
			<text-input type="textarea" label="Game Message" placeholder="Type a game message..." maxlength="160" v-model="settings.msg" @input="updateSettings"></text-input>
			<number-input label="Start #" placeholder="Type in a winning amount..." v-model="settings.start" @input="updateSettings"></number-input>
			<number-input label="End #" placeholder="Type the ending number..." v-model="settings.end" @input="updateSettings"></number-input>
			<p>
				<label>Maximum (If all numbers are tipped):</label>
				<input class="form-control" type="text" :value="calculateMax" disabled>
			</p>
			<number-input label="Number of Prizes" placeholder="Type the number of prizes..." v-model="settings.prizes" @input="updateSettings"></number-input>
			<number-input v-bind:label="((isDebugMode) ? 'Repost Delay (Seconds)' : 'Repost Delay (Minutes)')" placeholder="Type in the repost delay..." v-model="settings.repostDelay" @input="updateSettings"></number-input>
			<p class="buttons">
				<button type="button" class="btn" v-bind:class="(running) ? 'btn-danger' : 'btn-primary'" @click="startStopTokenKeno">{{ (running) ? 'Stop' : 'Start' }}</button>
				<button type="button" class="btn btn-info" @click="repost">Repost</button>
			</p>
		</fieldset>
	</div>
</template>

<script>
/**
 * persistent token keno data
 ******************************************************************/
window.tokenKenoData = {
	remaining: [],
	prizes: [],
	
	running: false,
	repostInterval: null,
	
	settings: {
		msg: 'Token Keno is running!',
		start: 1,
		end: 50,
		prizes: 1,
		repostDelay: 5
	}
}

if(localStorage.maKenoSettings !== undefined)
	window.tokenKenoData.settings = morosObjectConformSettings(JSON.parse(localStorage.maKenoSettings));

/**
 * token keno component
 ******************************************************************/
export default {
	name: 'tokenkeno',
	data () {

		var _self = this;
		
		if(localStorage.maKenoSettings === undefined) {
			// first load? update settings.
			setTimeout(function() {
				_self.updateSettings();	
			}, 1000);
		}
		
		return window.tokenKenoData;
		
	},
	computed: {
		
		calculateMax: function() {
			
			var total = 0;
			var start = parseInt(this.settings.start);
			var end = parseInt(this.settings.end)
			
			for(var i = start; i <= end; i++) {
				
				total += i;
				
			}
			
			return total;
			
		},
		isDebugMode: function() {
			return window.optionsData.settings.debug_mode;
		}
		
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
	methods: {

		/**
		 * update settings
		 ******************************************************************/
		updateSettings: function(closing) {
			
			var settings = JSON.parse(JSON.stringify(this.settings));
			morosObjectConformSettings(this.settings);
			this.$nextTick(function() {
				localStorage.maKenoSettings = JSON.stringify(settings);
			});
			
		},

		isDebugMode: function() {
			return optionsData.settings.debug_mode;
		},
		
		/**
		 * Start/Stop the Token Keno
		 ******************************************************************/
		startStopTokenKeno: function(e) {
		
			var _self = this;
		
			if(!this.running) {
				
				for(var i = this.settings.start; i <= this.settings.end; i++) {
					this.remaining.push(i);
				}
				
				var prize;
				
				for(i = 1; i <= this.settings.prizes; i++) {
					
					var flag = false;
					
					while(!flag) {
						
						prize = Math.floor(Math.random() * (this.settings.end - this.settings.start + 1)) + this.settings.start;
						
						if( this.prizes.indexOf(prize) == -1 ) {
							
							this.prizes.push(prize);
							flag = true;
							
						}
						
					}
					
				}
				
				if(this.prizes.length == 0) {
					MAssistOptions.dialog(
						'You need to set the number of prizes!',
						'No prizes!'
					);
					return;
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
				this.clear();
				
				this.sendMsg('Token Keno has ended.');
				clearInterval(this.repostInterval);				
				
			}
		
		},
		
		/**
		 * Repost the Token Keno scores
		 ******************************************************************/
		repost: function() {
			
			if(!this.running)
				return;
			
			var output = '';
			var runs = [];
			
			var start = -1;
			var end = -1;
			
			for( var i=0; i < this.remaining.length; i++ ) {
				
				if(start == -1) {
					start = i;
				}
				
				if( i == 0 ) {
					
					// check the before and after
					if((this.remaining[i+1] != this.remaining[i]+1)) {
						runs.push({start: this.remaining[i], end: this.remaining[i]});
						start = -1;
						end = -1;
						continue;
					}
					
				}
				
				if( i != 0 ) {
					
					// check the before and after
					if((this.remaining[i-1] != this.remaining[i]-1) && (this.remaining[i+1] != this.remaining[i]+1)) {
						runs.push({start: this.remaining[i], end: this.remaining[i]});
						start = -1;
						end = -1;
						continue;
					}
					
					if( this.remaining[i]-1 == this.remaining[i-1] ) {
						
						end = i;
						
						if(this.remaining[i]+1 != this.remaining[i+1]) {

							runs.push({start: this.remaining[start], end: this.remaining[end]});
							
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
			if(this.settings.msg != '') {
				this.sendMsg(this.settings.msg);
			} else {
				this.sendMsg('Token Keno is running.');
			}
			this.sendMsg('Remaining Numbers: '+output);
			this.sendMsg('There are '+this.prizes.length+' prizes left!');			
		},
		
		/**
		 * clear game variables
		 ******************************************************************/
		clear: function() {
		
			this.remaining = [];
			this.prizes = [];

			console.log('Keno: cleared.');
			
		},
		
		/**
		 * handle tips
		 ******************************************************************/
		handleTip: function(e, mfcMsg) {
			
			var i;
			
			if(!this.running)
				return;
			
			// Find and remove item from an array
			i = this.remaining.indexOf(mfcMsg.tipAmount);
			
			if(i != -1) {
				
				this.remaining.splice(i, 1);
				
				i = this.prizes.indexOf(mfcMsg.tipAmount);
				if(i != -1) {
					
					this.prizes.splice(i, 1);
					this.sendMsg(mfcMsg.tipAmount+' IS A WINNER! Congrats '+mfcMsg.memberName+'!!');
					this.repost();
					
				} else {
					
					if( (mfcMsg.tipAmount >= this.settings.start) || (mfcMsg.tipAmount <= this.settings.end) ) {
						
						this.sendMsg(mfcMsg.tipAmount+' is not a winner, sorry!');
						this.repost();
						
					}
					
					
				}
				
			}

			if(this.prizes.length == 0) {
				this.sendMsg('All prizes have been WON!!');
				this.startStopTokenKeno();
				return;
			}
			
			if(this.remaining.length == 0) {
				this.sendMsg('No more numbers remain!');
				this.startStopTokenKeno();
				return;
			}
			
		},
		
		sendMsg: function(msg) {
			MAssistOptions.sendMsg(msg);
		}
		
	},
	components: {
		TextInput,
		NumberInput
	}
	
}	
</script>
