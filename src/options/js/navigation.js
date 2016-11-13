var MANavigation = (function() {
	
	var pages = [
		'#not-ready',
		'#chat',
		'#home',
		'#options',
		'#savedMsg',
		'#tipwar',
		'#tokenkeno'
	];
	
	var ready = false;
	
	function navigateTo(page) {
		
		if(!ready && page != '#not-ready')
			return;
		
		if( pages.indexOf(page) != -1 ) {
			for(var i = 0; i < pages.length; i++) {
				$(pages[i]).hide();
			}
			$(page).show();
		} else {
			navigateTo('#home');
		}
		
	}
	
	$(document).ready(function() {
		
		// page load navigation
		if(window.location.hash) {
			navigateTo(window.location.hash);
		} else {
			navigateTo('#not-ready');
		}
		
		// link click navigation
		$('a').click(function(e) {
			if(!$(this).hasClass('dropdown-toggle')) {
				navigateTo($(this).attr('href'));
			}
		});
		
		$('body').on('ma:ready', function(e) {
			ready = true;
			navigateTo('#home');
		});
		
		$('body').on('ma:not-ready', function(e) {
			ready = false;
			navigateTo('#not-ready');
		})
		
	});
	
	return {
		navigateTo: navigateTo
	};
	
})();