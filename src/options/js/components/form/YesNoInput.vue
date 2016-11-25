<template>
	<div v-if="validation.label">
		<label>{{ label }}</label>
		<p style="padding-left: 20px;">
			<label class="custom-control custom-radio">
				<input ref="inputTrue" type="radio" :name="name" class="custom-control-input" value="true" :checked="(val) ? 'checked' : ''" @click="updateValue($event.target.value)">
				<span class="custom-control-indicator"></span>
				<span class="custom-control-description">Yes</span>
			</label>
			<label class="custom-control custom-radio">
				<input ref="inputFalse" type="radio" :name="name" class="custom-control-input" value="false" :checked="(!val) ? 'checked' : ''" @click="updateValue($event.target.value)">
				<span class="custom-control-indicator"></span>
				<span class="custom-control-description">No</span>
			</label>
		</p>
	</div>
</template>

<script>
export default {
	name: 'yes-no-input',

	props: {
		'name': {
			type: String,
			default: ''
		},
		'value': {
			default: ''
		},
		'label': {
			type: String,
			default: ''
		}
	},
	
	computed: {
		
		val: function() {
			
			// if we were given a boolean, return it without checking
			if(typeof(this.value) === "boolean"){
				return this.value;
			}
			
			if( this.value == 'true' ) {
				return true;
			}
			
			if( this.value == 'false' ) {
				return false;
			}
			
			return false;
			
		},
		
		validation: function() {

			return {
				value: (this.value != '') ? true : false,
				label: (this.label != '') ? true : false,
				name: (this.name != '') ? true : false
			};
			
		}
		
	},

	methods: {
		
		updateValue: function(value) {
			
			if(typeof(value) === "boolean") {
				this.$emit('input', value);
				return;
			}
			
			if(value == 'true') {
				this.$emit('input', true);
				return;
			}
			
			if(value == 'false') {
				this.$emit('input', false);
				return;
			}
			
		}
		
	}

}
</script>
