<template>
	<div id="options">
		<h1>Options</h1>
		<fieldset>
			<yes-no-input name="debug-mode" label="Debug Mode?" v-model="settings.debug_mode" @input="updateSettings"></yes-no-input>
			<yes-no-input name="send-messages" label="Public Mode?" v-model="settings.send_messages" @input="updateSettings"></yes-no-input>
		</fieldset>
	</div>
</template>

<script>
window.optionsData = {
	settings: {
		debug_mode: true,
		send_messages: false		
	}
}

if(localStorage.maSettings !== undefined)
	window.optionsData.settings = JSON.parse(localStorage.maSettings);

export default {
	name: 'options',
	data () {

		var _self = this;

		if(localStorage.maSettings === undefined) {
			setTimeout(function() {
				_self.updateSettings();	
			}, 1000);
		}	
		
		return window.optionsData;
		
	},
	
	methods: {
		
		/**
		 * update settings
		 ******************************************************************/
		updateSettings: function(closing) {

			var settings = JSON.parse(JSON.stringify(this.settings))
			
			this.$nextTick(function() {
				localStorage.maSettings = JSON.stringify(settings)
				$('body').trigger('ma:update-settings');
			})

		}
		
	},
	components:{
		YesNoInput
	}	
}
</script>
