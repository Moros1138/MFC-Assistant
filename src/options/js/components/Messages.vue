<template>
	<div id="messages">
		<h1>Messages</h1>
		<div id="saved-messages">
			<draggable element="ul" class="sortable" :list="settings.messages" :options="{handle: '.handle'}" v-on:update="updateSettings">
				<li class="message" v-for="message in settings.messages">
					<div class="handle">{{ message.desc }}</div>
					<div class="buttons">
						<button type="button" title="Edit this message" class="btn btn-sm btn-primary" v-on:click="editMessage">
							<span class="glyphicon glyphicon-cog"></span>
							<span>Edit Message</span>
						</button>
						<button type="button" title="Delete this message" class="btn btn-sm btn-danger" v-on:click="removeMessage(message.id)">
							<span class="glyphicon glyphicon-remove-sign"></span>
							<span>Remove Message</span>
						</button>
						<button type="button" v-bind:title="(message.timer) ? 'Stop this timer': 'Start this timer'" class="btn btn-sm" v-bind:class="(message.timer) ? 'btn-warning' : 'btn-info'" v-on:click="timerToggle(message.id)">
							<span class="glyphicon glyphicon-play"></span>
							<span>{{ (message.timer != false) ? 'Stop Timer' : 'Start Timer' }}</span>
						</button>
						<button type="button" title="Post this message now" class="btn btn-sm btn-info" v-on:click="postNow($event, message.id)">
							<span class="glyphicon glyphicon-send"></span>
							<span>Post Now</span>
						</button>
						<button type="button" v-bind:title="(message.carousel ? 'Remove this message from the carousel.' : 'Add this message to the carousel.')" class="btn btn-sm" v-bind:class="(message.carousel ? 'btn-warning' : 'btn-info')" v-on:click="carouselToggle(message.id)">
							<span class="glyphicon glyphicon-plus"></span>
							<span>{{ (message.carousel) ? 'Remove from Carousel' : 'Add to Carousel' }}</span>
						</button>
					</div>
					<div class="edit-box collapsed">
						<text-input type="text" label="Message Description" placeholder="Type in a short description..." v-model="message.desc" @input="updateSettings"></text-input>
						<text-input type="textarea" label="Message" placeholder="Type in your saved message here..." maxlength="160" v-model="message.msg" @input="updateSettings"></text-input>
						<number-input v-bind:label="((isDebugMode) ? 'Delay Time (Seconds)' : 'Delay Time (Minutes)')" placeholder="Type in the timer delay..." v-model="message.delay" @input="updateSettings"></number-input>
					</div>
				</li>
			</draggable>

			<p style="margin-top: 20px; text-align: center;">
				<button type="button" id="add-message" class="btn btn-sm btn-default" v-on:click="addMessage">
					<span class="glyphicon glyphicon-plus"></span>
					<span>Add Message</span>
				</button>
			</p>
		</div>

		<h1>Message Carousel</h1>
		<fieldset>
			<number-input v-bind:label="((isDebugMode) ? 'Carousel Delay (Seconds)' : 'Carousel Delay (Minutes)')" placeholder="Type in the carousel delay..." v-model="settings.carouselDelay" @input="updateSettings"></number-input>
			<p class="buttons">
				<button type="button" v-bind:title="(running) ? 'Stop the Message Carousel' : 'Start the Message Carousel'" class="btn" v-bind:class="(running) ? 'btn-danger' : 'btn-primary'" v-on:click="startStopCarousel">{{ (running != false) ? 'Stop Carousel' : 'Start Carousel' }}</button>
			</p>
		</fieldset>
	</div><!-- /page -->
</template>


<script>
/**
 * persistant messages data
 ******************************************************************/
window.messagesData = {
	// default settings
	settings: {
		carouselDelay: 5,
		messages: []
	},
	intervals: [],
	carouselTimer: null,
	carouselCurrent: null,
	carouselMessages: [],
	running: false
};

if(localStorage.maSavedMessagesSettings !== undefined)
	window.messagesData.settings = morosObjectConformSettings(JSON.parse(localStorage.maSavedMessagesSettings));

	
/**
 * messages component
 ******************************************************************/
export default {
	name: 'messages',
	/**
	 * data in components need to be functions
	 ******************************************************************/
	data () {
		
		var _self = this;
		
		if(localStorage.maSavedMessagesSettings === undefined) {
			setTimeout(function() {
				_self.updateSettings();
			}, 1000);
		}
		
		return window.messagesData;
		
	},
	computed: {
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
				
				for(var i=0; i<_self.settings.messages.length; i++) {
					clearInterval(_self.settings.messages[i].timer);
					_self.settings.messages[i].timer = false;
				}

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
			
			// kill all active timers from the settings
			for(var i=0; i < settings.messages.length; i++) {
				settings.messages[i].timer = false;
			}
			
			this.$nextTick(function() {
				localStorage.maSavedMessagesSettings = JSON.stringify(settings);
			});
			
		},
		
		/**
		 * Start/Stop the Message Carousel
		 ******************************************************************/
		startStopCarousel: function(e) {
			var _self = this;
			
			if(!this.running) {
				
				// no delay?
				if(isNaN(this.settings.carouselDelay)) {
					this.settings.carouselDelay = 5;
				}
				
				this.running = true;
				this.carousel();
				
				this.carouselInterval = setInterval(function() {
					_self.carousel();
				}, (1000 * ((optionsData.settings.debug_mode) ? 1 : 60) * this.settings.carouselDelay));
				
			} else {
				
				this.running = false;
				this.clear();

				clearInterval(this.carouselInterval);
				
			}

		},

		/**
		 * Clear the Message Carousel variables
		 ******************************************************************/
		clear: function() {
			this.carouselMessages = [];
			this.carouselCurrent = null;
		},

		/**
		 * Carousel
		 ******************************************************************/
		carousel: function() {
			
			if(!this.running)
				return;
			
			if(this.carouselCurrent == null) {
				
				for(var i=0; i < this.settings.messages.length; i++) {
					if( this.settings.messages[i].carousel == true ) {
						this.carouselMessages.push(this.settings.messages[i].id);
					}
				}
				
				this.carouselCurrent = 0;
				
			}
			
			
			if(this.carouselMessages.length == 0) {
				MAssistOptions.dialog(
					'You need to add messages to the carousel in order to run it!',
					'No Messages in Carousel'
				);
				this.startStopCarousel();
			}
			
			var messageIndex = this.getMessageIndex(this.carouselMessages[this.carouselCurrent]);
			if(messageIndex != -1) {
				
				this.sendMsg( this.settings.messages[messageIndex].msg );
				
				this.carouselCurrent++;
				
				if(this.carouselCurrent > this.carouselMessages.length-1)
					this.carouselCurrent = 0;
				
			}
			
		},
		
		/**
		 * Add new message
		 ******************************************************************/
		addMessage: function() {
			
			this.settings.messages.push({
				id: this.getNewId(),
				desc: '',
				msg: '',
				delay: 5,
				carousel: false,
				timer: false
			});
			
			this.$nextTick(function() {
				$('.edit-box').toggleClass('collapsed', true);
				$('.message:last-child .edit-box').toggleClass('collapsed', false);
			});
			
			this.updateSettings();
		},
		
		/**
		 * Edit message
		 ******************************************************************/
		editMessage: function(e) {
			
			var thisEditBox = $((e.target.parentNode.tagName != 'BUTTON') ? e.target : e.target.parentNode).parent().next()[0];
			
			$('.edit-box').each(function() {
				if(this != thisEditBox)
					$(this).toggleClass('collapsed', true);
			});
			
			$(thisEditBox).toggleClass('collapsed');
			
		},
		
		/**
		 * Remove a message
		 ******************************************************************/
		removeMessage: function(id) {
			
			var i = this.getMessageIndex(id);
			
			if(i == -1)
				return;
			
			this.settings.messages.splice(i, 1);
			this.updateSettings();
			
		},
		
		/**
		 * Start/Stop a message's timer
		 ******************************************************************/
		timerToggle: function(id) {
			
			var i = this.getMessageIndex(id);
			var _self = this;
			
			if(i == -1)
				return;
			
			if( this.settings.messages[i].timer == false) {
				
				_self.sendMsg(_self.settings.messages[i].msg);
				
				this.settings.messages[i].timer = setInterval(function() {
					
					_self.sendMsg(_self.settings.messages[i].msg);
					
				}, (1000 * ((optionsData.settings.debug_mode) ? 1 : 60) * _self.settings.messages[i].delay));
				
			} else {
				
				clearInterval(this.settings.messages[i].timer);
				this.settings.messages[i].timer = false;
				
			}
			
			this.updateSettings();
			
		},
		
		/**
		 * Post a message now
		 ******************************************************************/
		postNow: function(e, id) {
			
			var i = this.getMessageIndex(id);
			
			if(i == -1)
				return;
			
			this.sendMsg(this.settings.messages[i].msg);
			
		},

		/**
		 * Add/Remove a message from the carousel
		 ******************************************************************/
		carouselToggle: function(id) {
			
			if(this.running) {
				alert('The Message Carousel is Running!\nPlease stop it before making these changes!');
				return;
			}
				
			
			var i = this.getMessageIndex(id);
			
			if(i == -1)
				return;
			
			if(this.settings.messages[i].carousel == true) {
				this.settings.messages[i].carousel = false;
			} else {
				this.settings.messages[i].carousel = true;
			}
			
			this.updateSettings();
			
		},
		
		/**
		 * Get a new message id
		 ******************************************************************/
		sendMsg: function(msg) {
			MAssistOptions.sendMsg(msg);
		},
		
		/**
		 * Get a new message id
		 ******************************************************************/
		getNewId: function() {

			var ids = [];
			
			for(var i=0; i < this.settings.messages.length; i++) {
				ids.push(this.settings.messages[i].id);
			}
			
			if(ids.length > 0) {
				return Math.max.apply(null, ids) + 1;
			}
			
			return 1;
			
		},
			
		/**
		 * Get message by id
		 ******************************************************************/
		getMessageIndex: function(id) {
			for(var i=0; i<this.settings.messages.length; i++) {
				if(this.settings.messages[i].id == id) {
					return i;
				}
			}
			return -1;
		}
	
	},
	components: {
		TextInput,
		NumberInput
	}
	
}
</script>
