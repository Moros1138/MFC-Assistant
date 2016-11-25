<template>
	<div id="chat">
		<h1>Chatbox</h1>
		<div id="chatbox">
			<div v-for="msg in log">
				<p v-if="isTip(msg)"><b>{{ msg.memberName }}</b> has tipped you {{ msg.tipAmount }} tokens.</p>
				<p v-if="!isTip(msg)"><b>{{ msg.memberName }}:</b> {{ msg.message }}</p>
			</div>
		</div>
		<form id="ma-send-msg-form" v-on:submit="sendMsg">
			<div class="input-group">
				<input class="form-control" type="text" placeholder="Type a message to send..." autocomplete="off" v-model="msg">
				<span class="input-group-btn">
					<button class="btn btn-primary">Send Message</button>
				</span>
			</div><!-- /input-group -->
		</form>
		<h4>Send a Test Tip</h4>
		<form id="ma-fake-tip-form" v-on:submit="fakeTip">
			<div class="input-group" style="margin-top: 10px;">
				<input class="form-control" type="text" placeholder="Set tip amount..." autocomplete="off" v-model="tipAmount">
				<span class="input-group-btn">
					<button class="btn btn-info">Fake Tip</button>
				</span>
			</div><!-- /input-group -->
		</form>
	</div>
</template>

<script>
window.chatData = {
	msg: '',
	tipAmount: '',
	log: []
};

$('body').on('ma:chat-message', function(e, mfcMsg) {
	window.chatData.log.push(mfcMsg);
	if(window.chatData.log.length > 30) {
		window.chatData.log.shift();
	}
	Vue.nextTick(function() {
		if($("#chatbox").length != 0) {
			$("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
		}
	});
});

$('body').on('ma:tip', function(e, mfcMsg) {
	window.chatData.log.push(mfcMsg);
	if(window.chatData.log.length > 30) {
		window.chatData.log.shift();
	}
	Vue.nextTick(function() {
		if($("#chatbox").length != 0) {
			$("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
		}
	});
});

export default {
	name: 'chat',
	data () {
		return window.chatData;
	},
	methods: {
		isTip: function(mfcMsg) {
			if(mfcMsg.tipAmount !== undefined) {
				return true;
			}
			
			return false;
		},
		sendMsg: function() {
			MAssistOptions.sendMsg(this.msg);
			this.msg = '';
		},
		fakeTip: function() {
			MAssistOptions.fakeTip(this.tipAmount);
			this.tipAmount = '';
		}
	}
}
</script>
