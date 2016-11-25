<template>
	<div id="app">
		<nav class="navbar navbar-inverse navbar-fixed-top">
			<div class="container-fluid">
				<div class="navbar-header">
					<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
						<span class="sr-only">Toggle navigation</span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>
					<router-link class="navbar-brand" to="/">MFC Assistant</router-link>
				</div>
				<div id="navbar" class="navbar-collapse collapse">
					<ul class="nav navbar-nav">
						<li><router-link to="/chat">Chat</router-link></li>
						<li class="dropdown">
							<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Games <span class="caret"></span></a>
							<ul class="dropdown-menu">
								<li><router-link to="/tipwar">Tip War</router-link></li>
								<li><router-link to="/tokenkeno">Token Keno</router-link></li>
							</ul>
						</li>
						<li><router-link to="/messages">Messages</router-link></li>
						<li><router-link to="/options">Options</router-link></li>
					</ul>
				</div>
			</div>
		</nav>

		<div class="container">
			<div v-if="settings.debug_mode" class="alert alert-warning" role="alert">
				<p>
					The MFC Assistant is currently in Debug Mode!
					Debug mode is intended to be used for testing
					purposes. While in Debug Mode the timer/delay
					variables will be set as <b>SECONDS</b>
					instead of <b>MINUTES</b>. You can change these
					settings on the <router-link class="alert-link" to="/options">Options</router-link> page.
				</p>
			</div>
			<div v-if="settings.send_messages" class="alert alert-success" role="alert">
				<p>
					<b>PUBLIC MODE</b> is currently <b>ON</b>!
					All messages sent from the MFC Assistant
					will appear as if you are saying it
					in your room! You can change these settings on the
					<router-link class="alert-link" to="/options">Options</router-link> page.
				</p>
			</div>
			<div v-else class="alert alert-danger" role="alert">
				<p>
					<b>PUBLIC MODE</b> is currently <b>OFF</b>!
					All messages sent from the MFC Assistant
					will appear to be from "MFCAssistant"
					and can only be seen by you! You can change these settings on the
					<router-link class="alert-link" to="/options">Options</router-link> page.
				</p>
			</div>
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
export default {
	name: 'app',
	data () {
		return window.optionsData;
	}
}
</script>
