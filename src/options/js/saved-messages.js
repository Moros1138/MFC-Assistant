
var MASavedMessages = (function () {
	
	var running = false;
	
	var carouselInterval = null;
	var carouselCurrent = null;
	var carouselMessages = [];
	
	var intervals = [];
	
	var settings = {
		messages: [],
		carouselDelay: 5,
	};
	
	function init() {
		loadSettings();
	}
	
	function loadSettings() {
		
		// load settings from local storage
		if(localStorage.maSavedMessagesSettings !== undefined) {
			settings = JSON.parse(localStorage.maSavedMessagesSettings);
		}
		
		// added version 1.0.13
		if(settings.carouselDelay == null) {
			settings.carouselDelay = 5;
		}
		
		for(var i=0; i<settings.messages.length; i++) {
			renderMessageDOM(settings.messages[i]);
		}
		
		$('#mamc-delay').val( settings.carouselDelay );

		$('body').on('keyup', '#mamc-delay', function() {
			updateSettings();
		});
		
	}
	
	function updateSettings(elem) {
		
		if(elem !== undefined) {
			
			// id
			if($(elem).prop("name") == 'saved-messages-id[]') {
				$(elem).parent().parent().parent().data('id', $(elem).val());
			}
			
			// desc
			if($(elem).prop("name") == 'saved-messages-desc[]') {
				$(elem).parent().parent().prev().prev().html($(elem).val());
				$(elem).parent().parent().parent().data('desc', $(elem).val());
			}
			
			// msg
			if($(elem).prop("name") == 'saved-messages-msg[]') {
				$(elem).parent().parent().parent().data('msg', $(elem).val());
			}
			
			// delay
			if($(elem).prop("name") == 'saved-messages-delay[]') {
				if($(elem).checkNaN()) {
					$(elem).parent().parent().parent().data('delay', 0);
				} else {
					$(elem).parent().parent().parent().data('delay', $(elem).val());
				}
			}
			
		}
		
		settings.messages = [];
		
		$('.message').each(function() {
			
			var data = $(this).data();
			
			if(data.carousel == null)
				data.carousel = false;
			
			settings.messages.push({
				id: data.id,
				desc: data.desc,
				msg: data.msg,
				delay: data.delay,
				carousel: data.carousel
			});
			
		});

		settings.carouselDelay = parseInt($('#mamc-delay').val());
		$('#mamc-delay').checkNaN();
		
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
				delay: 1,
				carousel: false
			};
			
			settings.messages.push(savedMsg);
			
		}
		
		$('#saved-messages .sortable').append([
'<li class="message" data-id="'+savedMsg.id+'">',
	'<div class="handle">',
		savedMsg.desc,
	'</div>',
	'<div class="buttons">',
		'<button type="button" title="Edit this message" class="btn btn-sm btn-primary edit" data-id="'+savedMsg.id+'"><span class="glyphicon glyphicon-cog"></span> <span>Edit Message</span></button> ',
		'<button type="button" title="Delete this message" class="btn btn-sm btn-danger delete" data-id="'+savedMsg.id+'"><span class="glyphicon glyphicon-remove-sign"></span> <span>Remove Message</span></button> ',
		'<button type="button" title="Start/Stop this message\'s timer" class="btn btn-sm btn-info start-timer" data-id="'+savedMsg.id+'"><span class="glyphicon glyphicon-play"></span> <span>Start Timer</span></button> ',
		'<button type="button" title="Post this message now" class="btn btn-sm btn-info post-now" data-id="'+savedMsg.id+'"><span class="glyphicon glyphicon-send"></span> <span>Post Now</span></button> ',
		'<button type="button" title="Add/Remove this message to the carousel" class="btn btn-sm btn-info add-to-carousel" data-id="'+savedMsg.id+'"><span class="glyphicon glyphicon-plus"></span> <span>Add to Carousel</span></button>',
	'</div>',
	'<div class="edit-box">',
		'<input type="hidden" name="saved-messages-id[]" value="'+savedMsg.id+'">',
		'<p>',
			'<label>Message Description:</label>',
			'<input class="form-control" type="text" name="saved-messages-desc[]" value="'+savedMsg.desc+'" placeholder="Type in a short description...">',
		'</p>',
		'<p>',
			'<label>Message:</label>',
			'<textarea class="form-control" name="saved-messages-msg[]" placeholder="Type in your saved message here...">'+savedMsg.msg+'</textarea>',
		'</p>',
		'<p>',
			'<label>Delay Time (in minutes):</label>',
			'<input class="form-control" type="text" name="saved-messages-delay[]" value="'+savedMsg.delay+'" placeholder="Type in the delay (in minutes)...">',
		'</p>',
	'</div>',
'</li>'
		].join(''));
		
		$('.message:last-child').data('desc', savedMsg.desc);
		$('.message:last-child').data('msg', savedMsg.msg);
		$('.message:last-child').data('delay', savedMsg.delay);
		$('.message:last-child').data('carousel', savedMsg.carousel);
		$('.message:last-child input[name="saved-messages-delay[]"]').checkNaN();
		
		if(savedMsg.carousel) {
			$('.message:last-child').find('.add-to-carousel').toggleClass('btn-warning', true);
			$('.message:last-child').find('.add-to-carousel').toggleClass('btn-info', false);
			$('.message:last-child').find('.add-to-carousel').find('span:first-child').toggleClass('glyphicon-plus', false);
			$('.message:last-child').find('.add-to-carousel').find('span:first-child').toggleClass('glyphicon-minus', true);
			$('.message:last-child').find('.add-to-carousel').find('span:last-child').html('Remove from Carousel');
		}
		
	}

	/* Start the Message Carousel
	 ******************************************************/
	function start() {
		
		// no delay?
		if(isNaN(settings.carouselDelay)) {
			settings.carouselDelay = 5;
		}
		
		running = true;
		carousel();
		
		carouselInterval = setInterval(function() {
			carousel();
		}, (1000 * 60 * settings.carouselDelay));

		$('#mamc-start-stop').toggleClass('btn-danger', true);
		$('#mamc-start-stop').toggleClass('btn-primary', false);
		$('#mamc-start-stop').html('Stop');

	}	
	
	/* Stop the Message Carousel
	 ******************************************************/
	function stop() {
		
		running = false;
		clear();

		$('#mamc-start-stop').toggleClass('btn-danger', false);
		$('#mamc-start-stop').toggleClass('btn-primary', true);
		$('#mamc-start-stop').html('Start');

		clearInterval(carouselInterval);
		
	}

	function clear() {
		carouselMessages = [];
		carouselCurrent = null;
		debug('Message Carousel: cleared.');
	}

	/* Carousel
	 ******************************************************/
	function carousel() {
		
		if(!running)
			return;
		
		if(carouselCurrent == null) {
			
			$('.message').each(function() {
				carouselMessages.push($(this).data('id'));
			});
			
			carouselCurrent = 0;
			
		}
		
		var messageFlag = false;
		
		$('.message').each(function() {
			
			var message = $(this).data();
			
			if( message.id == carouselMessages[carouselCurrent] ) {
				MAssistOptions.sendMsg(message.msg);
				messageFlag = true;
			}
			
		});

		if(messageFlag) {
			
			carouselCurrent++;
			
			if(carouselCurrent > carouselMessages.length-1)
				carouselCurrent = 0;
			
		}
		
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
			
			var current = $(this).parent().parent()[0];
			
			// close all
			$(".message").each(function() {
				
				if(this != current)				
					$(this).find('.edit-box').toggleClass('collapsed', true);
				
			});
			
			// open/close
			$(current).find('.edit-box').toggleClass('collapsed');
			
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
			updateSettings(this);
		});
		
		// sortable
		$("#saved-messages .sortable").sortable({
			update: function(e, ui) {
				updateSettings();
			}
		});
		
		
		$('body').on('click', '.start-timer' , function() {

			var message = $(this).parent().parent();
			
			if($(this).find('span:last-child').html() == 'Start Timer') {
				
				MAssistOptions.sendMsg(message.data('msg'));
				
				intervals[message.data('id')] = setInterval(function() {
					MAssistOptions.sendMsg(message.data('msg'), true);
				}, (1000 * 60 * message.data('delay')));

				$(this).toggleClass('btn-warning', true);
				$(this).toggleClass('btn-info', false);
				$(this).find('span:first-child').toggleClass('glyphicon-play', false);
				$(this).find('span:first-child').toggleClass('glyphicon-stop', true);
				$(this).find('span:last-child').html('Stop Timer');
				return;
				
			}
			
			if($(this).find('span:last-child').html() == 'Stop Timer') {
				
				clearInterval(intervals[message.data('id')]);
				
				$(this).toggleClass('btn-warning', false);
				$(this).toggleClass('btn-info', true);
				$(this).find('span:first-child').toggleClass('glyphicon-play', true);
				$(this).find('span:first-child').toggleClass('glyphicon-stop', false);
				$(this).find('span:last-child').html('Start Timer');
				return;
			}
			
		});
		
		$('body').on('click', '.post-now', function() {
			var message = $(this).parent().parent();
			MAssistOptions.sendMsg(message.data('msg'));
		});
		
		
		$('body').on('click', '.add-to-carousel', function() {
			
			var message = $(this).parent().parent();
			
			if($(this).find('span:last-child').html() == 'Add to Carousel') {
				
				message.data('carousel', true);
				
				$(this).toggleClass('btn-warning', true);
				$(this).toggleClass('btn-info', false);
				$(this).find('span:first-child').toggleClass('glyphicon-plus', false);
				$(this).find('span:first-child').toggleClass('glyphicon-minus', true);
				$(this).find('span:last-child').html('Remove from Carousel');
				updateSettings();
				return;
				
			}
			
			if($(this).find('span:last-child').html() == 'Remove from Carousel') {
				
				message.data('carousel', false);
				
				$(this).toggleClass('btn-warning', false);
				$(this).toggleClass('btn-info', true);
				$(this).find('span:first-child').toggleClass('glyphicon-plus', true);
				$(this).find('span:first-child').toggleClass('glyphicon-minus', false);
				$(this).find('span:last-child').html('Add to Carousel');
				updateSettings();
				return;
			}
			
		});
		
		$('#mamc-start-stop').click(function() {
			
			if($(this).html() == 'Start') {
				start();
				return;
			}
			
			if($(this).html() == 'Stop') {
				stop();
				return;
			}
			
		});			


		
		/**
		 * ready
		 ******************************************************************/
		$('body').on('ma:ready', function() {
			
			running = false;
			clear();

			$('#mamc-start-stop').toggleClass('btn-danger', false);
			$('#mamc-start-stop').toggleClass('btn-primary', true);
			$('#mamc-start-stop').html('Start');
			
		});
		
		
		/**
		 * not ready
		 ******************************************************************/
		$('body').on('ma:not-ready', function() {
			
			running = false;
			clear();

			$('#mamc-start-stop').toggleClass('btn-danger', false);
			$('#mamc-start-stop').toggleClass('btn-primary', true);
			$('#mamc-start-stop').html('Start');

			/**
			 * kill all intervals
			 ******************************************************************/
			$('.start-timer').each(function() {
				
				if( $(this).find('span:last-child').html() == 'Stop Timer' ) {
					
					$(this).trigger('click');
					
				}
				
			});
			
		});
		
	});

	return {
	};
	
})();
