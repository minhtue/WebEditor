$(document).ready(function(){
	var wait4LoadMessage = 3000;
	Fancybox.bind('[data-fancybox="message-attach"]');
	Fancybox.bind('[data-fancybox="attachments"]');
	$("[data-toggle=popover]").popover();
	$('#converstion-group-modal').on('hidden.bs.modal', function(e){
		$('#converstion-group-modal .conv-controls .users').empty();
		$('#converstion-group-modal .conv-controls').removeClass('active');
	});
	function filterContacts(val, ele){
		if(val === undefined || val === ''){
			$(ele).show();
		} else {
			val = webeditor.killUnicode(val);
			$(ele).show().filter(function(){
				var username = $(this).data('ref-username');
				var fullname = webeditor.killUnicode($(this).data('ref-fullname'));
				var email = $(this).data('ref-email');
				var umatch = username.match(new RegExp('.*' + val + '.*', 'i'));
				var fmatch = fullname.match(new RegExp('.*' + val + '.*', 'i'));
				var ematch = email.match(new RegExp('.*' + val + '.*', 'i'));
				return umatch === null && fmatch === null && ematch === null;
			}).hide();
		}
	}
	function filterConversations(val, ele){
		if(val === undefined || val === ''){
			$(ele).show();
		} else {
			val = webeditor.killUnicode(val);
			$(ele).show().filter(function(){
				var username = $('.username .title', $(this)).data('ref-username');
				var umatch = username.match(new RegExp('.*' + val + '.*', 'i'));
				return umatch === null;
			}).hide();
		}
	}
	$(document).on('scroll', function(e) {
	    if(e.target === $('.conversation-detail .message-list')[0]){
	    	console.log('message list scroll', e.target.scrollTop)
	    } else if(e.target === $('.chatroom-list .conversations')[0]){
	    	console.log('Conversation list scroll', e.target.scrollTop)
	    }
	});
	$(document).on('keyup', 'input[name=filter-contact]', function(e){
		var $this = $(this);
		setTimeout(function(){
			var val = $this.val().trim();
			var btn = $this.next('[data-conversation-action=empty-input]');
			if(val.length > 0){
				btn.show();
				filterContacts(val, $('.contact-container .list-contacts li.contact-item'));
			} else {
				$('.contact-container .list-contacts li.contact-item').show();
				btn.hide();
			}
		}, 1);
		
	});
	function scrollContent(){
		if($(".message-list .anchor").length > 0){
			$(".message-list .anchor")[0].scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
		}
	}
	function loadContact(ele){
		var user = webeditor.user();
		if(!user){
			return false;
		}
		var key = user.tk + '_contacts';
		const itemStr = localStorage.getItem(key);
		var items = [];
		var last = -1;
		var load = true;
		if(itemStr){
			const item = JSON.parse(itemStr);
			try{items = JSON.parse(CryptoJS.AES.decrypt(item.value, user.tk).toString(CryptoJS.enc.Utf8));}catch(e){}
			const now = new Date();
			if (now.getTime() > item.expiry) {
				if(items.length > 0){
					last = items[0].id;
				}
			} else {
				if(items.length === 0){
					$(ele).html(`<div class="text-muted"><span>${translate('You have no contact at the moment.')}</span><br><span>${translate('You can search contact by UserName or Email.')}</span></div>`);
				} else {
					const markup = `${items.map(user => `<li class="contact-item" data-ref-user="${user.id}" data-ref-avatar="${webeditor.dfAvatar(user.avatar)}" data-ref-email="${user.email}" data-ref-username="${user.username}" data-ref-fullname="${user.fullname}">
						<div class="user-block text-left">
							<img class="img-circle" src="${webeditor.dfAvatar(user.avatar)}" alt="${user.fullname}">
							<span class="username"><a href="javascript: void(0);">${user.fullname}</a></span>
							<span class="description"><i>@${user.username}</i> - ${webeditor.timeAgo(user.lastActive)}</span>
						</div>
						<div class="icheck-primary icheck-circle d-inline">
							<input type="checkbox" id="checkbox-contact-${user.id}" data-ref-user-id="${user.id}">
							<label for="checkbox-contact-${user.id}"></label>
						</div>
						</li>`).join('')}`;
					$(ele).html(markup);
				}
				load = false;
			}
		}
		if(load){
			$.ajax({
                url: '/api/contact/list',
                type: 'GET',
                data: {last: last},
                success: function(res) {
                    if(res.contacts){
                    	var newItems = res.contacts.concat(items);
                    	const now = new Date();
                    	var value = '';
                    	try{value = CryptoJS.AES.encrypt(JSON.stringify(newItems), user.tk).toString();}catch(e){}
						const item = {
							value: value,
							expiry: now.getTime() + 30000,
						}
						localStorage.setItem(key, JSON.stringify(item));
						if(newItems.length === 0){
							$(ele).html(`<div class="text-muted"><span>${translate('You have no contact at the moment.')}</span><br><span>${translate('You can search contact by UserName or Email.')}</span></div>`);
						} else {
							const markup = `${newItems.map(user => `<li class="contact-item" data-ref-user="${user.id}" data-ref-avatar="${webeditor.dfAvatar(user.avatar)}" data-ref-email="${user.email}" data-ref-username="${user.username}" data-ref-fullname="${user.fullname}">
								<div class="user-block text-left">
									<img class="img-circle" src="${webeditor.dfAvatar(user.avatar)}" alt="${user.fullname}">
									<span class="username"><a href="javascript: void(0);">${user.fullname}</a></span>
									<span class="description"><i>@${user.username}</i> - ${webeditor.timeAgo(user.lastActive)}</span>
								</div>
								<div class="icheck-primary icheck-circle d-inline">
									<input type="checkbox" id="checkbox-contact-${user.id}" data-ref-user-id="${user.id}">
									<label for="checkbox-contact-${user.id}"></label>
								</div>
								</li>`).join('')}`;
							$(ele).html(markup);
						}
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Load Contact'));
                    }
                }
            });
		}
	}
	function initChat(data){
		if(data === undefined){
			return false;
		}
		$.ajax({
            url: '/api/conversation/init',
            type: 'POST',
            data: data,
            success: function(res) {
                if(res.conversation){
                	var thumb, title;
                	if(res.conversation.type === 'P2P'){
                		var target = res.conversation.sender === webeditor.user().id ? res.conversation.receiver : res.conversation.sender;
                		var member = res.conversation.members[target];
                		thumb = member.avatar;
                		title = member.fullname;
                		$('#converstion-contact-modal [data-conversation-action=empty-input]').click();
                	} else {
                		thumb = res.conversation.thumb;
                		title = res.conversation.title;
    					$('label.conv-group-image img').remove();
                        $('label.conv-group-image i').remove();
                    	$('label.conv-group-image').prepend(`<i class="fal fa-camera "></i>`);
                    	$('#converstion-group-modal [data-conversation-action=empty-input]').click();
                    	$('.conv-controls .users').empty();
                    	$('#converstion-group-modal .contact-item input:checked').prop('checked', false);
                    	$('#converstion-group-modal .conv-controls').removeClass('active');
                	}
                	const markup = `<li class="user-block w-100 conversation-item" data-conversation-action="load-conversation" data-ref-conv="${res.conversation.id}">
	                    <img class="img-circle img-bordered-sm" src="${thumb}" alt="${title}">
	                    <span class="username">
	                        <span class="title">${title}</span>
	                        <span class="text-muted small">${webeditor.chatTime(res.conversation.updated)}</span>
	                    </span>
	                    <span class="description">${res.conversation.lastMessage === undefined ? '': res.conversation.lastMessage}</span>
	                    <a class="actions"><i class="fa fa-ellipsis-h"></i></a>
	                </li>`;
	                $('.chatroom-list .conversations li[data-ref-conv=' + res.conversation.id + ']').remove();
	                $('.chatroom-list .conversations').prepend(markup);
	                $('.chatroom-list .conversations li[data-ref-conv=' + res.conversation.id + ']').click();
	                $('[data-conversation-action=empty-input]').click();
	                $('.modal').modal('hide');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                    toastr.error(translate(jqXHR.responseJSON.error.message), translate('Init Conversation'));
                }
            }
        });
	}
	$(document).on('click', '.contact-item', function(){
		var data = {}
		if($(this.closest('#converstion-contact-modal')).length > 0){
			data.type = 'P2P';
			data.receive = $('input[type=checkbox]', $(this)).data('ref-user-id');
			initChat(data);
		} else if($(this.closest('#converstion-group-modal')).length > 0 || $(this.closest('#group-member-modal')).length > 0){
			var modal = $(this.closest('.modal'));
			var checkbox = $('input[type=checkbox]', $(this));
			if(checkbox.length == 0){
				return false;
			}
			checkbox.prop('checked', !checkbox.prop('checked'));

			var img = $(this).data('ref-avatar');
			var id = $(this).data('ref-user');
			var name = $(this).data('ref-fullname');
			if(checkbox.is(':checked')){
				if($('.conv-controls ul.users li[data-ref-user=' + id + ']').length === 0){
					const markup = `<li class="user-block" data-ref-user="${id}">
						<img class="img-circle" src="${img}" title="${name}">
						<a href="javascript: void(0);" data-conversation-action="rm-group-member"><i class="fal fa-times-circle"></i></a>
					</li>`;
					$('.conv-controls ul.users', modal).append(markup);
				}
			} else {
				$('.conv-controls ul.users li[data-ref-user=' + id + ']', modal).remove();
			}
			if($('.conv-controls ul.users li').length > 0){
				$('.selected-scope .selected-members').text($('.conv-controls ul.users li', modal).length);
				$('.conv-controls', modal).addClass('active');
			} else {
				$('.conv-controls', modal).removeClass('active');
			}
		}
	});
	$(document).on('change', '#chat-attach-file', function(){
		var files = this.files;
		var $this = $(this);
		var id = $(this.closest('[data-conversation-id]')).data('conversation-id');
		var idx = $('.conversation-detail .message-list .chat-item-detail [data-idx]').last().data('idx');
		if(idx === undefined){
			idx = '';
		}
		if(this.files.length > userLimit.maxFiles){
			$this.val('');
			toastr.error(translate('Too many files selected: You can attach up to 10 files. To increase the number of attachments please update VIP members.'), translate('Conversation Attachments'));
			return;
		}
		var size = 0;
		var bar = new Promise((resolve, reject) => {
		    Array.from(files).forEach((value, index, array) => {
		        size += value.size;
		        if (index === array.length -1) resolve();
		    });
		});

		bar.then(() => {
		    if(size > userLimit.maxFileSize){
		    	$this.val('');
		    	toastr.error(translate('You can send up to 25 MB in attachments. To increase please update VIP members.'), translate('Conversation Attachments'));
		    } else {
		    	var data = {};
		    	data.files = files;
		    	var upload = new Upload(data, '/api/conversation/attach?id=' + id + '&idx=' + idx, '.chat-footer .uploading-bar .progress-bar');
		        upload.doUpload(function(result){
		        	console.log(result);
		            $('.chat-footer .uploading-bar .progress-bar').hide();
		            $('.chat-footer .uploading-bar .progress-bar').css('width', '');
		            setTimeout(function(){$('.chat-footer .uploading-bar .progress-bar').show();}, 1000);
		            $this.val('');
		        },function(jqXHR) {
		        	$this.val('');
		        	$('.chat-footer .uploading-bar .progress-bar').hide();
		            $('.chat-footer .uploading-bar .progress-bar').css('width', '');
		            setTimeout(function(){$('.chat-footer .uploading-bar .progress-bar').show();}, 1000);
		            $('.chat-footer .uploading-bar .progress-bar').show();
		            if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
		                toastr.error(translate(jqXHR.responseJSON.error.message), translate('File Upload'));
		            }
		        });
		    }
		});
	});
	$(document).on('change', 'input[name=conv-group-image]', function(){
		var $this = $(this);
		var data = {};
    	data.image = this.files;
    	var upload = new Upload(data, '/medias/upload/image', 'label.conv-group-image');
    	$('label.conv-group-image i').addClass('spinner-border');
        upload.doUpload(function(result){
        	$this.val('');
        	if(result.image){
        		var img = result.image;
        		setTimeout(function(){
	        		let image = new Image();
	                image.src = img.path;
	                if(image.naturalWidth == 0 || image.readyState == 'uninitialized'){
	                    setTimeout(function(){
	                        const markup = `<img class="img-circle" src="${image.src}">`;
	                        $('label.conv-group-image img').remove();
	                        $('label.conv-group-image i').remove();
	                    	$('label.conv-group-image').prepend(markup);
	                    }, 2000);
	                } else {
	                    const markup = `<img class="img-circle" src="${image.src}">`;
	                    $('label.conv-group-image img').remove();
                        $('label.conv-group-image i').remove();
                    	$('label.conv-group-image').prepend(markup);
	                }
	        	}, 1000);
        	}
        },function(jqXHR) {
        	$this.val('');
			$('label.conv-group-image i').removeClass('spinner-border');
            if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                toastr.error(translate(jqXHR.responseJSON.error.message), translate('File Upload'));
            }
        });
	});

	$(document).on('paste', '#chat-input', function (e) {
	    e.preventDefault();

	    const text = e.clipboardData || e.originalEvent.clipboardData ? (e.originalEvent || e).clipboardData.getData('text/plain') : window.clipboardData ? window.clipboardData.getData('Text') : '';

	    if (document.queryCommandSupported('insertText')) {
	        document.execCommand('insertText', false, text);
	    } else {
	        // Insert text at the current position of caret
	        const range = document.getSelection().getRangeAt(0);
	        range.deleteContents();

	        const textNode = document.createTextNode(text);
	        range.insertNode(textNode);
	        range.selectNodeContents(textNode);
	        range.collapse(false);

	        const selection = window.getSelection();
	        selection.removeAllRanges();
	        selection.addRange(range);
	    }
	});
	$(document).on('keypress', '#chat-input', function(e){
		var key = e.keyCode || e.which;
        if (key === 13 && !e.shiftKey){
    		e.preventDefault();
            $('[data-conversation-action=send]').click();
            return false;
        }
	});
	$(document).on('click', '.conversation-detail note[data-note-id]', function(){
		var noteId = $(this).data('note-id');
		if($('.notes li[data-ref-note=' + noteId + ']').length > 0){
			var isVisible = $('.chat-detail-panel').is(':visible');
			if(!isVisible){
				$('.chat-detail-panel').addClass('active');
				$('.chat-emoji-panel').removeClass('active');
				$('.conversation-detail .body').css('width', 'calc(100% - 300px)');
			}
			$('.notes li[data-ref-note=' + noteId + ']').addClass('hight-light');
			$('.notes li[data-ref-note=' + noteId + ']')[0].scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
			setTimeout(function(){
				$('.notes li[data-ref-note=' + noteId + ']').removeClass('hight-light');
			}, 3000);
		}
	});
	$(document).on('click', '.conversation-detail task[data-task-id]', function(){
		var taskId = $(this).data('task-id');
		if($('.tasks li[data-ref-task=' + taskId + ']').length > 0){
			var isVisible = $('.chat-detail-panel').is(':visible');
			if(!isVisible){
				$('.chat-detail-panel').addClass('active');
				$('.chat-emoji-panel').removeClass('active');
				$('.conversation-detail .body').css('width', 'calc(100% - 300px)');
			}
				$('.tasks li[data-ref-task=' + taskId + ']').addClass('hight-light');
				$('.tasks li[data-ref-task=' + taskId + ']')[0].scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
			setTimeout(function(){
				$('.tasks li[data-ref-task=' + taskId + ']').removeClass('hight-light');
			}, 3000);
		}
	});
    $(document).on('input keyup', '#chat-input', function(e){
    	var key = e.keyCode || e.which;
        if (key === 13){
            $('[data-conversation-action=send]').click();
            return false;
        }
        this.style.overflow = 'hidden';
        this.style.height = 0;
        var height = this.scrollHeight;
        if( height > 75){
            height = 75;
        } else if(height < 32){
            height = 32;
        }
        this.style.overflow = 'auto';
        this.style.height = height + 'px';
    });
    function chatTime(date){
    	if(!isNaN(date)){
    		var startTime = moment(parseInt(date));
			var isSame = moment().isSame(startTime, 'days');
			if(isSame){
				return startTime.format('HH:mm')
			} else {
				return startTime.format('MMM DD, YYYY HH:mm')
			}
    	} else {
    		return '';
    	}
    }
    function updateTyping(typing){
    	if(!typing){
    		return false;
    	}
    	var me = webeditor.uInfo();
    	var members = $('.conversation-detail').data('conv-members');
    	var markup = '';
    	typing.forEach(function(uid){
    		if(uid != me.ID){
    			var member = members[uid];
    			if(member){
    				markup += '<img class="img-circle img-bordered-sm" src="' + webeditor.dfAvatar(member.avatar) + '">';
    			}
    		}
    	});
    	if(markup !== ''){
    		markup += '<span class="spinner-dots"></span>';
    	}
    	if($('.anchor').html() !== markup){
    		$('.anchor').html(markup);
    		scrollContent();
    	}
    }
    function renderAttach(attachments){
    	if(attachments && attachments.length > 0){
    		attachments = attachments.reverse();
	    	attachments.forEach(function(file){
	    		var markup = '';
	    		if(file.type === 'image'){
	    			markup = `<li data-ref-attach="${file.id}"><a data-fancybox="attachments" data-src="${file.path}" title="${file.name}"><img src="${file.path}"></a></li>`;
	    		} else if(file.type === 'video'){
	    			markup = `<li data-ref-attach="${file.id}"><a data-fancybox="attachments" data-src="${file.path}" title="${file.name}"><img src="${file.cover}"></a></li>`;
	    		} else {
	    			markup = `<li data-ref-attach="${file.id}"><a href="${file.path}" download><i class="fal fa-file-${file.type}"></i><span>${file.name}</span></a></li>`;
	    		}
	    		$('.chat-detail-panel .attachments').prepend(markup);
	    	});
    	}
    }
    function renderConversation(conversations){
    	if(conversations && conversations.length > 0){
    		conversations.forEach(function(conv){
    			if($('.conversations .conversation-item[data-ref-conv=' + conv.id + ']').length > 0){
    				$('.conversations .conversation-item[data-ref-conv=' + conv.id + '] [data-format=chat-time]').data('ref-value', conv.updated).text(webeditor.timeAgo(conv.updated));
    				var member = conv.members !== undefined ? conv.members[conv.lastSent] : undefined;
    				var me = webeditor.uInfo();
    				var mess = '';
    				if(member && me){
    					if(me.ID === member.id){
    						mess = 'me';
    					} else {
    						mess = member.fullname;
    					}
    				}
    				mess = mess + ': ' + conv.lastMessage;
    				$('.conversations .conversation-item[data-ref-conv=' + conv.id + '] .description').html(mess);
    				if(conv.isStarred){
    					$('.conversations .conversation-item[data-ref-conv=' + conv.id + ']').addClass('starred');
    				} else {
    					$('.conversations .conversation-item[data-ref-conv=' + conv.id + ']').removeClass('starred');
    				}
    			} else {
    				const markup = ``;
    			}
    		});
    		var convs = $('ul.conversations');
    		var items = convs.children('li');
    		var sortList = Array.prototype.sort.bind(items);
    		sortList(function ( a, b ) {
    			var v1 = $(a).data('conv-update');
    			var v2 = $(b).data('conv-update');
			    if ( v1 < v2 ) {
			        return 1;
			    } else if ( v1 > v2 ) {
			        return -1;
			    } else {
			    	return 0;
			    }
			});
			convs.append(items);
    	}
    }
    function renderNote(notes){
    	if(notes && notes.length> 0){
	    	notes = notes.reverse();
	    	notes.forEach(function(note){
	    		if($('.notes li[data-ref-note=' + note.id + ']').length > 0){
	    			$('.notes li[data-ref-note=' + note.id + '] p').html(note.content);
	    			$('.notes li[data-ref-note=' + note.id + '] .hover-controls>span').text(webeditor.fullTime(note.updated));
	    			$('.notes li[data-ref-note=' + note.id + ']').prependTo($('.notes'));
	    		} else {
	    			const markup = `<li class="${note.type.toLowerCase()}" data-ref-note="${note.id}">
						<p>${note.content}</p>
						<div class="hover-controls">
			        		<span>${webeditor.fullTime(note.updated)}</span>
			        		<div class="right">
			        			<a href="javascript:;" class="text-primary mr-3" title="Edit Note" data-conversation-action="edit-note"><i class="fal fa-pencil"></i></a>
			        			<a href="javascript:;" class="text-danger" title="Delete this Note" data-conversation-action="del-note"><i class="fal fa-trash"></i></a>
			        		</div>
			        	</div>
			        	</li>`;
		        	$('.chat-detail-panel .notes').prepend(markup);
	    		} 
	    	});
	    }
    }
    function renderTask(tasks){
    	if(tasks && tasks.length > 0){
    		tasks = tasks.reverse();
	    	tasks.forEach(function(task){
	    		if($('.tasks li[data-ref-task=' + task.id + ']').length > 0){
	    			$('.tasks li[data-ref-task=' + task.id + ']').removeClass('checked').removeClass('expired');
	    			$('.tasks li[data-ref-task=' + task.id + '] p').html(task.name);
	    			$('.tasks li[data-ref-task=' + task.id + '] .hover-controls .name').text(task.assigned === undefined ? '' : task.assigned.fullname);
	    			$('.tasks li[data-ref-task=' + task.id + '] .hover-controls .expired').text(task.expired === 0 ? '' : webeditor.shortTime(task.expired));
	    			if(task.expired >0 && task.expired < moment().valueOf()){
	    				$('.tasks li[data-ref-task=' + task.id + ']').addClass('expired');
	    			}
	    			if(task.completed){
	    				$('.tasks li[data-ref-task=' + task.id + ']').addClass('checked');
	    			}
	    			$('.tasks li[data-ref-task=' + task.id + ']').data('task-assigned', task.assignTo).data('task-expired', task.expired);
	    			$('.tasks li[data-ref-task=' + task.id + ']').prependTo($('.tasks'));
	    			
	    		} else {
	    			const markup = `<li class="${task.completed ? 'checked' : ''} ${task.expired > 0 && task.expired < moment().valueOf() ? 'expired' : ''}" data-ref-task="${task.id}" data-task-assigned="${task.assignTo}" data-task-expired="${task.expired}">
						<p>${task.name}</p>
						<div class="hover-controls">
			        		<div class="assigned">
			        			<span class="name">${task.assigned === undefined ? '' : task.assigned.fullname}</span>
			        			<span class="expired">${task.expired === 0 ? '' : webeditor.shortTime(task.expired)}</span>
			        		</div>
			        		<div class="right">
			        			<a href="javascript:;" class="text-primary" title="Edit Task" data-conversation-action="edit-task"><i class="fal fa-pencil"></i></a>
			        		</div>
			        	</div>
			        	</li>`;
		        	$('.chat-detail-panel .tasks').prepend(markup);
	    		} 
	    	});
    	}
    }
    function renderMessage(messages, old){
    	var members = $('.conversation-detail').data('conv-members');
    	var me = webeditor.uInfo();
    	var lastIdx = '';
    	var minIdx = $('.conversations ul [data-idx]').first().data('idx');
    	var maxIdx = $('.conversations ul [data-idx]').last().data('idx');
    	$.each(messages, function(idx, message){
    		lastIdx = message.index;
    		var lastUser = $('.conversation-detail .message-list li').last().data('ref-user');
    		if(message.type === 'SYS'){
    			const markup = `<li class="chat-item sys"><div class="chat-item-detail"><p data-idx="${message.index}" data-scope-time="${chatTime(message.created)}">${message.message}</p></div></li>`;
    			$('.conversation-detail .message-list ul').append(markup);
    		} else {
    			if(lastUser !== message.sender){
    				var member = members[message.sender];
    				const markup = `<li class="chat-item ${message.sender === me.ID ? 'me': ''}" data-ref-user="${message.sender}" data-scope-name="${member.fullname}">
                        <img class="avatar" src="${member.avatar}">
                        <div class="chat-item-detail">
                        </div>
                    </li>`;
                    $('.conversation-detail .message-list ul').append(markup);
    			}
    			if(message.type === 'TEXT'){
	    			const markup = `<p data-idx="${message.index}" data-scope-time="${chatTime(message.created)}"><message>${message.message}</message></p>`;
	    			$('.conversation-detail .message-list ul li .chat-item-detail').last().append(markup);
    			} else if(message.type === 'LINK'){
    				const markup = `<p data-idx="${message.index}" data-scope-time="${chatTime(message.created)}">${message.message}</p>`;
	    			$('.conversation-detail .message-list ul li .chat-item-detail').last().append(markup);
    			} else if(message.type === 'IMAGE'){
    				const markup = `<attach-image data-idx="${message.index}" class="chat-attachments" data-scope-time="${chatTime(message.created)}">
                        ${message.refFiles.map(file => `
                        	<attach-item class="attach-item ${file.type === 'video'? 'video' : ''}" data-fancybox="message-attach" data-src="${file.path}" data-ref-url="${file.path}">
                                <img src="${file.cover !== undefined ? file.cover : file.path}">
                            </attach-item>
                    	`).join('')}
                    </attach-image>`;
	    			$('.conversation-detail .message-list ul li .chat-item-detail').last().append(markup);
    			} else if(message.type === 'FILE'){
    				const markup = `<attach-file data-idx="${message.index}" data-scope-time="${chatTime(message.created)}">
    					${message.refFiles.map(file =>`<attach-file-item>
						    <i class="fal fa-file-${file.type}"></i>
						    <span>${file.name}</span>
						    <a href="${file.path}" download>${translate('Download')}</a>
						</attach-file-item>`).join('')}
					</attach-file>`;
	    			$('.conversation-detail .message-list ul li .chat-item-detail').last().append(markup);
    			} else if(message.type === 'CARD'){
    				const markup = ``;
	    			$('.conversation-detail .message-list ul li .chat-item-detail').last().append(markup);
    			}
    		}
    	});
    	translates();
		$('.conversation-detail person').each(function(){
			var id = $(this).data('id');
			var member  = members[id];
			$(this).text(member === undefined ? '' : member.fullname);
		});
		if(old === undefined && messages.length > 0){
			setTimeout(scrollContent, 100);
		}
		
    }

    function loadMessages(){
    	if(window.lmto !== undefined){
    		clearTimeout(window.lmto);
    		window.lmto = undefined;
    	}
    	var data = {};
    	data.id = $('.conversation-detail').data('conversation-id');
    	var lastMess = $('.conversation-detail .chat-item-detail [data-idx]').last();
    	data.idx = lastMess.length > 0 ? lastMess.data('idx') : '';
    	data.lastConv = $('.conversations [data-ref-conv]').first().data('ref-conv');
    	data.lastAttach = $('.chat-detail-panel .attachments li[data-ref-attach]').first().data('ref-attach');
		data.lastNote = $('.chat-detail-panel .notes li[data-ref-note]').first().data('ref-note');
		data.lastTask = $('.chat-detail-panel .tasks li[data-ref-task]').first().data('ref-task');
		data.completed = $('.chat-detail-panel .task-status').val();
		data.typing = $('#chat-input').html() !== '';
    	$.ajax({
        	url: '/api/conversation/messages',
            type: 'GET',
            data: data,
            contentType: 'application/json',
            success: function(res) {
                if(res.messages && res.messages.length > 0){
                	renderMessage(res.messages);
                }
                if(res.updated && res.updated !== $('ul.conversations li[data-ref-conv=' + data.id + ']').data('conv-update')){
                	$('ul.conversations li[data-ref-conv=' + data.id + ']').attr('data-conv-update', res.updated).data('conv-update', res.updated);
                	$('ul.conversations li[data-ref-conv=' + data.id + '] [chat-time]').attr('data-ref-value', res.updated).data('ref-value', res.updated);
                	formatHtml();
                }
                if(res.conversations && res.conversations.length > 0){
                	renderConversation(res.conversations);
                }
                if(res.attachments && res.attachments.length > 0){
                	renderAttach(res.attachments);
                }
                if(res.notes && res.notes.length > 0){
                	renderNote(res.notes);
                }
                if(res.tasks && res.tasks.length > 0){
                	renderTask(res.tasks);
                }
                updateTyping(res.typing);
                window.lmto = setTimeout(loadMessages, wait4LoadMessage);
            },
            error: function(jqXHR, textStatus, errorThrown) {
            	window.lmto = setTimeout(loadMessages, wait4LoadMessage);
                if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                    toastr.error(translate(jqXHR.responseJSON.error.message), translate('Load Conversation Message'));
                }
            }
        });
    }
    $(document).on('change', 'select.task-status', function(){
    	$('ul.tasks').empty();
    });
    $(document).on('click', '[data-idx]', function(e){
    	if(e.offsetX < 0 || e.offsetX > this.offsetWidth){
    		var refIdx = $(this).data('idx');
    		var refPersonId = $(this.closest('li.chat-item')).data('ref-user');
    		var refPersonName = $(this.closest('li.chat-item')).data('scope-name');
    		var refMessage = '';
    		if($('message', $(this)).length > 0){
    			var mess = $('message', $(this)).clone();
    			$('reply', mess).remove();
    			refMessage = mess.text().replace(/\n/ig, ' ');
    			if(refMessage.length > 45){
    				refMessage = refMessage.substr(0, 45) + '...';
    			}
    		} else if($('graph', $(this)).length > 0){
    			refMessage = $('graph a', $(this)).attr('href');
    		} else if($('img', $(this)).length > 0){
    			var src = $('img', $(this)).first().attr('src');
    			if(src === undefined || src === ''){
    				refMessage = 'attached image';
    			} else {
    				refMessage = '<img class="small-img" src="' + src + '" style="width:auto; height: 40px;">'
    			}
    		} 
    		const markup = `<reply data-ref-idx="${refIdx}" contenteditable="false"><person data-id="${refPersonId}">${refPersonName}</person><span>${refMessage}</span></reply>&nbsp;`;
    		$('#chat-input').html(markup);
    		$('#chat-input')[0].dispatchEvent(new Event('input', {bubbles:true}));
    		$('#chat-input').focus();
    		return false;
    	}
    });

    $(document).on('click', '.chat-detail-panel .tasks li', function(e){
    	if(e.offsetX > 0 && e.offsetX < 17 && !$(this).hasClass('add-form') && e.target.tagName === 'LI'){
    		var data = {};
    		var target = $(e.target);
    		data.id = $(this).data('ref-task');
    		$.ajax({
            	url: '/api/conversation/toggle-task',
                type: 'POST',
                data: data,
                success: function(res) {
                    target.remove();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Update Task'));
                    }
                }
            });

    	}
    });
    $(document).on('click', 'reply', function(e){
    	if(e.offsetX > this.offsetWidth){
    		$(this).remove();
    		var html = $('#chat-input').html().replace(/\&nbsp;?/ig, ' ').trim();
    		$('#chat-input').html(html);
    		$('#chat-input')[0].dispatchEvent(new Event('input', {bubbles:true}));
    	}
    });
    $(document).on('click', 'reply[data-ref-idx]', function(e){
    	var refIdx = $(this).data('ref-idx') ;
    	if($('[data-idx=' + refIdx + ']').length > 0){
    		$('[data-idx=' + refIdx + ']').addClass('hight-light');
    		$('[data-idx=' + refIdx + ']')[0].scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    		setTimeout(function(){
    			$('[data-idx=' + refIdx + ']').removeClass('hight-light');
    		}, 5000);
    	}
    });
    $(document).on('click', '.conv-note-popover a', function(){
    	var ref = $(this.closest('[id]')).attr('id');
		var cls = $(this).text();
		$('a[aria-describedby=' + ref + ']').text(cls);
		$('a[aria-describedby=' + ref + ']').closest('li').attr('class', cls.toLowerCase());
    });
	$(document).on('click', '[data-conversation-action]', function(){
		var action = $(this).data('conversation-action');
		var $this = $(this);
		switch(action){
			case 'edit-note':{
				var target = $(this.closest('li[data-ref-note]'));
				$('p', target).prop('contenteditable', true);
				$('.hover-controls', target).remove();
				const markup = `<div class="note-controls">
					<a tabindex="0" role="button" data-toggle="popover" data-placement="top" data-trigger="focus" data-html="true" data-content="<div class='conv-note-popover'><a>None</a><a>Meeting</a><a>Call</a></div>" data-placement="top">${translate('Select Type')}</a>
					<a class="btn btn-outline-primary br-circle" data-conversation-action="save-note">${translate('Done')}</a>
				</div>`;
				target.append(markup);
				$("[data-toggle=popover]").popover('update');
				$('p', target).focus();
			}
			break;
			case 'del-note':{
				var data = {};
				var target = $(this.closest('li'));
				data.id = target.data('ref-note');
				webeditor.confirm(translate('Delete Note'), translate('Are you sure you want to delete this note?')).then(res => {
					if(res){
						$.ajax({
		                	url: '/api/conversation/del-note',
			                type: 'POST',
			                data: data,
			                success: function(res) {
			                    target.remove();
			                },
			                error: function(jqXHR, textStatus, errorThrown) {
			                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
			                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Delete Note'));
			                    }
			                }
			            });
					}
				});
			}
			break;
			case 'add-note':{
				if($('.chat-detail-panel .notes li[add-form]').length === 0){
					const markup = `<li add-form>
						<p placeholder="${translate('Write your note here')}" contenteditable></p>
						<div class="note-controls">
							<a tabindex="0" role="button" data-toggle="popover" data-placement="top" data-trigger="focus" data-html="true" data-content="<div class='conv-note-popover'><a>None</a><a>Meeting</a><a>Call</a></div>" data-placement="top">${translate('Select Type')}</a>
							<a class="btn btn-outline-primary br-circle" data-conversation-action="save-note">${translate('Done')}</a>
						</div>
					</li>`;
					$('.chat-detail-panel .notes').prepend(markup);
					$("[data-toggle=popover]").popover('update');
				}
			}
			break;
			case 'save-note':{
				var data = {};
				var target = $(this.closest('li'));
				data.note = $('p', $(this.closest('li'))).html().trim();
				data.id = target.data('ref-note');
				data.convId = $(this.closest('[data-conversation-id]')).data('conversation-id');
				data.type = $(this.closest('li')).attr('class');
				if(data.note === ''){
					if(data.id){
						toastr.error('Please enter your note content!', 'Save Note');
						return false;
					}
					target.remove();
					return false;
				}
				$(this).text('').addClass('spinner-border');
				$.ajax({
                	url: '/api/conversation/note',
	                type: 'POST',
	                data: data,
	                success: function(res) {
	                    if(res.note){
	                    	$('p[contenteditable]', target).prop('contenteditable', false);
	                    	target.data('ref-note', res.note.id).attr('data-ref-note', res.note.id);
	                    	$('.note-controls', target).remove();
	                    	const markup = `<div class="hover-controls">
	                    		<span>${webeditor.fullTime(res.note.updated)}</span>
	                    		<div class="right">
	                    			<a href="javascript:;" class="text-primary mr-3" title="${translate('Edit Note')}" data-conversation-action="edit-note"><i class="fal fa-pencil"></i></a>
	                    			<a href="javascript:;" class="text-danger" title="${translate('Delete this Note')}" data-conversation-action="del-note"><i class="fal fa-trash"></i></a>
	                    		</div>
	                    	</div>`;
	                    	target.append(markup);
	                    	target.remvoeAttr('add-form');
	                    }
	                },
	                error: function(jqXHR, textStatus, errorThrown) {
	                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
	                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Save Note'));
	                    }
	                }
	            });
			}
			break;
			case 'add-task':{
				if($('.chat-detail-panel .tasks li[add-form]').length === 0){
					const markup = `<li class="add-form" add-form>
						<p contenteditable placeholder="${translate('Write your task here...')}"></p>
						<div class="task-controls">
							<select class="no-border hide assigned-users"></select>
							<input type="date" class="form-control" placeholder="${translate('Select date')}">
							<div>
							    <a class="btn btn-outline-primary br-circle" data-conversation-action="save-task">${translate('Save')}</a>
							</div>
						</div>
					</li>`;
					$('.chat-detail-panel .tasks').prepend(markup);
					var options = {};
					options.placeholder = 'Assign to';
					options.allowClear = true;
					options.templateResult = function(option){
						if (!option.id) {
						    return option.text;
						}
						return $('<div><img class="add-task-img" src=' + option.element.dataset.refImg + '>' + option.text + '</div>');
					}
					$.ajax({
		                url: '/api/contact/list',
		                type: 'GET',
		                success: function(res) {
		                    if(res.contacts){
		                        const markup = `<option></option>${res.contacts.map(contact => `
		                            <option data-ref-img="${webeditor.dfAvatar(contact.avatar)}" value="${contact.id}">${contact.fullname}</option>
		                        `).join('')}`;
		                        $('select.no-border.assigned-users').html(markup);
		                    }
		                    $('select.no-border.assigned-users').select2(options);
		                },
		                error: function(jqXHR, textStatus, errorThrown) {}
		            });
				}
			}
			break;
			case 'edit-task':{
				var target = $(this.closest('li[data-ref-task]'));
				var expired = target.data('task-expired');
				var assigned = target.data('task-assigned');
				target.addClass('add-form');
				$('p', target).prop('contenteditable', true);
				$('.hover-controls', target).remove();
				const markup = `<div class="task-controls">
					<select class="no-border hide assigned-users"></select>
					<input type="date" class="form-control" placeholder="${translate('Select date')}" value="${expired !== undefined && expired > 0 ? moment(expired).format('YYYY-MM-DD') : ''}">
					<div>
					    <a class="btn btn-outline-primary br-circle" data-conversation-action="save-task">${translate('Save')}</a>
					</div>
				</div>`;
				target.append(markup);
				var options = {};
				options.placeholder = 'Assign to';
				options.allowClear = true;
				options.templateResult = function(option){
					if (!option.id) {
					    return option.text;
					}
					return $('<div><img class="add-task-img" src=' + option.element.dataset.refImg + '>' + option.text + '</div>');
				}
				$.ajax({
	                url: '/api/contact/list',
	                type: 'GET',
	                success: function(res) {
	                    if(res.contacts){
	                        const markup = `<option></option>${res.contacts.map(contact => `
	                            <option data-ref-img="${webeditor.dfAvatar(contact.avatar)}" ${contact.id === assigned ? 'selected' : ''} value="${contact.id}">${contact.fullname}</option>
	                        `).join('')}`;
	                        $('select.no-border.assigned-users').html(markup);
	                    }
	                    $('select.no-border.assigned-users').select2(options);
	                },
	                error: function(jqXHR, textStatus, errorThrown) {}
	            });
				$('p', target).focus();
			} 
			break;
			case 'save-task':{
				var data = {};
				var target = $(this.closest('li'));
				data.content = $('p', target).html().trim();
				data.id = target.data('ref-task');
				data.convId = $(this.closest('[data-conversation-id]')).data('conversation-id');
				data.assigned = $('select', target).val();
				var expired = $('input', target).val();
				if(data.content === ''){
					if(data.id){
						toastr.error('Please enter your task content!', 'Save Task');
						return false;
					}
					target.remove();
					return false;
				}
				if(expired !== ''){
					var day = moment(expired).endOf('day').valueOf();
					var curr = moment().valueOf();
					var diff = day - curr;
					if(diff < 0){
						toastr.error(translate('Expiry Date must be Greater Than Today\'s Date'), translate('Save Task'));
						return false;
					}
					data.expired = day;
				}
				$(this).text('').addClass('spinner-border');
				$.ajax({
                	url: '/api/conversation/task',
	                type: 'POST',
	                data: data,
	                success: function(res) {
	                    if(res.task){
	                    	target.remove();
	                    }
	                },
	                error: function(jqXHR, textStatus, errorThrown) {
	                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
	                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Save Task'));
	                    }
	                }
	            });
			} 
			break;
			case 'send':{
				var data = {};
				data.message = $('#chat-input').html().replace(/\&nbsp;?/ig, ' ').replace(/\<div\>/ig, '\n').replace(/\<\/div\>/ig, '').trim();
				if(data.message === ''){
					return false;
				}
				if($(this).prop('disabled')){
					return false;
				}
				$(this).prop('disabled', true);

				data.id = $(this.closest('[data-conversation-id]')).data('conversation-id');
				var lastMess = $('.conversation-detail [data-idx]').last();
				data.idx = lastMess.length > 0 ? lastMess.data('idx') : 0;
				$.ajax({
                	url: '/api/conversation/message',
	                type: 'POST',
	                data: data,
	                success: function(res) {
	                    if(res.messages){
	                    	renderMessage(res.messages);
	                    }
	                    $('#chat-input').empty();
	                    $this.prop('disabled', false);
	                },
	                error: function(jqXHR, textStatus, errorThrown) {
	                	$this.prop('disabled', false);
	                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
	                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Load Contact'));
	                    }
	                }
	            });
			}
			break;
			case 'rm-group-member':{
				var refId = $(this.closest('[data-ref-user]')).data('ref-user');
				$('.list-contacts li[data-ref-user=' + refId + '].contact-item').click();
			}
			break;
            case 'show-saved-replies': {
                $('.saved-replies').toggleClass('active');
                if(!$('.saved-replies').hasClass('loaded') && $('.saved-replies').hasClass('active')){
                	$('.saved-replies .spinner-border').removeClass('hide');
                	$.ajax({
	                	url: '/api/conversation/saved-replies',
		                type: 'GET',
		                success: function(res) {
		                    if(res.replies){
		                    	const markup = `${res.replies.map(reply => `<div class="saved-reply-item" data-reply-id="${reply.id}">
		                            <div class="saved-reply-message">${reply.message}</div>
		                            <div class="saved-reply-actions">
		                                <a href="javascript: void(0);" class="btn btn-primary br-circle" data-conversation-action="use-saved-reply">${translate('Use this')}</a>
		                                <div class="right-actions">
		                                    <a href="javascript: void(0);" class="control-item" data-conversation-action="edit-reply" data-reply-id="${reply.id}"><i class="fal fa-pencil"></i></a>
		                                    <a href="javascript: void(0);" class="control-item" data-conversation-action="del-reply" data-reply-id="${reply.id}"><i class="fal fa-trash"></i></a>
		                                </div>
		                            </div>
		                            <div class="saved-reply-title">${reply.title}</div>
		                        </div>`).join('')}`;
		                    	$('.chat-footer .saved-replies').prepend(markup);
		                    }
		                    $('.saved-replies .spinner-border').addClass('hide');
		                    $('.saved-replies').addClass('loaded');
		                },
		                error: function(jqXHR, textStatus, errorThrown) {
		                	$('.saved-replies .spinner-border').addClass('hide');
		                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
		                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Load Contact'));
		                    }
		                }
		            });
                }
            }
            break;
			case 'hide-saved-replies':{
				$('.saved-replies.active').removeClass('active');
			}
			break;
			case 'quick-replaces':{
				$.ajax({
	                url: '/api/user/quick-replaces',
	                type: 'GET',
	                success: function(res) {
	                	if($('#quick-replacement-modal').length === 0){
	                		const markup = `<div class="modal" tabindex="-1" id="quick-replacement-modal">
							  <div class="modal-dialog">
							    <div class="modal-content">
							      <div class="modal-header">
							        <h5 class="modal-title">${translate('Quick Replacement Setup')}</h5>
							        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							      </div>
							      <div class="modal-body">
							      	<p class="text-muted">${translate('* Key only accept A-Z, 0-9 and _')}</p>
							      	<ul class="all-replacements"></ul>
							      	<a href="javascript:;" class="link-primary" data-conversation-action="add-quick-replacement"><i class="fa fa-plus mr-2"></i>${translate('Add')}</a>
							      </div>
							      <div class="modal-footer">
							        <button type="button" class="btn btn-secondary" data-dismiss="modal">${translate('Close')}</button>
							        <button type="button" class="btn btn-primary" data-conversation-action="save-quick-replacement"><i class="loading far fa-save mr-2"></i>${translate('Save changes')}</button>
							      </div>
							    </div>
							  </div>
							</div>`;
	                		$('body').append(markup);
	                	}
	                    if(res.replacements){
	                    	localStorage.setItem('replacements', JSON.stringify(res.replacements));
	                    	const markup = `${Object.keys(res.replacements).map(k => `
	                    		<li class="d-flex flex-row align-items-center my-1">
			                        <input class="form-control" onkeydown="return /[a-z_0-9]/i.test(event.key)" name="replacement-key" placeholder="${translate('Replacement Key')}" value="${k}">
			                        <input class="form-control" name="replacement-value" placeholder="${translate('Replacement Value')}" value="${res.replacements[k]}">
			                        <i class="fas fa-times fa-lg ps-3 trash" data-conversation-action="remove-quick-replacement"></i>
			                    </li>
                    		`).join('')}
                    		<li class="d-flex flex-row align-items-center my-1">
		                        <input class="form-control" onkeydown="return /[a-z_0-9]/i.test(event.key)" name="replacement-key" placeholder="${translate('Replacement Key')}">
		                        <input class="form-control" name="replacement-value" placeholder="${translate('Replacement Value')}">
		                        <i class="fas fa-times fa-lg ps-3 trash" data-conversation-action="remove-quick-replacement"></i>
		                    </li>`;
							$('#quick-replacement-modal .modal-body .all-replacements').html(markup);
	                    }
	                    $('#quick-replacement-modal .loading').removeClass('spinner-border');
	                    $('#quick-replacement-modal').modal({backdrop: 'static', keyboard: false});
	                },
	                error: function(jqXHR, textStatus, errorThrown) {
	                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
	                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Load Quick Replacement'));
	                    }
	                }
	            });
			}
			break;
			case 'save-quick-replacement':{
				$('#quick-replacement-modal .is-invalid').removeClass('is-invalid');
				var rplMap = {};
				var error = '';
				$('#quick-replacement-modal .all-replacements li').each(function(){
					var key = $('input[name=replacement-key]', $(this)).val().trim().toUpperCase();
					var val = $('input[name=replacement-value]', $(this)).val().trim();
					if(key !== '' || val !== ''){
						if(key === ''){
							$('input[name=replacement-key]', $(this)).addClass('is-invalid');
						} else if(val === ''){
							$('input[name=replacement-value]', $(this)).addClass('is-invalid');
						} else {
							if(key.match(/^[a-z0-9_]+$/i) === null){
								$('input[name=replacement-key]', $(this)).addClass('is-invalid');
								error = translate('The Key only accepts the characters a-z, 0-9 and _');
							} else if(rplMap.hasOwnProperty(key)){
								$('input[name=replacement-key]', $(this)).addClass('is-invalid');
								error = translate('The key must be unique');
							} else {
								rplMap[key] = val;
							}
						}
					}
				});
				if($('#quick-replacement-modal .is-invalid').length >0){
					toastr.error(error !== '' ? error : translate('Please fill the required fields'), translate('Quick Replacement'));
				} else {
					if(Object.keys(rplMap).length > 0){
						var data = {};
						data.replacements = JSON.stringify(rplMap);
						$('#quick-replacement-modal .loading').addClass('spinner-border');
						$.ajax({
			                url: '/api/user/quick-replaces',
			                type: 'POST',
			                data: data,
			                success: function(res) {
			                    if(res.replacements){
			                    	localStorage.setItem('replacements', JSON.stringify(res.replacements));
			                    }
			                    $('#quick-replacement-modal').modal('hide');
			                },
			                error: function(jqXHR, textStatus, errorThrown) {
			                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
			                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Quick Replacement'));
			                    }
			                    $('#quick-replacement-modal .loading').removeClass('spinner-border');
			                }
			            });
					} else {
						$('#quick-replacement-modal').modal('hide');
					}
				}
			}
			break;
			case 'add-quick-replacement':{
				const markup = `<li class="d-flex flex-row align-items-center my-1">
                    <input class="form-control" name="replacement-key" onkeydown="return /[a-z_0-9]/i.test(event.key)" placeholder="${translate('Replacement Key')}">
                    <input class="form-control" name="replacement-value" placeholder="${translate('Replacement Value')}">
                    <i class="fas fa-times fa-lg ps-3 trash" data-conversation-action="remove-quick-replacement"></i>
                </li>`;
                $('#quick-replacement-modal .modal-body .all-replacements').append(markup);
			}
			break;
			case 'remove-quick-replacement':{
				if($('#quick-replacement-modal .all-replacements li').length === 1){
					toastr.error(translate('The last element cannot be deleted'), translate('Remove Quick Replacement'));
				} else {
					$(this.closest('li')).remove();
				}
			}
			break;
			case 'add-member-modal': {
				var convId  =$(this).data('ref-conv-id');
				$('#group-member-modal').data('ref-conv-id', convId);
				var members = $(this).data('members');
				if(members === undefined){
					members = [];
				}
				$.ajax({
	                url: '/api/contact/list',
	                type: 'GET',
	                success: function(res) {
	                    if(res.contacts){
	                    	const markup = `${res.contacts.map(user => `<li class="contact-item" data-ref-user="${user.id}" data-ref-avatar="${webeditor.dfAvatar(user.avatar)}" data-ref-email="${user.email}" data-ref-username="${user.username}" data-ref-fullname="${user.fullname}">
								<div class="user-block text-left">
									<img class="img-circle" src="${webeditor.dfAvatar(user.avatar)}" alt="${user.fullname}">
									<span class="username"><a href="javascript: void(0);">${user.fullname}</a></span>
									<span class="description"><i>@${user.username}</i> - ${webeditor.timeAgo(user.lastActive)}</span>
								</div>
								<div class="icheck-primary icheck-circle d-inline">
									${members.includes(user.id)? '<span>Joined</span>' : `<input type="checkbox" id="checkbox-contact-${user.id}" data-ref-user-id="${user.id}">
									<label for="checkbox-contact-${user.id}"></label>`}
								</div>
								</li>`).join('')}`;
							$('#group-member-modal .contact-container .list-contacts').html(markup);
	                    }
	                    $('#group-member-modal').modal({backdrop: 'static', keyboard: false});
	                },
	                error: function(jqXHR, textStatus, errorThrown) {
	                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
	                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Load Contact'));
	                    }
	                }
	            });

			}
			break;
			case 'add-member': {
				var data = {};
				data.id = $('#group-member-modal').data('ref-conv-id');
				if(!data.id){
					toastr.error('Unable add member to this conversation at this time. Please try again at a later time or contact support for help.', 'Add Member');
					return false;
				}
				var members = [];
				$('#group-member-modal .users .user-block[data-ref-user]').each(function(){
					var member = $(this).data('ref-user');
					if(member){
						members.push(member);
					}
				});
				data.members = members.join(';');
				$.ajax({
	                url: '/api/conversation/add-member',
	                type: 'POST',
	                data: data,
	                success: function(res) {
	                    if(res.conversation){
	                    	$('.conversation-detail [data-conversation-action=add-member-modal]').data('members', res.conversation.memberIds);
	                    	var members = Object.values(res.conversation.members);
	                    	$.each(members, function(i, user){
	                    		if($('.chat-detail-panel .conversation-members li[data-user-id=' + user.id + ']').length === 0){
	                    			const markup = `<li class="user-block w-100" data-user-id="${user.id}">
					                    <img class="img-circle img-bordered-sm mr-3" src="${webeditor.dfAvatar(user.avatar)}" alt="test">
					                    <span>${user.fullname}</span>
					                </li>`;
					                $('.chat-detail-panel .conversation-members').append(markup);
	                    		}
	                    	});
			                var names = $.map([...members],function(value,i) {
						      	return {'id': value.id,'name':value.fullname,'avatar': webeditor.dfAvatar(value.avatar)};
						    });
			                var mentions = {
				               at: "@",
				               data: names,
				               insertTpl: '@<person data-id="${id}">${name}</person>',
				               displayTpl: '<li class="atwho-person"><img src="${avatar}" style=""> ${name}</li>',
				               limit: 200
				            };
				            $('#chat-input').atwho('destroy').atwho(mentions);
	                    }
	                    $('#group-member-modal .users').empty();
						$('#group-member-modal .conv-controls').removeClass('active');
						$('#group-member-modal').modal('hide');
	                },
	                error: function(jqXHR, textStatus, errorThrown) {
	                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
	                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Add Member'));
	                    }
	                }
	            });
			}
			break;
            case 'load-conversation': {
                var data = {};
                data.id = $(this).data('ref-conv');
                if(data.id === $('.conversation-detail[data-conversation-id]').data('conversation-id')){
                	return false;
                }
                $.ajax({
                	url: '/api/conversation/detail',
	                type: 'GET',
	                data: data,
	                success: function(res) {
	                    if(res.conversation){
	                    	$('.conversations .conversation-item.active').removeClass('active');
			                $this.addClass('active');
			                $('.conversation-detail').addClass('active');
			                if($('.conversation-detail .welcome-screen').length > 0){
			                	const markup = `<div class="header">
					                <div class="user-block">
					                    <a href="javascript: void(0);" data-conversation-action="close-conversation" class="back"><i class="fal fa-chevron-left"></i></a>
					                    <img class="img-circle img-bordered-sm" src="https://task.smartpage.vn/userfiles/SP-T-PRJ-1/SP-T-T-2/1663915733130_DojaMCF4cAA_thumb.jpg" alt="User Image">
					                    <span class="username">
					                        <span>Duy Anh</span>
					                    </span>
					                    <span class="text-muted small description">09/23/2022</span>
					                </div>
					                <div class="controls">
					                	<a href="javascript: void(0);" data-conversation-action="add-member-modal" class="control-item hide" data-toggle="tooltip" title="${translate('Add Member')}"><i class="fal fa-user-plus"></i></a>
					                    <a href="javascript: void(0);" data-conversation-action="star" class="control-item" data-toggle="tooltip" title="${translate('Star Conversation')}" ><i class="fal fa-star"></i></a>
					                    <a href="javascript: void(0);" data-conversation-action="toggle-detail" class="control-item" data-toggle="tooltip" title="${translate('Show Conversation Detail')}"><i class="fal fa-info-circle"></i></a>
					                </div>
					            </div>
					            <div class="body" style="width: calc(100%);">
					                <div class="content">
					                    <div class="message-list">
					                        <ul></ul>
					                        <div class="anchor"></div>
					                        <div class="conv-empty-message">
					                        	<img src="/img/chats.png">
					                        	<h3>${translate('Start a Chat')}</h3>
					                        	<span class="text-muted">${translate('No messages to show yet.')}</span>
					                        </div>
					                    </div>
					                </div>
					                <div class="chat-footer">
					                    <div class="line d-none flex-row justify-content-between">
					                        <div class="">
					                            <span>Message via: </span>
					                            <a href="javascript: void(0);">Email</a>
					                        </div>
					                        <a href="javascript: void(0);" class="control-item" data-toggle="popover" data-trigger="focus" title="" role="button" data-html="true" data-content-target="#settings-email" data-original-title="Email Settings"><i class="fal fa-cog"></i></a>
					                        <div class="d-none" id="settings-email">
					                            <span>Your emails are currently sent from: no-reply@smartpage.vn</span><br>
					                            <a class="link-primary request-mail-permission" data-btn-action="request-mail-permission">Change to gmail</a>
					                        </div>
					                    </div>
					                    <div class="line saved-replies">
					                    	<span class="spinner-border mr-3 hide" style="order: -1;"></span>
					                        <div class="saved-reply-item create-saved-reply" data-conversation-action="saved-reply-modal">
					                            <svg viewBox="0 0 63 63" fill="currentColor" width="63" height="63" class="sP5FYjL"><path d="M31 31V0h1v31h31v1H32v31h-1V32H0v-1z"></path></svg>
					                            <span>${translate('Create Saved Reply')}</span>
					                        </div>
					                        <a href="javascript: void(0);" data-conversation-action="hide-saved-replies" class="hide-saved-replies"><i class="fal fa-chevron-down"></i></a>
					                        <a href="javascript: void(0);" data-conversation-action="quick-replaces" class="quick-replace"><i class="fal fa-cog"></i></a>
					                    </div>
					                    <div class="uploading-bar"><div class="progress-bar"></div></div>
					                    <div class="line">
					                        <div id="chat-input" class="chat-input" placeholder="${translate('Type your message...')}" contenteditable="" autocapitalize="on" style="overflow: auto; height: 32px;"></div>
					                        <div class="d-flex flex-row justify-content-between">
					                            <div class="chat-controls">
					                                <a href="javascript: void(0);" data-conversation-action="show-saved-replies" class="control-item" data-toggle="tooltip" title="${translate('Saved Replies')}"><i class="fal fa-share-square"></i></a>
					                                <a href="javascript: void(0);" data-conversation-action="toggle-emoji" class="control-item" data-toggle="tooltip" title="${translate('Emojis')}"><i class="fal fa-smile-beam"></i></a>
					                                <label for="chat-attach-file" class="control-item link-primary mb-0" data-toggle="tooltip" title="${translate('Files')}"><i class="fal fa-paperclip"></i></label>
					                                <input type="file" class="d-none" id="chat-attach-file" multiple="">
					                            </div>
					                            <button class="btn btn-outline-primary br-circle" data-conversation-action="send">${translate('Send')}<span class="spinner-border"></span></button>
					                        </div>
					                    </div>
					                </div>
					            </div>`;
						        $('.conversation-detail').html(markup);
			                }
			                $('.conversation-detail').data('conversation-id', res.conversation.id).data('conversation-type', res.conversation.type);
			                const addMarkup = `<li class="user-block w-100"><a href="javascript:;" data-conversation-action="add-member-modal" class="add-member"><i class="fal fa-plus"></i><span class="language">Add Member</span></a></li>`;
			                $('.chat-detail-panel .conversation-members').html(addMarkup);
			                var members = Object.values(res.conversation.members);
	                    	$.each(members, function(i, user){
	                    		if($('.chat-detail-panel .conversation-members li[data-user-id=' + user.id + ']').length === 0){
	                    			const markup = `<li class="user-block w-100" data-user-id="${user.id}">
					                    <img class="img-circle img-bordered-sm mr-3" src="${webeditor.dfAvatar(user.avatar)}" alt="test">
					                    <span>${user.fullname}</span>
					                </li>`;
					                $('.chat-detail-panel .conversation-members').append(markup);
	                    		}
	                    	});
			                var title = '';
			                var thumb = '';
			                var strMember = '';
			                if(res.conversation.type === 'P2P'){
			                	$('.chat-detail-panel .detail-members').addClass('hide');
		                		var target = res.conversation.sender === webeditor.user().id ? res.conversation.receiver : res.conversation.sender;
		                		var member = res.conversation.members[target];
		                		thumb = webeditor.dfAvatar(member.avatar);
		                		title = member.fullname;
		                		if(member.lastActive && !isNaN(member.lastActive)){
		                			strMember = moment(parseInt(member.lastActive)).fromNow();
		                		}
		                		$('.conversation-detail [data-conversation-action=add-member-modal]').addClass('hide');
		                	} else {
		                		$('.chat-detail-panel .detail-members').removeClass('hide');
		                		title = res.conversation.title;
		                		thumb = res.conversation.thumb;
		                		strMember = res.conversation.memberIds.length + ' ' + translate('members');
		                		$('.conversation-detail [data-conversation-action=add-member-modal]').data('ref-conv-id', res.conversation.id).removeClass('hide').data('members', res.conversation.memberIds);
		                	}
		                	if(res.conversation.isStarred){
		                		$('.conversation-detail [data-conversation-action=star]').addClass('starred');
		                	} else {
		                		$('.conversation-detail [data-conversation-action=star]').removeClass('starred');
		                	}
			                $('.conversation-detail .header .username span').text(title);
			                $('.conversation-detail .header .user-block>img').attr('src',thumb);
			                $('.conversation-detail .header .user-block .description').text(strMember);
			                $('.conversation-detail .body .content .message-list ul').empty();
			                $('.conversation-detail .body .chat-footer .saved-replies .saved-reply-item:not(.create-saved-reply)').remove();
			                $('.conversation-detail').data('conv-members', res.conversation.members);
			                var members = Object.values(res.conversation.members);
			                var names = $.map([...members],function(value,i) {
						      	return {'id': value.id,'name':value.fullname,'avatar': webeditor.dfAvatar(value.avatar)};
						    });
			                var mentions = {
				               at: "@",
				               data: names,
				               insertTpl: '@<person data-id="${id}">${name}</person>',
				               displayTpl: '<li class="atwho-person"><img src="${avatar}" style=""> ${name}</li>',
				               limit: 200
				            };
				            $('#chat-input').empty();
				            $('.conversation-detail [data-conversation-action=send]').prop('disabled', false);
				            $('#chat-input').atwho(mentions).focus();
				            $('.chat-detail-panel').data('conversation-id', res.conversation.id);
				            $('.chat-detail-panel .attachments').empty();
				            $('.chat-detail-panel .notes').empty();
				            $('.chat-detail-panel .tasks').empty();
				            loadMessages();
	                    }
	                },
	                error: function(jqXHR, textStatus, errorThrown) {
	                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
	                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Load Contact'));
	                    }
	                }
	            });
            }
            break;
        	case 'toggle-members': {
        		$('.chat-detail-panel .conversation-members').toggleClass('hide');
        	}
        	break;
            case 'close-conversation': {
                $(this).closest('.conversation-detail').removeClass('active');
                $('.conversations .conversation-item.active').removeClass('active');
            }
            break;
        	case 'saved-reply-modal':{
        		$('#saved-reply-modal .modal-title h3').text(translate('Create new Reply Template'));
        		$('#saved-reply-modal #reply-id').val('');
        		$('#saved-reply-modal #reply-title').val('');
        		$('#saved-reply-modal #reply-message').val('');
        		$('#saved-reply-modal').modal({backdrop: 'static', keyboard: false});
        	}
        	break;
        	case 'add-reply':{
    			$('#saved-reply-modal .is-invalid').removeClass('is-invalid');
        		var data = {};
        		data.id = $('#reply-id').val();
        		data.title = $('#reply-title').val();
        		data.message = $('#reply-message').val();
        		if(data.title === ''){
        			$('#reply-title').addClass('is-invalid');
        			return false;
        		}
        		if(data.message === ''){
        			$('#reply-message').addClass('is-invalid');
        			return false;
        		}
        		$('i', $this).addClass('spinner-border');
        		$.ajax({
	                url: '/api/conversation/saved-reply',
	                type: 'POST',
	                data: data,
	                success: function(res) {
	                    if(res.reply){
	                    	if($('[data-reply-id=' + res.reply.id + ']').length > 0){
	                    		$('[data-reply-id=' + res.reply.id + '] .saved-reply-message').text(res.reply.message);
	                    		$('[data-reply-id=' + res.reply.id + '] .saved-reply-title').text(res.reply.title);
	                    	} else {
	                    		const markup = `<div class="saved-reply-item" data-reply-id="${res.reply.id}">
		                            <div class="saved-reply-message">${res.reply.message}</div>
		                            <div class="saved-reply-actions">
		                                <a href="javascript: void(0);" class="btn btn-primary br-circle" data-conversation-action="use-saved-reply">${translate('Use this')}</a>
		                                <div class="right-actions">
		                                    <a href="javascript: void(0);" class="control-item" data-conversation-action="edit-reply" data-reply-id="${res.reply.id}"><i class="fal fa-pencil"></i></a>
		                                    <a href="javascript: void(0);" class="control-item" data-conversation-action="del-reply" data-reply-id="${res.reply.id}"><i class="fal fa-trash"></i></a>
		                                </div>
		                            </div>
		                            <div class="saved-reply-title">${res.reply.title}</div>
		                        </div>`;
	                    		$('.chat-footer .saved-replies').prepend(markup);
	                    	}
	                    }
	                    $('i', $this).removeClass('spinner-border');
	                    $('#saved-reply-modal').modal('hide');
	                },
	                error: function(jqXHR, textStatus, errorThrown) {
	                	$('i', $this).removeClass('spinner-border');
	                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
			                toastr.error(translate(jqXHR.responseJSON.error.message), translate('Add Saved Reply'));
			            }
	                }
	            });

        	}
        	break;
        	case 'edit-reply':{
        		var data = {};
        		data.id = $(this).data('reply-id');
        		$.ajax({
	                url: '/api/conversation/saved-reply',
	                type: 'GET',
	                data: data,
	                success: function(res) {
	                    if(res.reply){
	                    	$('#saved-reply-modal .modal-title h3').text(translate('Edit Reply Template'));
			        		$('#saved-reply-modal #reply-id').val(res.reply.id);
			        		$('#saved-reply-modal #reply-title').val(res.reply.title);
			        		$('#saved-reply-modal #reply-message').val(res.reply.message);
			        		$('#saved-reply-modal').modal({backdrop: 'static', keyboard: false});
	                    }
	                },
	                error: function(jqXHR, textStatus, errorThrown) {
	                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
			                toastr.error(translate(jqXHR.responseJSON.error.message), translate('Saved Reply'));
			            }
	                }
	            });
        	}
        	break;
        	case 'del-reply': {
        		var target = $(this.closest('[data-reply-id].saved-reply-item'));
        		webeditor.confirm(translate('Delete Saved Reply'), translate('Are you sure you want to remove this Saved Reply?')).then(res => {
        			if(res){
        				var data = {};
		        		data.id = $(this).data('reply-id');
		        		$.ajax({
			                url: '/api/conversation/del-reply',
			                type: 'POST',
			                data: data,
			                success: function(res) {
			                    target.remove();
			                },
			                error: function(jqXHR, textStatus, errorThrown) {
			                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
					                toastr.error(translate(jqXHR.responseJSON.error.message), translate('Saved Reply'));
					            }
			                }
			            });
        			}
        		});
        	}
        	break;
			case 'use-saved-reply': {
                var mess = $('.saved-reply-message', $(this).closest('.saved-reply-item')).text().trim().replace(/\{{2,}/g, '{').replace(/\}{2,}/g, '}').replace(/\{/g, '${').replace(/(\{[^\{\}]+\})/g, function(v){return v.toUpperCase();});
                let node = document.createTextNode(mess.fmTemp(webeditor.uInfo()));
                $('#chat-input').html(node);
                $('#chat-input')[0].dispatchEvent(new Event('input', {bubbles:true}));
                $(this.closest('.saved-replies.active')).removeClass('active');
                $('#chat-input').focus();
                return false;
            }
            break;
			case 'create-group': {
				if($(this).is(':disabled') || $(this).prop('disabled')){
					console.log('disabled')
					return false;
				}
				console.log('create-group');
				$('#converstion-group-modal input[name=conv-group-name]').removeClass('has-error');
				var data = {};
				data.type = "GROUP";
				var members = [];
				data.title = $('#converstion-group-modal input[name=conv-group-name]').val();
				if(data.title === ''){
					$('#converstion-group-modal input[name=conv-group-name]').addClass('has-error');
					return false;
				}
				if($('#converstion-group-modal .conv-group-image img').length > 0){
					data.thumb = $('#converstion-group-modal .conv-group-image img').attr('src');
				}
				$('#converstion-group-modal .conv-controls .users .user-block').each(function(){
					members.push($(this).data('ref-user'));
				}).promise().done(function(){
					data.members = members.join(';');
					initChat(data);
				});
			}
			break;
			case 'empty-input': {
				var target = $(this).prev('input[name=filter-contact]').val('');
				$(this).hide();
				$('.contact-container .list-contacts .contact-item', $(this.closest('modal-body'))).show();
			}
			break;
			case 'add-contact':{
				var modal = $(this.closest('.modal')).attr('id');
				webeditor.prompt(translate('Add Contact'),`<div class="form-group">
				    <label for="contact-search">${translate('Contact')}</label>
				    <input type="text" class="form-control" id="contact-search" placeholder="${translate('Add by Email, Phone or UserName')}" required autocomplete="off">
				    <input type="hidden" name="modal" value="#${modal}">
				    <div class="invalid-feedback">${translate('Please enter query string.')}</div>
				</div>`).then(data=>{
					if(data){
						$('i.fal', $this).addClass('spinner-border');
						$.ajax({
			                url: '/api/contact/add',
			                type: 'POST',
			                data: data,
			                success: function(res) {
			                    if(res.contacts){
			                    	if(res.contacts.length === 0){
			                    		toastr.error(translate('No matching results were found'), translate('Add Contact'));
			                    	} else {
				                    	const markup = `${res.contacts.map(user => `<li class="contact-item" data-ref-user="${user.id}" data-ref-avatar="${webeditor.dfAvatar(user.avatar)}" data-ref-email="${user.email}" data-ref-username="${user.username}" data-ref-fullname="${user.fullname}">
											<div class="user-block text-left">
												<img class="img-circle" src="${webeditor.dfAvatar(user.avatar)}" alt="${user.fullname}">
												<span class="username"><a href="javascript: void(0);">${user.fullname}</a></span>
												<span class="description"><i>@${user.username}</i> - ${webeditor.timeAgo(user.lastActive)}</span>
											</div>
											<div class="icheck-primary icheck-circle d-inline">
												<input type="checkbox" id="checkbox-contact-${user.id}" data-ref-user-id="${user.id}">
												<label for="checkbox-contact-${user.id}"></label>
											</div>
											</li>`).join('')}`;
				                    	$(data.modal + ' .contact-container .list-contacts>span').remove();
										$(data.modal + ' .contact-container .list-contacts').prepend(markup);
			                    	}
			                    }
			                    $('i.fal', $this).removeClass('spinner-border');
			                },
			                error: function(jqXHR, textStatus, errorThrown) {
			                	$('i.fal', $this).removeClass('spinner-border');
			                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
					                toastr.error(translate(jqXHR.responseJSON.error.message), translate('Add Contact'));
					            }
			                }
			            });
					}
				});
			}
			break;
			case 'filter-conversation': {
				$('.filter-conversation').focus();
			}
			break;
			case 'init-chat':{
				$('#converstion-contact-modal .modal-body .contact-container .list-contacts').html('<li><div class="spinner-border text-primary mt-5 mb-5"></div></li>');
				loadContact($('#converstion-contact-modal .modal-body .contact-container .list-contacts'));
				$('#converstion-contact-modal').modal('show');
			}
			break;
			case 'init-group':{
				$('#converstion-group-modal .modal-body .contact-container .list-contacts').html('<li><div class="spinner-border text-primary mt-5 mb-5"></div></li>');
				loadContact($('#converstion-group-modal .modal-body .contact-container .list-contacts'));
				$('#converstion-group-modal').modal({backdrop: 'static', keyboard: false});
			}
			break;
			case 'close-group-modal':{
				var members = $('#converstion-group-modal .users li').length;
				var title = $('#converstion-group-modal input.conv-group-name').val();
				if(title !== '' || members > 0){
					webeditor.confirm(translate('Create New Conversation'), translate('Have not finished creating the Conversation, exit this modal?')).then(res => {
						if(res){
							$('#converstion-group-modal .users').empty();
							$('#converstion-group-modal .conv-controls').removeClass('active');
							$('#converstion-group-modal').modal('hide');
						}
					});
				} else {
					$('#converstion-group-modal').modal('hide');
				}
			}
			break;
			case 'close-add-member-modal':{
				var members = $('#group-member-modal .users li').length;
				if(members > 0){
					webeditor.confirm(translate('Add Member'), translate('Have not finished adding member, exit this modal?')).then(res => {
						if(res){
							$('#group-member-modal .users').empty();
							$('#group-member-modal .conv-controls').removeClass('active');
							$('#group-member-modal').modal('hide');
						}
					});
				} else {
					$('#group-member-modal').modal('hide');
				}
			}
			break;
			case 'toggle-emoji':{
				var isVisible = $('.chat-emoji-panel').is(':visible');
				if(isVisible){
					$('.chat-emoji-panel').removeClass('active');
					$('.conversation-detail .body').css('width', 'calc(100%)');
				} else {
					$('.chat-emoji-panel').addClass('active');
					$('.chat-detail-panel').removeClass('active');
					$('.conversation-detail .body').css('width', 'calc(100% - 320px)');
					$('#chat-input').focus();
				}
			}
			break;
			case 'toggle-detail': {
				var isVisible = $('.chat-detail-panel').is(':visible');
				if(isVisible){
					$('.chat-detail-panel').removeClass('active');
					$('.conversation-detail .body').css('width', 'calc(100%)');
				} else {
					$('.chat-detail-panel').addClass('active');
					$('.chat-emoji-panel').removeClass('active');
					$('.conversation-detail .body').css('width', 'calc(100% - 320px)');
				}
			}
			break;
			case 'star': {
				var id = $(this.closest('[data-conversation-id]')).data('conversation-id');

				$.ajax({
	                url: '/api/conversation/toggle-star',
	                type: 'POST',
	                data: {id: id},
	                success: function(res) {
	                    if(res.starred){
	                    	$this.addClass('starred');
	                    	$('.conversations[data-ref-conv=' + id + ']').addClass('starred');
	                    } else {
	                    	$this.removeClass('starred');
	                    	$('.conversations[data-ref-conv=' + id + ']').removeClass('starred');
	                    }
	                },
	                error: function(jqXHR, textStatus, errorThrown) {
	                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
	                        toastr.error(translate(jqXHR.responseJSON.error.message), translate('Conversation Detail'));
	                    }
	                }
	            });
			}
			break;
		}
	});
});