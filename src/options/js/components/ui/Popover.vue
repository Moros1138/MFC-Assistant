<template>
	<div v-if="show" :class="['popover',placement]" :transition="effect">
		<div class="arrow"></div>
		<h3 class="popover-title" v-if="title">
			<slot name="title">{{title}}</slot>
		</h3>
		<div class="popover-content">
			<slot name="content">{{content}}</slot>
		</div>
	</div>
</template>

<script>
export default {
	name: 'popover',
	data () {
		return {
			position: {
				top: 0,
				left: 0
			},			
			show: false
		}
	},
	props: {
		content: {
			type: String
		},
		effect: {
			type: String
		},
		placement: {
			type: String
		},
		title: {
			type: String
		},
		trigger: {
			type: String
		}
	},
	methods: {
		toggle: function() {
			
			if (!(this.show = !this.show)) { return }
			setTimeout(() => {
				
				const popover = $(this.$el)[0]
				const trigger = $(this.$el).next()[0]
				
				switch (this.placement) {
					case 'top' :
						this.position.left = trigger.offsetLeft - popover.offsetWidth / 2 + trigger.offsetWidth / 2
						this.position.top = trigger.offsetTop - popover.offsetHeight
						break
					case 'left':
						this.position.left = trigger.offsetLeft - popover.offsetWidth
						this.position.top = trigger.offsetTop + trigger.offsetHeight / 2 - popover.offsetHeight / 2
						break
					case 'right':
						this.position.left = trigger.offsetLeft + trigger.offsetWidth
						this.position.top = trigger.offsetTop + trigger.offsetHeight / 2 - popover.offsetHeight / 2
						break
					case 'bottom':
						this.position.left = trigger.offsetLeft - popover.offsetWidth / 2 + trigger.offsetWidth / 2
						this.position.top = trigger.offsetTop + trigger.offsetHeight
						break
					default:
						console.warn('Wrong placement prop')
				}
				
				popover.style.top = this.position.top + 'px'
				popover.style.left = this.position.left + 'px'
			}, 0)
		},
		event: function(e) {
			this.toggle();
			e.stopPropagation();
		}
	},
	mounted () {
		let events = { contextmenu: 'contextmenu', hover: 'mouseleave mouseenter', focus: 'blur focus' }
		$(this.$el).next().on(events[this.trigger] || 'click', this.event)
	},
	beforeDestroy () {
		let events = { contextmenu: 'contextmenu', hover: 'mouseleave mouseenter', focus: 'blur focus' }
		$(this.$el).next().off(events[this.trigger] || 'click', this.event)
	}
}
</script>
<style>
.popover.top,
.popover.left,
.popover.right,
.popover.bottom {
	display: block;
}
.scale-enter {
	animation:scale-in 0.15s ease-in;
}
.scale-leave {
	animation:scale-out 0.15s ease-out;
}
@keyframes scale-in {
	0% {
		transform: scale(0);
		opacity: 0;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}
@keyframes scale-out {
	0% {
		transform: scale(1);
		opacity: 1;
	}
	100% {
		transform: scale(0);
		opacity: 0;
	}
}
</style>