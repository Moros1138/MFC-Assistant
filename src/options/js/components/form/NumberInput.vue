<template>
	<p>
		<label v-if="label != ''">{{ label }} <span v-if="!validation.value" class="alert-danger">This must be a number!</span></label>
		<input ref="input" class="form-control" :class="{'alert-danger': !validation.value }" type="text" v-bind:placeholder="placeholder" v-bind:value="value" v-on:input="updateValue($event.target.value)">
	</p>	
</template>

<script>
export default {
	name: 'number-input',
	props: {
		'value': {
			default: '0'
		},
		'placeholder': {
			type: String,
			default: 'Enter a string...'
		},
		'label': {
			type: String,
			default: ''
		}
	},
	
	computed: {
		
		validation: function() {
			
			return {
				value: (this.value == '') ? false : this.conform(this.value)
			};
			
		}
		
	},

	mounted: function() {
		this.$refs.input.value = this.value;
	},
	
	methods: {
		
		updateValue: function(value) {
			
			this.$emit('input', value);
				
		},
		
		conform: function(value) {
			
			return /^-?[\d.]+(?:e-?\d+)?$/.test(value);
			
		}
		
	}
}
</script>
