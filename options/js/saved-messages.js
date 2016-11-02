
var MASavedMessages = (function () {
	
	var running = false;
	var repostInterval = null;
	var intervals = [];
	
	var settings = {
		messages: [],
	};
	
	function init() {
		loadSettings();
	}
	
	function loadSettings() {
		
		// load settings from local storage
		if(localStorage.maSavedMessagesSettings !== undefined) {
			settings = JSON.parse(localStorage.maSavedMessagesSettings);
		}
		
		for(var i=0; i<settings.messages.length; i++) {
			renderMessageDOM(settings.messages[i]);
		}
		
	}
	
	function updateSettings() {
		
		settings.messages = [];
		
		$('.message').each(function() {
			
			var data = $(this).data();
			
			settings.messages.push({
				id: data.id,
				desc: data.desc,
				msg: data.msg,
				delay: data.delay
			});
			
		});
		
		localStorage.maSavedMessagesSettings = JSON.stringify(settings);
		
	}
	
	/**
	 * Basically a wrapper for console.log that we can control via
	 * our custom settings.
	 ******************************************************************/
	function debug(msg) {
		console.log(msg);
	}
	
	function getNewId() {

		var ids = [];
		
		$('.message').each(function() {
			ids.push($(this).data('id'));
		});
		
		if(ids.length > 0) {
			return Math.max.apply(null, ids) + 1;
		}
		
		return 1;
		
	}
	
	function getMessageIndex(id) {
		for(var i=0; i<settings.messages.length; i++) {
			if(settings.messages[i].id == id) {
				return i;
			}
		}
		return -1;
	}
	
	function renderMessageDOM(savedMsg) {
		
		if(savedMsg === undefined) {
			
			savedMsg = {
				id: getNewId(),
				desc: 'New Message',
				msg: '',
				delay: ''
			};
			
			settings.messages.push(savedMsg);
			
		}
		
		$('#saved-messages .sortable').append([
'<li class="message" data-id="'+savedMsg.id+'">',
	'<div class="handle">',
		'<h3>'+savedMsg.desc+'</h3>',
		'<button type="button" class="btn btn-sm btn-primary glyphicon glyphicon-cog edit"data-id="'+savedMsg.id+'"></button> ',
		'<button type="button" class="btn btn-sm btn-danger glyphicon glyphicon-remove-sign delete"data-id="'+savedMsg.id+'"></button> ',
		'<button type="button" class="btn btn-sm btn-info start-timer" data-id="'+savedMsg.id+'"><span class="glyphicon glyphicon-time"></span> <span>Start Timer</span></button> ',
		'<button type="button" class="btn btn-sm btn-info post-now" data-id="'+savedMsg.id+'"><span class="glyphicon glyphicon-time"></span> <span>Post Now</span></button>',
	'</div>',
	'<div class="edit-box">',
		'<input type="hidden" name="saved-messages-id[]" value="'+savedMsg.id+'">',
		'<label>Message Description:</label>',
		'<input class="form-control" type="text" name="saved-messages-desc[]" value="'+savedMsg.desc+'" placeholder="Type in a short description...">',
		'<label>Message:</label>',
		'<textarea class="form-control" name="saved-messages-msg[]" placeholder="Type in your saved message here...">'+savedMsg.msg+'</textarea>',
		'<label>Delay Time (in minutes):</label>',
		'<input class="form-control" type="text" name="saved-messages-delay[]" value="'+savedMsg.delay+'" placeholder="Type in the delay (in minutes)...">',
	'</div>',
'</li>'
		].join(''));
		
		$('.message:last-child').data('desc', savedMsg.desc);
		$('.message:last-child').data('msg', savedMsg.msg);
		$('.message:last-child').data('delay', savedMsg.delay);
		
	}
	
	$(document).ready(function() {
		
		init();

		// force close all
		$(".message .edit-box").each(function() {
			$(this).toggleClass('collapsed', true);
		});

		
		// add
		$('#add-message').click(function(e) {
			
			// force close all
			$(".message .edit-box").each(function() {
				$(this).toggleClass('collapsed', true);
			});
			
			renderMessageDOM();
			updateSettings();
			
		});

		/**
		 * Open the edit-box of a saved message
		 ******************************************************************/
		$("#saved-messages .sortable").on('click', '.edit', function() {
			
			var current = $(this).parent().next()[0];
			
			// close all
			$("#saved-messages .sortable .edit-box").each(function() {
				if( this !== current ) {
					$(this).toggleClass('collapsed', true);
				}
			});
			
			// open/close
			$(current).toggleClass('collapsed');
			
		});

		/**
		 * Remove a saved message
		 ******************************************************************/
		$("#saved-messages .sortable").on('click', '.delete', function() {
			
			var _self = this;
			
			MAssistOptions.dialog('Are you sure you want to do this?', 'Delete Message',
				function() {
					
					$(_self).parent().parent().remove();
					updateSettings();
					$(this).dialog('close');
					
				},
				function() {
					$(this).dialog('close');
				}
			);
			
		});

		/**
		 * Update the messages when keys are released
		 ******************************************************************/
		$('#saved-messages .sortable').on('keyup', '.edit-box input[type="text"],.edit-box textarea', function() {
			
			// id
			if($(this).prop("name") == 'saved-messages-id[]') {
				$(this).parent().parent().data('id', $(this).val());
			}
			
			// desc
			if($(this).prop("name") == 'saved-messages-desc[]') {
				$(this).parent().prev().find('h3').html($(this).val());
				$(this).parent().parent().data('desc', $(this).val());
			}
			
			// msg
			if($(this).prop("name") == 'saved-messages-msg[]') {
				$(this).parent().parent().data('msg', $(this).val());
			}
			
			// delay
			if($(this).prop("name") == 'saved-messages-delay[]') {
				$(this).parent().parent().data('delay', $(this).val());
			}
			
			updateSettings();
			
		});
		
		// sortable
		$("#saved-messages .sortable").sortable({
			update: function(e, ui) {
				updateSettings();
			}
		});
		
		
		$('body').on('click', '.start-timer' , function() {

			var message = $(this).parent().parent();
			
			if(message.find('span:last-child').html() == 'Start Timer') {

				intervals[message.data('id')] = setInterval(function() {
					MAssistOptions.sendMsg(message.data('msg'));
				}, (1000 * 60 * message.data('delay')));

				$(this).toggleClass('btn-warning', true);
				$(this).toggleClass('btn-info', false);
				$(this).find('span:last-child').html('Stop Timer');
				return;
				
			}
			
			if(message.find('span:last-child').html() == 'Stop Timer') {
				
				clearInterval(intervals[message.data('id')]);
				
				$(this).toggleClass('btn-warning', false);
				$(this).toggleClass('btn-info', true);
				$(this).find('span:last-child').html('Start Timer');
				return;
			}
			
		});
		
		$('body').on('click', '.post-now', function() {
			var message = $(this).parent().parent();
			MAssistOptions.sendMsg(message.data('msg'));
		});
		
	});

	return {
	};
	
})();
