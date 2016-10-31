/*
	This code applies to everything and therefore is included last.
*/

function maResizeDialog() {
	var w = $(window).width()-50;
	var h = $(window).height()-50;
	
	$('.ui-dialog').css({
		'width': w,
		'height': h,
		'left': '50%',
		'top':'50%',
		'margin-left': '-'+(w/2)+'px',
		'margin-top': '-'+(h/2)+'px'
	});
	
	$('#ma-tabs').css({
		'height': h-60
	});
	
	$('.ma-tab').css({
		'height': h-140,
		'overflow': 'hidden',
		'overflow-y': 'auto'
	});
	
}

$(document).ready(function() {

	// Basically, this is our real document ready.
	$('body').on('ma:renderHTML', function() {	

		$('#ma-games-container').accordion({
			heightStyle: "content"
		});

		$('#ma-tabs').tabs({
			heightStyle: "content"
		});
	
		$('#ma-dialog').dialog({
			autoOpen: false,
			resizable: false
		});

		$('#ma-open').click(function() {

			$('#ma-dialog').dialog('open');
			
			maResizeDialog();
			
		});

		$('button').button();
		
		$(window).resize(function() {
			maResizeDialog();
		}).resize();
		
	});
	
});
