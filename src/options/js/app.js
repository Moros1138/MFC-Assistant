
const router = new VueRouter({
	routes: [
		{ path: '/', component: window.Home },
		{ path: '/notready', component: window.NotReady },
		{ path: '/chat', component: window.Chat },
		{ path: '/messages', component: window.Messages },
		{ path: '/options', component: window.Options },
		{ path: '/tipwar', component: window.TipWar },
		{ path: '/tokenkeno', component: window.TokenKeno }
	]
});

new Vue({
  router,
  el: '#app',
  render: h => h(App)
})

$(document).ready(function() {
	
	router.push('/notready');

	$('body').on('ma:not-ready', function(e) {
		
		while(window.chatData.log.length > 0) {
			window.chatData.log.pop();
		}
		
		router.push('/notready');
		
		MAssistOptions.dialog(
			'All game variables will be cleared and timers will stopped.',
			'Lost Contact with Model Web!',
			function() {
				$(this).dialog('close');
			}
		);
	
	});

	$('body').on('ma:ready', function(e) {
		router.push('/');
	});
	
});
