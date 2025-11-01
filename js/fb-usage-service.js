import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
$(document).ready(function(){
	$(document).on('click', '[data-btn-action=verify-phone-modal]', function(){
		if($(this).is(':disabled')){
			return false;
		}
		var code = $('select[data-ref-select2-scope=countries]').val();
		var phone = $('input[name=phone]').val().replace(/[\s\.]+/g, '');
		if(code === '' || phone === '' || !webeditor.vnPhone(phone)){
			return false;
		}
        const phoneNumber = code + phone.replace(/0+(\d+)/g, '$1');
        var formData = {};
        formData.code = code;
        formData.phone = phone;
        formData.phoneNumber = phoneNumber;
        const auth = getAuth();
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
		  'size': 'invisible'
		}, auth);

        const appVerifier = window.recaptchaVerifier;
        signInWithPhoneNumber(auth, phoneNumber, appVerifier).then((confirmationResult) => {
			window.confirmationResult = confirmationResult;
			webeditor.prompt('Verify Your Phone Number', `<div class="form-group">
			    <label for="code">Enter the 6-digit code we sent to <span class="text-primary">${phoneNumber}</span></label>
			    <input type="text" class="form-control" id="code" placeholder="6-digit code" required>
			</div>`).then(data=>{
              	if(data){
              		confirmationResult.confirm(data.code).then((result)=>{
              			formData.idToken = result.user.accessToken;
              			formData.localId = result.user.uid;
					    console.log(result);
					    $.ajax({
			                url: '/api/profile/verify-phone',
			                type: 'POST',
			                data: formData,
			                success: function(res) {
			                    if(res.user && res.user.isPhoneVerified){
			                    	$('[data-btn-action=verify-phone-modal]').removeClass('text-danger').addClass('text-success').prop('disabled', true);
			                    	$('[data-btn-action=verify-phone-modal] i').removeClass('fa-times-hexagon').addClass('fa-shield-check');
			                    	$('[name=phone][data-has-verified]').data('has-verified', true).prop('disabled', true);
			                    }
			                },
			                error: function(jqXHR, textStatus, errorThrown) {
			                    if(jqXHR.responseJSON !== undefined && jqXHR.responseJSON.error !== undefined){
			                        toastr.error(jqXHR.responseJSON.error.message, 'Verify Phone Number');
			                    }
			                }
			            });
					}).catch((error) => {
					  	console.log(error);
					  	recaptchaVerifier.clear();
              			$(recaptchaVerifier.container).html('')
					});
              	} else {
              		recaptchaVerifier.clear();
              		$(recaptchaVerifier.container).html('');
              	}
            });
        }).catch((error) => {
          	console.log(error);
        });
    });
});