<template>
	<p>
		<label v-if="label != ''">{{ label }} 
			<span v-if="!validation.value" class="alert-danger">This must be set!</span>
			<span v-if="maxlength != ''" :class="{'alert-danger': charDanger,'alert-warning': charWarning }">(Chars Remaining: {{ charCount }})</span>
		</label>
		
		<textarea v-if="(type == 'textarea')" ref="inputTextarea" :disabled="validation.disabled" class="form-control" :class="{'alert-danger': !validation.value }" placeholder="Type a game message..." v-bind:value="value" v-on:input="updateValue($event.target.value)"></textarea>
		<input v-if="(type == 'text')" ref="inputText" :disabled="validation.disabled" class="form-control" :class="{'alert-danger': !validation.value }" type="text" v-bind:placeholder="placeholder" v-bind:value="value" v-on:input="updateValue($event.target.value)">
	</p>
</template>

<script>
export default {
	name: 'text-input',
	props: {
		'value': {
			type: String,
			default: ''
		},
		'placeholder': {
			type: String,
			default: 'Enter a placeholder...'
		},
		'label': {
			type: String,
			default: ''
		},
		'type': {
			type: String,
			default: 'text'
		},
		'maxlength': {
			type: String,
			default: ''
		},
		'disabled': {
			type: String,
			default: ''
		}
	},
	
	computed: {
		
		validation: function() {
			
			return {
				value: (this.value != '') ? true : false,
				disabled: (this.disabled != '') ? true : false
			};
			
		},
		charWarning: function() {
			if(this.maxlength != '') {
			
				if((this.value.length > (parseInt(this.maxlength)-30)) && (this.value.length < (parseInt(this.maxlength)-10)))
					return true;
				
			}
			
			return false;
		},
		charDanger: function() {
			if(this.maxlength != '') {
				if(this.value.length > (parseInt(this.maxlength)-11))
					return true;
			}
			
			return false;
			
		},
		charCount: function() {
			if(this.maxlength != '') {
				return (parseInt(this.maxlength) - this.value.length);
			}
		}
		
	},

	mounted: function() {
		if(this.type == 'text') {
			this.$refs.inputText.value = this.value;	
		} else {
			this.$refs.inputTextarea.value = this.value;	
		}
		
	},
	
	methods: {
		
		updateValue: function(value) {
			this.$emit('input', value);
		}
		
	}	
}
</script>