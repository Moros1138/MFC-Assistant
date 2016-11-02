
var MANavigation = (function() {
	
	var pages = [
		'#home',
		'#chat',
		'#options',
		'#savedMsg',
		'#tipwar',
		'#tokenkeno'
	];
	
	function navigateTo(page) {
		
		if( pages.indexOf(page) != -1 ) {
			for(var i = 0; i < pages.length; i++) {
				$(pages[i]).hide();
			}
			$(page).show();
		} else {
			navigateTo('home');
		}
		
	}
	
	$(document).ready(function() {
		
		// page load navigation
		if(window.location.hash) {
			navigateTo(window.location.hash);
		} else {
			navigateTo('#home');
		}
		
		
		// link click navigation
		$('a').click(function(e) {
			navigateTo($(this).attr('href'));
		});
		
		
		
	});	
	
	return {
	};
	
})();

