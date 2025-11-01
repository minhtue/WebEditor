const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
$.ajax({
    url: '/api/me',
    type: 'GET',
    success: function(res) {
        if(res.me){
            localStorage.setItem('logged_user', JSON.stringify(res.me));
        } else {
            localStorage.removeItem('logged_user');
        }
        if(res.replacements){
            localStorage.setItem('replacements', JSON.stringify(res.replacements));
        } else {
            localStorage.removeItem('replacements');
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {}
});
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  if(exdays === null || exdays === undefined || !isNaN(exdays)){
    exdays = 365;
  }
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  let user = getCookie("username");
  if (user != "") {
    alert("Welcome again " + user);
  } else {
    user = prompt("Please enter your name:", "");
    if (user != "" && user != null) {
      setCookie("username", user, 365);
    }
  }
}
const supportLanguages = ['en', 'vi'];
function lang(){
    var l = getCookie('lang');
    if(l === undefined){
        l = navigator.language;
    }
    l = l.substring(0, 2);
    if(supportLanguages.includes(l)){
        return l;
    }
    return 'en';
}
function changeLang(l){
    if(supportLanguages.includes(l)){
        _lang = l;
        setCookie('lang', l);
        loadLanguage();
    }
}
var _lang = lang();
var langData = {};
function loadLanguage(){
    fetch(`/i18n/${_lang}.json`)
      .then((res) => res.json())
      .then((translation) => {
        langData = translation;
        translates();
      }).catch((error) => {
        console.error(`Could not load ${_lang}.json.`, error);
    });
}
loadLanguage();
function translates(){
    if(langData === undefined || Object.keys(langData).length === 0){
        return false;
    }
    $('[data-noresults]').each(function(){
        var key = $(this).data('data-language-noresults');

        if(key === undefined || key === null || key === ''){
            key = $(this).attr('data-noresults');
            if(key === undefined || key === null || key === ''){
                return;
            } else {
                $(this).data('data-language-noresults', key);
            }
        }
        var val = langData[key];
        if(val !== undefined && val !== ''){
            var rpls = $(this).data('replace-items');
            if(rpls !== null && rpls !== undefined && Object.keys(rpls).length > 0){
                $.each(rpls, function(k, v){
                    val = val.replace('{' + k + '}', v);
                });
            }
            $(this).attr('data-noresults', val);
        }
    });
    $('[data-validate]').each(function(){
        var key = $(this).data('data-language-validate');
        if(key === undefined || key === null || key === ''){
            key = $(this).attr('data-validate');
            if(key === undefined || key === null || key === ''){
                return;
            } else {
                $(this).data('data-language-validate', key);
            }
        }
        var val = langData[key];
        if(val !== undefined && val !== ''){
            var rpls = $(this).data('replace-items');
            if(rpls !== null && rpls !== undefined && Object.keys(rpls).length > 0){
                $.each(rpls, function(k, v){
                    val = val.replace('{' + k + '}', v);
                });
            }
            $(this).attr('data-validate', val);
        }
    });
    $('[placeholder]').each(function(){
        var key = $(this).data('language-placeholder');
        if(key === undefined || key === null || key === ''){
            key = $(this).attr('placeholder');
            if(key === undefined || key === null || key === ''){
                return;
            } else {
                $(this).data('language-placeholder', key);
            }
        }
        var val = langData[key];
        if(val !== undefined && val !== ''){
            var rpls = $(this).data('replace-items');
            if(rpls !== null && rpls !== undefined && Object.keys(rpls).length > 0){
                $.each(rpls, function(k, v){
                    val = val.replace('{' + k + '}', v);
                });
            }
            $(this).attr('placeholder', val);
        }
    });
    $('[data-after]').each(function(){
        var key = $(this).data('language-after');
        if(key === undefined || key === null || key === ''){
            key = $(this).attr('data-after');
            if(key === undefined || key === null || key === ''){
                return;
            } else {
                $(this).data('language-after', key);
            }
        }
        var val = langData[key];
        if(val !== undefined && val !== ''){
            var rpls = $(this).data('replace-items');
            if(rpls !== null && rpls !== undefined && Object.keys(rpls).length > 0){
                $.each(rpls, function(k, v){
                    val = val.replace('{' + k + '}', v);
                });
            }
            $(this).attr('data-after', val);
        }
    });
    initSelect2();
    $('.language, .select2-results__option, .select2-selection__rendered').each(function(){
        var element = this;
        if(element.children.length === 0){
            if(element.childNodes.length != 1){
                return;
            } else if( element.childNodes[0].nodeName != '#text'){
                return;
            }
            var key = $(this).data('language');
            if(key === undefined || key === null || key === ''){
                key = $(this).text();
                if(key === undefined || key === null || key === ''){
                    return;
                } else {
                    $(this).data('language', key);
                }
            }
            var val = langData[key];
            if(val !== undefined && val !== ''){
                var rpls = $(this).data('replace-items');
                if(rpls !== null && rpls !== undefined && Object.keys(rpls).length > 0){
                    
                    $.each(rpls, function(k, v){
                        val = val.replace('{' + k + '}', v);
                    });
                }
                $(this).text(val);
            }
        }
    });
}
function translate(key, rpls){
    if(key === undefined || key === ''){
        return '';
    }
    if(langData === undefined || Object.keys(langData).length === 0){
        return '';
    }
    var val = langData[key];
    if(val !== undefined && val !== ''){
        if(rpls !== undefined && Object.keys(rpls).length > 0){

            $.each(rpls, function(k, v){
                val = val.replace('{' + k + '}', v);
            });
        }
        return val;
    } else {
        return key;
    }
}
function initSelect2(){
    $('select.use-select2').each(function(){
        if ($(this).data('select2')) {
            $(this).select2('destroy');
        }
    });
    $('select.use-select2').each(function(){
        var $this = $(this);
        var tags = $(this).hasClass('tags');
        var text = $(this).data('noresults');
        var icon = $(this).hasClass('select-icon');
        var placeHolder = $(this).attr('placeholder');
        var selected = $(this).data('selected');
        if(selected !== undefined && selected !== ''){
            $('option', $(this)).filter(function(){
                return $(this).val() === selected;
            }).prop('selected', true);
        }
        if(text === undefined || text.trim() === ''){
            text = translate('No results found');
        }
        var options = {};
        options.language = {
            "noResults" : function () { return text; }
        }
        var dropdownParent = $(this).data('dropdown-parent');
        if(dropdownParent){
            dropdownParent: $(this).next(dropdownParent);
        }
        if(icon){
            function formatText (icon) {
                return $('<span><i class="' + $(icon.element).data('icon') + '"></i> ' + translate(icon.text) + '</span>');
            };
            options.templateSelection = formatText;
            options.templateResult = formatText;
        }
        if(tags){
            options.tags = true;
            options.selectOnClose = true;
        } 
        if(placeHolder !== undefined && placeHolder !== ''){
            options.placeholder = translate(placeHolder);
        }
        if($(this).hasClass('no-search')){
            options.minimumResultsForSearch = Infinity;
        }
        var refDataUrl = $(this).data('ref-data-url');
        if(refDataUrl !== undefined && refDataUrl !== ''){
            var selected = $(this).data('ref-selected');
            var key = $(this).data('ref-select2-key');
            var val = $(this).data('ref-select2-val');
            var ico = $(this).data('ref-select2-ico');
            var scope = $(this).data('ref-select2-scope');
            $.ajax({
                url: refDataUrl,
                type: 'GET',
                success: function(res) {
                    if(res[scope]){
                        const markup = `<option></option>${res[scope].map(item => `
                            <option data-icon="fi fi-${item[ico].toLowerCase()}" value="${item[val]}" ${item[val]===selected ? 'selected' : ''}>${item[key]}</option>
                        `).join('')}`;
                        $this.html(markup);
                    }
                    $this.select2(options);
                },
                error: function(jqXHR, textStatus, errorThrown) {}
            });
        } else {
            $(this).select2(options);
        }
    });
}
function slugify(str) {
  return String(str)
    .normalize('NFKD')// split accented characters into their base characters and diacritical marks
    .replace(/[đĐ]/g, 'd')
    .replace(/[\s\/\{\]\:\;\'\"\>\<\,\.\?\!\~\`\@\#\$\%\^\&\*\(\)\+\|\_]+/g, '-')
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+(.*)/g, '$1')
    .replace(/(.*)-+$/g, '$1'); // remove consecutive hyphens
}

function validate(input, event) {
    const validityState = input.validity;
    if(input.type === 'password'){
        if (validityState.valueMissing) {
            input.setCustomValidity("Vui lòng nhập mật khẩu!");
        } else if (validityState.tooShort || validityState.rangeUnderflow) {
            input.setCustomValidity("Mật khẩu phải có ít nhất 6 ký tự!");
        } else {
            input.setCustomValidity("");
        }
    } else if(input.type === 'email'){
        if (validityState.valueMissing) {
            input.setCustomValidity("Vui lòng nhập E-Mail!");
        } else if (validityState.typeMismatch) {
            input.setCustomValidity("E-Mail không hợp lệ!");
        } else {
            input.setCustomValidity("");
        }
    }
}

function fallbackCopyText(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
  } catch (err) {
  }

  document.body.removeChild(textArea);
}
function copyText(text) {
  if (!navigator.clipboard) {
    fallbackCopyText(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
  }, function(err) {
  });
}

function numberFormat(num, digits) {
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "K" },
        { value: 1e6, symbol: "M" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function(item) {
        return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

const ui = {
  confirm: async (title, message) => createConfirm(title, message),
  alert: (title, message) => createAlert(title, message),
  prompt: async (title, message) => createPrompt(title, message)
}
const createPrompt = (title, message) => {
  return new Promise((complete, failed)=>{
    if($('#notificationPrompt').length === 0){
        const markup = `<div class="modal" id="notificationPrompt" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content bg-white">
                        <div class="modal-header d-flex flex-column">
                            <h5 class="modal-title">Cấp quyền người dùng</h5>
                            <p class="text-danger m-0 d-none">Vui lòng nhập đầy đủ thông tin được yêu cầu</p>
                        </div>
                        <div class="modal-body">
                            <p class="note-notification">Modal body text goes here.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default">${translate('Cancel')}</button>
                            <button type="button" class="btn btn-primary">${translate('Submit')}</button>
                        </div>
                    </div>
                </div>
            </div>`;
        $('body').append(markup);
    }
    $('#notificationPrompt .modal-header h5').text(title);
    $('#notificationPrompt .modal-header p').addClass('d-none');
    $('#notificationPrompt .modal-body').html(message);
    $('#notificationPrompt .modal-footer button').off('click');
    $('#notificationPrompt .modal-footer button.btn-primary').on('click', ()=> { 
        $('#notificationPrompt .is-invalid').removeClass('is-invalid');
        $('#notificationPrompt .modal-header p').addClass('d-none');
        var data = {};
        $('#notificationPrompt input[type=checkbox]:checked').each(function(){
            var name = $(this).attr('name');
            if(data[name] === undefined){
                data[name] = [];
            }
            data[name].push($(this).val());
        });
        $('#notificationPrompt input[type=radio]:checked').each(function(){
            var name = $(this).attr('name');
            data[name] = $(this).val();
        });
        $('#notificationPrompt input[type=radio][required]').each(function(){
            var name = $(this).attr('name');
            if(data[name] === undefined){
                $(this).addClass('is-invalid');
            }
        });
        $('#notificationPrompt input[type=text], #notificationPrompt input[type=number]').each(function(){
            var name = $(this).attr('name');
            var val = $(this).val();
            if(val === ''){
                if($(this).attr('required')){
                    $(this).addClass('is-invalid');
                }
            } else {
                data[name] = val;
            }
        });
        if($('#notificationPrompt .is-invalid').length === 0){
            $('#notificationPrompt').modal('hide'); 
            complete(data); 
        } else {
            $('#notificationPrompt .modal-header p').removeClass('d-none');
        }
    });
    $('#notificationPrompt .modal-footer button.btn-default').on('click', ()=> { $('#notificationPrompt').modal('hide'); complete(false); });
    $('#notificationPrompt').modal({'backdrop': 'static', 'keyboard': false});
    if($('#notificationPrompt input, #notificationPrompt textarea').length > 0){
        $('#notificationPrompt input, #notificationPrompt textarea').first().focus();
    }
  });
}
const createConfirm = (title, message) => {
  return new Promise((complete, failed)=>{
    if($('#notificationConfirm').length === 0){
        const markup = `<div class="modal" id="notificationConfirm" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content bg-white">
                        <div class="modal-header">
                            <h5 class="modal-title">Modal title</h5>
                        </div>
                        <div class="modal-body">
                            <p class="note-notification">Modal body text goes here.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default">${translate('Cancel')}</button>
                            <button type="button" class="btn btn-primary px-4">${translate('OK')}</button>
                        </div>
                    </div>
                </div>
            </div>`;
        $('body').append(markup);
    }
    $('#notificationConfirm .modal-header h5').text(title);
    $('#notificationConfirm p.note-notification').html(message);
    $('#notificationConfirm .modal-footer button').off('click');
    $('#notificationConfirm .modal-footer button.btn-primary').on('click', ()=> { $('#notificationConfirm').modal('hide'); complete(true); });
    $('#notificationConfirm .modal-footer button.btn-default').on('click', ()=> { $('#notificationConfirm').modal('hide'); complete(false); });
    $('#notificationConfirm').modal({'backdrop': 'static', 'keyboard': false});
  });
}
const createAlert = (title, message) => {
    return new Promise((complete, failed)=>{
        if($('#notificationAlert').length === 0){
            const markup = `<div class="modal" id="notificationAlert" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content bg-white">
                        <div class="modal-header">
                            <h5 class="modal-title">Modal title</h5>
                        </div>
                        <div class="modal-body">
                            <p class="note-notification">Modal body text goes here.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary px-4">${translate('OK')}</button>
                        </div>
                    </div>
                </div>
            </div>`;
            $('body').append(markup);
            $('#notificationAlert .modal-footer button').on('click', ()=> { $('#notificationAlert').modal('hide');complete(true)});
        }
        $('#notificationAlert .modal-header h5').text(title);
        $('#notificationAlert p.note-notification').html(message);
        $('#notificationAlert').modal({'backdrop': 'static', 'keyboard': false});
    });
}

const addCommas = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const removeNonNumeric = (num) => num.toString().replace(/[^0-9]/g, "");
var spinner = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
String.prototype.fmTemp = function(params) {
    var matches = this.match(/\$\{[^\{\}]+\}/g);
    if(matches !== null){
        for (let i = 0; i < matches.length; i++) {
            var key = matches[i].replace(/[\$\{\}]+/g, '');
            if(params[key] === undefined){
                params[key] = '';
            }
        }
    }
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${this}\`;`)(...vals);
}
var Upload = function (data, url, progress_bar) {this.data = data, this.url = url,  this.progress_bar = progress_bar};
Upload.prototype.progressHandling = function (event) {
    var percent = 0;
    var position = event.loaded || event.position;
    var total = event.total;
    var progress_bar_id = this.progress_bar;
    if(typeof progress_bar_id === 'undefined' || progress_bar_id === ''){
        progress_bar_id = ".progress-bar";
    }
    if (event.lengthComputable) {
        percent = Math.ceil(position / total * 100);
    }
    $(progress_bar_id).css('width', percent + '%');
};
Upload.prototype.doUpload = function (cb, er) {
    var that = this;
    var formData = new FormData();
    $.each(this.data, function(k, val) {
        if(Array.isArray(val) || val instanceof FileList){
            $.each(val, function(idx, o){
                if(o instanceof File ){
                    formData.append(k, o, o.name);
                } else if(typeof o === 'object'){
                    formData.append(k, JSON.stringify(o));
                } else {
                    formData.append(k, o);
                }
            });
        } else {
            if(val instanceof File ){
                formData.append(k, val, val.name);
            } else if(typeof val === 'object'){
                formData.append(k, JSON.stringify(val));
            } else {
                formData.append(k, val);
            }
        }
    });
    var url = this.url;
    $.ajax({
        type: "POST",
        url: url,
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress', that.progressHandling.bind(that), false);
            }
            return myXhr;
        },
        success: function (res) {
            if(cb !== undefined && typeof cb === 'function'){
                cb(res);
            }
        },
        error: function (error) {
            if(er !== undefined && typeof er === 'function'){
                er(error);
            }
        },
        async: true,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        timeout: 1200000
    });
};
const sleep = async (milliseconds) => {
    await new Promise(resolve => {
        return setTimeout(resolve, milliseconds)
    });
};
function formatHtml(){
    $('[data-format]').each(function(){
        var format = $(this).data('format');
        var val = $(this).data('ref-value');
        switch(format){
            case 'time-ago': {
                if(!isNaN(val)){
                    $(this).text(moment(parseInt(val)).locale(_lang).fromNow());
                }
            }
            break;
            case 'date': {
                if(!isNaN(val)){
                    $(this).text(moment(parseInt(val)).locale(_lang).format('MMM d, YYYY'));
                }
            }
            break;
            case 'full-date': {
                if(!isNaN(val)){
                    var res = moment(parseInt(val)).locale(_lang).format('YYYY/MM/DD h:mma');
                    $(this).text(res);
                }
            }
            break;
            case 'chat-time':{
                if(!val){
                    $(this).text('');
                }
                if(!isNaN(val)){
                    var curr = moment().valueOf();
                    var diff = parseInt(val) - curr;
                    if(diff < 172800000){
                        $(this).text(moment(parseInt(val)).locale(_lang).fromNow());
                    } else {
                        $(this).text(moment(parseInt(val)).locale(_lang).format('MM/DD/YYYY h:mma'));
                    }
                    
                } else {
                    $(this).text('');
                }
            }
            break;
        }
    });
}
var webeditor = {
    genId: function(){
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    },
    killUnicode: function (str){
        if(str === undefined){
            return '';
        }
        str = str.normalize('NFD');
        str = str.replace(/[\u0300-\u036f]/g, '');
        str = str.replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D');
        return str;
    },
    timeAgo: function(time){
        if(!time){
            return '';
        }
        if(!isNaN(time)){
            return moment(parseInt(time)).fromNow();
        } else {
            return '';
        }
        
    },
    fullTime: function(time){
        if(!time){
            return '';
        }
        if(!isNaN(time)){
            return moment(parseInt(time)).format('MM/DD/YYYY h:mma');
        } else {
            return '';
        }
    },
    shortTime: function(time){
        if(!time){
            return '';
        }
        if(!isNaN(time)){
            return moment(parseInt(time)).format('MMM D, YYYY');
        } else {
            return '';
        }
    },
    chatTime: function(time){
        if(!time){
            return '';
        }
        if(!isNaN(time)){
            var curr = moment().valueOf();
            var diff = parseInt(time) - curr;
            if(diff < 172800000){
                return moment(parseInt(time)).fromNow();
            } else {
                return moment(parseInt(time)).format('MM/DD/YYYY h:mma');
            }
            
        } else {
            return '';
        }
    },
    signout: function(){
        localStorage.removeItem('logged_user');
        location.href = '/signout';
    },
    user: function(){
        var val = localStorage.getItem('logged_user');
        if(val){
            try{return JSON.parse(val);}catch (err) {}
        } else {
            return undefined;
        }
    },
    uInfo: function(){
        var val = localStorage.getItem('logged_user');
        var repl = localStorage.getItem('replacements');
        if(val){
            try{
                var obj = JSON.parse(val);
                var qrpl = repl ? JSON.parse(repl) : {};
                var data = {};
                data.FULLNAME = obj.fullname === undefined ? '' : obj.fullname;
                data.ADDRESS = obj.address === undefined ? '' : obj.address;
                data.PHONE = obj.phone === undefined ? '' : obj.phone;
                data.EMAIL = obj.email === undefined ? '' : obj.email;
                data.ID = obj.id === undefined ? '' : obj.id;
                return $.extend({}, data, qrpl);
            }catch (err) {}
        } else {
            return {};
        }
    },
    bytesToSize: function(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === undefined || bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
        return (Math.round(bytes / Math.pow(1000, i) *100) / 100) + ' ' + sizes[i];
    },
    copy: function(text){
        if (!navigator.clipboard) {
            var textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.opacity = "0";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {document.execCommand('copy');} catch (err) {}
            document.body.removeChild(textArea);
            return;
        }
        navigator.clipboard.writeText(text).then(function() {}, function(err) {});
    },
    isStrongPassword: function(data){
        //Có tối thiểu 8 ký tự
        //Có ít nhất một kí tự viết thường (a-z)
        //Có ít nhất một kí tự viết hoa (A-Z)
        //Có ít nhất một chữ số (0-9)
        //Có ít nhất một ký tự đặc biệt (!@#$%^&)
        const isStrongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/;
        return isStrongPassword.test(data);
    },
    isEmail: function(data){
        const isEmail = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
        return isEmail.test(data);
    },
    vnPhone: function(data){
        const isVNPhoneMobile = /^(0)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
        return isVNPhoneMobile.test(data);
    },
    alert: async (title, content) => {
        return new Promise((complete, failed)=>{
            $('#webeditor-alert-modal').modal('hide');
            $('#webeditor-alert-modal').remove();
            const markup = `<div id="webeditor-alert-modal" class="modal animated fade" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                        </div>
                        <div class="modal-body">
                            <p>${content}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary pl-4 pr-4" data-dismiss="modal">${translate('OK')}</button>
                        </div>
                    </div>
                </div>
            </div>`;
            $('body').append(markup);
            $('#webeditor-alert-modal button').off('click');
            $('#webeditor-alert-modal button').on('click', () => {
                complete(true);
            });
            $('#webeditor-alert-modal').modal({backdrop: 'static', keyboard: false});
        });
    },
    confirm: async (title, content) => {
        return new Promise((complete, failed)=>{
            $('#webeditor-confirm-modal').modal('hide');
            $('#webeditor-confirm-modal').remove();
            const markup = `<div id="webeditor-confirm-modal" class="modal animated fade" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                        </div>
                        <div class="modal-body">
                            <p>${content}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-cancel" data-dismiss="modal">${translate('Cancel')}</button>
                            <button type="button" class="btn btn-primary pl-4 pr-4" data-dismiss="modal">${translate('OK')}</button>
                        </div>
                    </div>
                </div>
            </div>`;
            $('body').append(markup);
            $('#webeditor-confirm-modal button').off('click');
            $('#webeditor-confirm-modal button.btn-primary').on('click', () => {
                complete(true);
            });
            $('#webeditor-confirm-modal button.btn-cancel').on('click', () => {
                complete(false);
            });
            $('#webeditor-confirm-modal').modal({backdrop: 'static', keyboard: false});
        });
    },
    prompt: async (title, html) => {
        return new Promise((complete, failed)=>{
            $('#webeditor-prompt-modal').modal('hide');
            $('#webeditor-prompt-modal').remove();
            const markup = `<div id="webeditor-prompt-modal" class="modal animated fade" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                        </div>
                        <div class="modal-body">
                            ${html}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-cancel" data-dismiss="modal">${translate('Cancel')}</button>
                            <button type="button" class="btn btn-primary pl-4 pr-4">${translate('OK')}</button>
                        </div>
                    </div>
                </div>
            </div>`;
            $('body').append(markup);
            $('#webeditor-prompt-modal button').off('click');
            $('#webeditor-prompt-modal button.btn-primary').on('click', () => {
                var data = {};
                var valid = true;
                $('#webeditor-prompt-modal input, #webeditor-prompt-modal select, #webeditor-prompt-modal textarea').each(function(){
                    var input = $(this);
                    var name = input.attr('name');
                    if(name === undefined || name === ''){
                        name = input.attr('id');
                    }
                    var val = input.val();
                    if(val === '' && input.attr('required')){
                        input.addClass('is-invalid');
                        valid = false;
                    }
                    if(name !== undefined && name.trim() !== ''){
                        var add = true;
                        if(input.attr('type') === 'checkbox' || input.attr('type') === 'radio'){
                            if(input.attr('type') === 'checkbox' && $('#webeditor-prompt-modal input[name=' + name + ']').length > 1){
                                 data[name] = [];
                            }
                            if(!input.is(':checked')){
                                add = false;
                            }
                        }
                        if(add){
                            if(data[name] === undefined){
                                data[name] = val;
                            } else {
                                data[name].push(val);
                            }
                        }
                    }
                });
                if(valid){
                    $('#webeditor-prompt-modal').modal('hide');
                    complete(data);
                }
            });
            $('#webeditor-prompt-modal button.btn-cancel').on('click', () => {
                complete(false);
            });
            $('#webeditor-prompt-modal').modal({backdrop: 'static', keyboard: false});
        });
    },
    setting: function(title, html, subtitle){
        $('#webeditor-setting-modal').modal('hide');
        $('#webeditor-setting-modal').remove();
        const markup = `<div id="webeditor-setting-modal" class="modal animated fade" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">
                            <h3 class="mb-0">${title}</h3>
                            <small class="form-text text-muted">${subtitle === undefined ? '': subtitle}</small>
                        </div>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${html}
                    </div>
                </div>
            </div>
        </div>`;
        $('body').append(markup);
        $('#webeditor-setting-modal').modal();
    },
    loadAssetsCount: 0,
    slugify: function(text){
        return text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, 'd')
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/-{2,}/g, '-')
            .replace(/^-+(.*)/g, '$1')
            .replace(/(.*)-+$/g, '$1');
    },
    camelize: function(str){
        if(str === undefined) return '';
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
            if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    },
    escapeMarkup: function (markup) {
        var replaceMap = {
            '\\': '&#92;',
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#39;',
            '/': '&#47;'
        };
        if (typeof markup !== 'string') {
            return markup;
        }

        return String(markup).replace(/[&<>"'\/\\]/g, function (match) {
            return replaceMap[match];
        });
    },
    renderPreview: async function(result){
        $('.preview-image').addClass('is-loading');
        if($('.preview-image span.spinner-border').length === 0){
            $('.preview-image').prepend(spinner);
        }
        if(result.images){
            await sleep(2000);
            $.each(result.images, function(i, img){
                let image = new Image();
                image.src = img.path;
                if(image.naturalWidth == 0 || image.readyState == 'uninitialized'){
                    setTimeout(function(){
                        const markup = `<div class="ui image" style="background-image:url(${image.src});"><div><img class="ui small image" src="${image.src}" data-ref-src="${image.src}"><button class="btn btn-danger btn-circle tiny-item" data-btn-action="delete-preview"><i class="fa fa-trash-alt"></i></button></div></div>`;
                        $('.preview-image').append(markup);
                        if($('.preview-image div.ui.image').length > 0 && $('.preview-image div.ui.image.active').length === 0){
                            $('.preview-image div.ui.image').first().addClass('active');
                        }
                        $('.preview-image').removeClass('is-loading');
                    }, 2000);
                } else {
                    const markup = `<div class="ui image" style="background-image:url(${image.src});"><div><img class="ui small image" src="${image.src}" data-ref-src="${image.src}"><button class="btn btn-danger btn-circle tiny-item" data-btn-action="delete-preview"><i class="fa fa-trash-alt"></i></button></div></div>`;
                    $('.preview-image').append(markup);
                    if($('.preview-image div.ui.image').length > 0 && $('.preview-image div.ui.image.active').length === 0){
                        $('.preview-image div.ui.image').first().addClass('active');
                    }
                    $('.preview-image').removeClass('is-loading');
                }
            })
        } else {
            $('.preview-image').removeClass('is-loading');
        }
    },
    loadAssets: function(result){
        webeditor.loadAssetsCount++;
        $('textarea[name=assets]').removeClass('is-invalid');
        $.ajax({
            url: '/medias/assets',
            type : 'GET',
            data : {name: result.key},
            success: function(res) {
                if(res.assets){
                    var data = {};
                    data.pages = res.assets.pages;
                    $('a.upload-preview').remove();
                    $('input[name=template]').removeClass('is-invalid');
                    $('textarea[name=assets]').val(JSON.stringify(data, null, 3)).data('errors', null);
                    if(res.assets.errors === undefined || res.assets.errors.length === 0){
                        const markup = `<a href="/preview/${result.key}/" target="_blank" class="btn btn-success upload-preview"><i class="far fa-eye"></i>Preview</a>`;
                        $('input[name=template]').after(markup);
                        $('input[name=template]').closest('.custom-file').addClass('has-preview')
                        $('input[name=template]').data('preview', '/preview/' + name + '/');
                    }
                    if(res.assets.errors){
                        const markup = `<ul class="list">${res.assets.errors.map(error => `<li>${error}</li>`).join('')}</ul>`;
                        $('.right-col .card-error').html(markup);
                        $('textarea[name=assets]').addClass('is-invalid');
                        $('textarea[name=assets]').data('errors', res.assets.errors);
                        $('input[name=template]').addClass('is-invalid');
                    }
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if(webeditor.loadAssetsCount < 5 && jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error.code === 404){
                    setTimeout(webeditor.loadAssets(result), 3000);
                }
            }
        });
    },
    avatar: function(result){
        if(result.avatar){
            let image = new Image();
            image.src = result.avatar;
            if(image.naturalWidth == 0 || image.readyState == 'uninitialized'){
                setTimeout(function(){
                    $('img.profile-user-img').attr('src', result.avatar.path);
                }, 2000);
            } else {
                $('img.profile-user-img').attr('src', result.avatar.path);
            }
        }
    },
    dfAvatar: function(avatar){
        if(avatar){
            return avatar;
        } else {
            return '/img/avatar-default.jpg';
        }
    },
    fullname: function(result){
        if(result.fullname){
            $('h3.profile-username').text(result.fullname);
        }
    },
    insertAtCursor: function(ele, val) {
        //IE support
        if (document.selection) {
            ele.focus();
            sel = document.selection.createRange();
            sel.text = myValue;
        }
        //MOZILLA and others
        else if (ele.selectionStart || ele.selectionStart == '0') {
            var startPos = ele.selectionStart;
            var endPos = ele.selectionEnd;
            ele.value = ele.value.substring(0, startPos)
                + val
                + ele.value.substring(endPos, ele.value.length);
        } else {
            ele.value += val;
        }
    },
    insertTextAtCursor: function(text){
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);
        range.deleteContents();
        range.collapse(false);
        let node = document.createTextNode(text);
        range.insertNode(node);

        if(text.length > 0){
            selection.modify("move", "right", "character");
        };
    },
}
$(document).ready(function(){
    $(document).on('keypress', '#webeditor-prompt-modal', function(e){
        var key=e.keyCode || e.which;
        if (key==13){
            $('button.btn-primary', $(this)).click();
        }
    });
    $('img').on("error", function() {
      $(this).attr('src', '/img/df-img.png');
    });
    formatHtml();
    setInterval(formatHtml, 5 * 60 * 1000);

    $(document).on('click', 'a.request-mail-permission', function(){
        $('#request-mail-permission-modal').modal('hide');
        $('#request-mail-permission-modal').remove();
        const markup = `<div id="request-mail-permission-modal" class="modal animated fade" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-body">
                        <div class="d-flex justify-content-center">
                            <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g fill="none" fill-rule="evenodd"><path d="M0 0h120v120H0z"></path><g transform="translate(6 6)"><circle stroke="#DFE5EB" stroke-width="2.623" cx="54" cy="54" r="52.689"></circle><image width="54" height="40" xlink:href="data:image/png;base64,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" transform="translate(27 34)"></image></g></g></svg>
                        </div>
                        <h3 class="text-center mb-4 mt-3">Set your sender address to Gmail</h3>
                        <p class="mb-4">Your Inbox emails are currently sent from an auto-generated email address, e.g., no-reply@smartpage.vn.</p>
                        <p class="mb-4">To send emails from your Gmail address, sign in to Google and allow Smartpage access.</p>
                        <p class="mb-4">Note: Personal emails sent to your Gmail won’t show in Smartpage Inbox.</p>
                        <div class="d-flex justify-content-center mb-4"><a href="javascript: void(0);" class="btn btn-primary br-circle" data-btn-action="request-gmail-permission">Continue</a></div> 
                    </div>
                    <div class="modal-footer d-inline-block text-muted small">Smartpage’s use of information received from Google APIs will adhere to <a target="_blank" href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" class="d-inline-block">Google API Services User Data Policy</a>, including the Limited Use requirements.</div>
                    </div>
            </div>
        </div>`;
        $('body').append(markup);
        $('#request-mail-permission-modal').modal();
        $('[data-toggle=popover]').popover('hide')
    });
    $(document).on('click', '[data-session-sign-out]', function(){
        var token = $(this).data('session-sign-out');
        if(token === ''){
            return false;
        }
        var $that = $(this);
        $.ajax({
            url: '/api/profile/signout',
            type: 'POST',
            data: {token: token},
            success: function(result) {
                var deviceCount = $('li', $that.closest('ul')).length;
                deviceCount--;
                $('span.session-num', $that.closest('.row')).text(deviceCount);
                $that.closest('li').remove();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                    toastr.error(jqXHR.responseJSON.error.message, title);
                }
            }
        });
    });
    $(document).on('click', '[data-closest-toggle]', function(){
        var target = $(this).data('closest-toggle');
        if(target === undefined || target === ''){
            return false;
        }
        var refToggle = $(this).data('toggle-class');
        if(refToggle !== undefined && refToggle !== ''){
            $(this).closest(target).toggleClass(refToggle);
        }

    });
    $(document).on('blur keyup', '[data-update-on-blur]', function(e){
        if((e.type === 'keyup' && e.key !== 'Enter') || $(this).data('is-updating') == true){
            return false;
        }
        var scope = $(this).data('update-on-blur');
        var name = $(this).attr('name');
        var orgVal = $(this).data('original-value');
        var val = $(this).val();
        var next = $(this).data('next');
        var title = $(this).data('error-title');
        var verified = $(this).data('has-verified');
        var $that = $(this);
        var validCheck = $(this).data('valid-check');
        var verifyBtn = $(this).data('verify-btn');
        var placeHolder = $(this).attr('placeholder');
        if(placeHolder === undefined || placeHolder === ''){
            placeHolder = webeditor.camelize(name);
        }
        if(title === undefined){
            title = '';
        }
        if(scope === undefined || scope.trim() === '' || name === undefined || name.trim() === '' || val === undefined || val.trim() === ''){
            return false;
        }
        var valid = true;
        if(validCheck !== undefined && validCheck !== ''){
             try {valid = window.webeditor[validCheck].call(null, val);} catch(err) {}
        }
        if(!valid){
            toastr.error('Please enter a valid ' + placeHolder, title);
            return false;
        }
        if(val !== orgVal){
            $(this).data('is-updating', true);
            if(verified){
                var mess = placeHolder + ' has been verified, once updated will have to verify again.';
                webeditor.confirm(title, mess).then(res => {
                    if(res){
                        $.ajax({
                            url: '/api/' + scope + '/' + name,
                            type: 'POST',
                            data: {val: val},
                            success: function(result) {
                                $that.data('original-value', val);
                                if(verified){
                                    $that.data('has-verified', false);
                                    if(verifyBtn !== undefined && verifyBtn !== ''){
                                        $that.next('.will-be-hide').html(verifyBtn);
                                    }
                                }
                                if(next !== undefined && next !== ''){
                                    try {window.webeditor[next].call(null, result);} catch(err) {}
                                }
                                $(this).data('is-updating', false);
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                $(this).val(orgVal);
                                if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                                    toastr.error(jqXHR.responseJSON.error.message, title);
                                }
                                $(this).data('is-updating', false);
                            }
                        });
                    } else {
                        $(this).val(orgVal);
                    }
                });
            } else {
                $.ajax({
                    url: '/api/' + scope + '/' + name,
                    type: 'POST',
                    data: {val: val},
                    success: function(result) {
                        $that.data('original-value', val);
                        if(next !== undefined && next !== ''){
                            try {window.webeditor[next].call(null, result);} catch(err) {}
                        }
                        $(this).data('is-updating', false);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        $(this).val(orgVal);
                        if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                            toastr.error(jqXHR.responseJSON.error.message, title);
                        }
                        $(this).data('is-updating', false);
                    }
                });
            }
        }
    });
    $(document).on('mouseenter', '[data-toggle=tooltip]', function(){
        if($(this).data('original-title') === undefined){
            $(this).tooltip('show');
        }
    });
    $(function(){
        $("[data-toggle=popover]").popover({html: true, content: function(){return $($(this).data('content-target')).html()}});
    });
    $(document).on('keyup', '.uppercase-first-char input,.uppercase-first-char textarea, input.uppercase-first-char, textarea.uppercase-first-char', function(){
        var val = $(this).val();
        if(val.length > 0){
            $(this).val(val.substr(0, 1).toUpperCase() + val.substr(1));
        }
    });
    $(document).on('keyup', '.navbar-search-block input[type=search]', function(e){
        var code = e.keyCode || e.which;
        if(code === 13){
            $('[data-widget=submit-search]').click();
        }
    });
    $('[data-mask]').each(function(){
        var inputformat = $(this).data('inputmask-inputformat');
        var val = $(this).val();
        if(!isNaN(val)){
            $(this).val(moment(parseInt(val)).format(inputformat.toUpperCase()));
        }
        if(inputformat !== undefined && inputformat !== ''){
            $(this).inputmask(inputformat, { 'placeholder': inputformat });
        }
    });
    $('[data-datetimepicker]').each(function(){
        var inputformat = $(this).data('time-format');
        if(inputformat !== undefined && inputformat !== ''){
            $(this).datetimepicker({ 'format': inputformat });
        }
    });
    
    initSelect2();
    $(document).on('change', 'input[type=file].custom-file-input', function(e){
        var name = $(this).attr('name');
        var limit = $(this).data('limit');
        var next = $(this).data('next');
        if(limit !== undefined && limit > 0){
            var counter = $($(this).data('counter')).length;
            if(counter + e.target.files.length > limit){
                toastr.error('You are only allowed to upload up to ' + limit + ' ' + name, 'File Upload');
                return false;
            }
        }
        if($(this).attr('update-filename') !== undefined && $(this).attr('update-filename') !== false){
            var filename = e.target.files[0].name;
            $(this).next('label.custom-file-label').text(filename);
        }
        var data = {};
        data[name] = e.target.files;
        var upload = new Upload(data, '/medias/upload/' + name, '.progress-bar-' + name);
        var $that = $(this);
        $(this).prop('disabled', true);
        $(this).after(spinner);
        $(this).closest('.custom-file').addClass('is-loading');
        upload.doUpload(function(result){
            $('span.spinner-border', $that.closest('.custom-file')).remove();
            $that.closest('.custom-file').removeClass('is-loading');
            $that.prop('disabled', false);
            if(next !== undefined && next !== ''){
                try {window.webeditor[next].call(null, result);} catch(err) {}
            }
        },function(jqXHR) {
            $('span.spinner-border', $that.closest('.custom-file')).remove();
            $that.closest('.custom-file').removeClass('is-loading');
            $that.prop('disabled', false);
            if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                toastr.error(jqXHR.responseJSON.error.message, 'File Upload');
            }
        });
        $(this).val('');
    });
    $(document).on('select2:select', '.form-control.gender', function(){
        var val = $(this).val();
        var $that = $(this);
        if(val === 'Custom'){
            $('select.custom-gender').removeClass('will-hide');
        } else {
            $('select.custom-gender').addClass('will-hide');
            $.ajax({
                url: '/api/profile/gender',
                type: 'POST',
                data: {val: val},
                success: function(result) {
                    $that.data('selected', val);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                        toastr.error(jqXHR.responseJSON.error.message, title);
                    }
                }
            });
        }
    });
    $(document).on('change', '.form-control.custom-gender', function(){
        var val = $(this).val();
        if(val === undefined || val.length === 0){
            return false;
        }
        var $that = $(this);
        $.ajax({
            url: '/api/profile/gender',
            type: 'POST',
            data: {val: val},
            success: function(result) {
                $that.data('selected', val);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                    toastr.error(jqXHR.responseJSON.error.message, title);
                }
            }
        });
    });
    $('select[data-selected]').each(function(){
        var val = $(this).data('selected');
        const $that = $(this);
        if(val !== undefined && val !== ''){
            const items = val.split(';');
            $.each(items, function(k,v){
                $('option[value="' + v + '"]', $that).prop('selected', true);
            });
        }
    });
    $(document).on('change', '[data-user-setting]', function(){
        var scope = $(this).data('user-setting');
        var name = $(this).attr('name');
        var checked = $(this).is(':checked');
        var title = $(this).data('error-title');
        $(this).prop('disabled', true);
        var $that = $(this);
        var data = {};
        data[name] = checked;
        $.ajax({
            url: '/api/settings/' + scope,
            type: 'POST',
            data: data,
            success: function(result) {
                $that.prop('disabled', false);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $that.prop('disabled', false);
                $that.prop('checked', !checked);
                if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                    toastr.error(jqXHR.responseJSON.error.message, title);
                }
            }
        });
    });
    $(document).on('click', '.preview-image div.ui.image', function(e){
        if($(e.target).closest('button').length === 0){
            $( '.preview-image div.ui.image.active').removeClass('active');
            $(this).addClass('active');
        }
    });
    
    $(document).on('click', '[data-btn-action]', function(){
        var action = $(this).data('btn-action');
        switch(action){
            case 'verify-phone-modal':{

            }
            break;
            case 'resend-activation-mail': {

            }
            break;
            case 'request-gmail-permission': {
                var win = window.open('https://accounts.google.com/o/oauth2/v2/auth?client_id=499677437541-rcu7m4v54e5pms06h7od20k47beeqps4.apps.googleusercontent.com&response_type=code&scope=https://www.googleapis.com/auth/gmail.send&redirect_uri=https://smartpage.vn/gg-oauth&access_type=offline&include_granted_scopes=true', 'Google OAuth', 'width=600,height=700');
                var timer = setInterval(function() {
                    if (win.closed) {
                        clearInterval(timer);
                    }
                }, 500);
            }
            break;
            case 'mail-setting-modal': {
                var setting = $(this).data('ref-setting');
                if(setting === undefined){
                    setting = {};
                }
                var markup = `<div class="card border-0 shadow-none mb-0">
                    <ul class="nav flex-column">
                        <li class="nav-item d-flex flex-row justify-content-between pb-3">
                            <div class="setting-info d-flex flex-column">
                                <h5 class="language">${translate('Special Offers')}</h5>
                                <span class="text-muted language" style="font-size: 0.9em;">${translate('Get updates on promotions, sales and discounts.')}</span>
                            </div>
                            <label class="switch">
                                  <input type="checkbox" class="form-control" data-user-setting="email" data-error-title="${translate('Update Email Preferences')}" name="offers" ${setting.offers ? 'checked':''}>
                                  <span class="slider round"></span>
                            </label>
                        </li>
                        <li class="nav-item d-flex flex-row justify-content-between pb-3 pt-3">
                            <div class="setting-info d-flex flex-column">
                                <h5 class="language">${translate('Contests and Events')}</h5>
                                <span class="text-muted language" style="font-size: 0.9em;">${translate('Find out when we’re having a contest or event near you.')}</span>
                            </div>
                            <label class="switch">
                                  <input type="checkbox" class="form-control" data-user-setting="email" data-error-title="${translate('Update Email Preferences')}" name="events" ${setting.events ? 'checked':''}>
                                  <span class="slider round"></span>
                            </label>
                        </li>
                        <li class="nav-item d-flex flex-row justify-content-between pb-3 pt-3">
                            <div class="setting-info d-flex flex-column">
                                <h5 class="language">${translate('New Features and Releases')}</h5>
                                <span class="text-muted language" style="font-size: 0.9em;">${translate('Be the first to know about the latest features and product releases, and give us your feedback.')}</span>
                            </div>
                            <label class="switch">
                                  <input type="checkbox" class="form-control" data-user-setting="email" data-error-title="${translate('Update Email Preferences')}" name="releases" ${setting.releases ? 'checked':''}>
                                  <span class="slider round"></span>
                            </label>
                        </li>
                        <li class="nav-item d-flex flex-row justify-content-between pt-3">
                            <div class="setting-info d-flex flex-column">
                                <h5 class="language">${translate('Tips and Inspiration')}</h5>
                                <span class="text-muted" style="font-size: 0.9em;">${translate('Discover how you can grow your site, online presence and business.')}</span>
                            </div>
                            <label class="switch">
                                  <input type="checkbox" class="form-control" data-user-setting="email" data-error-title="${translate('Update Email Preferences')}" name="tips" ${setting.tips ? 'checked':''}>
                                  <span class="slider round"></span>
                            </label>
                        </li>
                    </ul>
                    <span style="color: #7a92a5;font-size: 0.8em;margin-top:1rem;">${translate('*You’ll still receive important emails regarding your account like billing, security and support.')}</span>
                </div>`;
                webeditor.setting(translate('Email preferences'), markup, translate('Toggle on or off to choose which emails you receive.'));
            }
            break;
            case 'upload-template':{
                $(this).prop('disabled', true);
                $(this).prepend(spinner);
                var currSpinner = $('.spinner-border', $(this));
                $('.right-col .card-error').html('');
                $('.is-invalid').removeClass('is-invalid');
                var errors = [];
                var data = {};
                data.id = $('input[name=template-id]').val();
                data.title = $('input[name=title]').val().trim();
                if(data.title === ''){
                    errors.push(translate('Please enter Tempalte Name.'));
                    $('input[name=title]').addClass('is-invalid');
                } else if(data.title.length > 100){
                    errors.push(translate('Template Name is only allowed up to 100 characters.'));
                    $('input[name=title]').addClass('is-invalid');
                } else if(/\p{Emoji}/u.test(data.title)){
                    errors.push(translate('Template Name is not allowed to use emoji.'));
                    $('input[name=title]').addClass('is-invalid');
                }
                data.desc = $('textarea[name=description]').val().trim();
                if(data.desc === ''){
                    errors.push(translate('Please enter Description.'));
                    $('textarea[name=description]').addClass('is-invalid');
                } else if(data.desc.length > 2000){
                    errors.push(translate('Description is only allowed up to 2000 characters.'));
                    $('textarea[name=description]').addClass('is-invalid');
                }
                data.goodfor = $('select[name=goodfor]').val();
                if(data.goodfor === undefined || data.goodfor.length === 0){
                    errors.push(translate('Please enter Good For.'));
                    $('select[name=goodfor]').addClass('is-invalid');
                }
                data.tags = $('select[name=tags]').val();
                if(data.tags === undefined || data.tags.length === 0){
                    errors.push(translate('Please enter Tags.'));
                    $('select[name=tags]').addClass('is-invalid');
                }
                data.previews = [];
                $('.preview-image img').each(function(){
                    data.previews.push($(this).data('ref-src'));
                });
                if(data.previews.length === 0){
                    errors.push(translate('Please upload Preview Images.'));
                    $('input[name=images]').addClass('is-invalid');
                }
                if($('.preview-image div.ui.image.active').length > 0){
                    data.thumb = $('.preview-image div.ui.image.active img').first().data('ref-src');
                }
                if((data.thumb === undefined || data.thumb === '') && data.previews.length > 0){
                    data.thumb = data.previews[0];
                }
                data.template = $('input[name=template]').data('filename');
                if(data.template === null || data.template === undefined || data.template.length === 0){
                    errors.push(translate('Please upload Template File.'));
                    $('input[name=template]').addClass('is-invalid');
                }
                data.previewUrl = $('input[name=template]').data('preview');
                data.assets = $('textarea[name=assets]').val().trim();
                if(data.template && data.template.lenth > 0 && data.assets === ''){
                    errors.push(translate('Can not load Template Assets. Please check your Template File.'));
                    $('textarea[name=assets]').addClass('is-invalid');
                }
                var assetsError = $('textarea[name=assets]').data('errors');
                if(assetsError !== null && assetsError !== undefined){
                    $('textarea[name=assets]').addClass('is-invalid');
                    $('input[name=template]').addClass('is-invalid');
                    errors = errors.concat(assetsError);
                }
                data.categories = $('select[name=categories]').val();
                if(data.categories === undefined || data.categories.length === 0){
                    errors.push(translate('Please select Categories.'));
                    $('select[name=categories]').addClass('is-invalid');
                }
                data.resolutions = [];
                $('input[name=resolution]:checked').each(function(k, v){
                    data.resolutions.push(v.value);
                });
                if(data.resolutions.length === 0){
                    errors.push(translate('Please select Resolution.'));
                    $('input[name=resolution]').addClass('is-invalid');
                }
                
                if(errors.length > 0){
                    const markup = `<ul class="list">${errors.map(error => `<li>${error}</li>`).join('')}</ul>`;
                    $('.right-col .card-error').html(markup);
                    $(this).prop('disabled', false);
                    currSpinner.remove();
                } else {
                    $.ajax({
                        url: '/manage/template',
                        type: 'POST',
                        data: data,
                        success: function(result) {
                            if(result.redirect){
                                window.location.href = result.redirect;
                            } else {
                                window.location.href = '/dashboard.html';
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            $(this).prop('disabled', false);
                            currSpinner.remove();
                            if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
                                toastr.error(translate(jqXHR.responseJSON.error.message));
                            }
                        }
                    });
                }
            }
            break;
            case 'delete-preview': {
                $(this).closest('div.ui.image').remove();
                if($('.preview-image div.ui.image.active').length === 0 && $('.preview-image div.ui.image').length > 0){
                    $('.preview-image div.ui.image').addClass('active');
                }
            }
            break;
        }
    });
});