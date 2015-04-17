/**
 * Subbscribe.js (http://www.subbscribe.com)
 * Copyright (c) 2014 (v2.0) Shlomi Nissan, 1ByteBeta (http://www.1bytebeta.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 */

(function($) {

    $.fn.subbscribe = function( options ) {

        var obj = this;

        // Default settings
        var settings = $.extend({
            list	 : 'MailChimp',
            url          : '//1bytebeta.us9.list-manage.com/subscribe/post?u=1c261e60d8259c0c636801494&amp;id=7fa99bf359',
            title        : 'Never miss a post!',
            text         : 'Get our latest posts and announcements in your inbox. You won\'t regret it!',
            name         : 'Subbscribe',
            color        : '#ee6262',
            thumbnail    : 'https://s3-ap-southeast-2.amazonaws.com/subbscribe/img/avatar.png',
            placeholder_name: 'Name',
            placeholder_email: 'Email Address',
            footer		 : 'Powered by <a href="http://www.subbscribe.com" target="_blank">Subbscribe.com</a>',
            subscribe_button1: 'Subscribe',
            subscribe_button2: 'Subscribe',
            error_text: 'Oops! Check your details and try again.',
            success_text: 'Thanks! Check your email for confirmation.',
            close_hide_days: 1,
            onDisplay: false,
            onSubbscribe: false,
            onSubbscribeBot: false,
            onSubbscribeError: false,
            onClose: false,
            error_title: 'Oops!',
            emailonly	 : false
        }, options);

        // Make sure a URL has been passed through
        if ( settings.url == '' ) {

            console.log('Subbscribe Error: You must provide a valid MailChimp form URL.');
            return;

        };

        var _name 	= '';
        var _email 	= '';
        var _url 	= '';

        // Make sure list is either set to MailChimp or CampaignMonitor
        // Change field names if yours don’t match

        if( settings.list == 'MailChimp' ) {

            _name 	= 'NAME';
            _email 	= 'EMAIL';
            _action	= settings.url.replace('/post?', '/post-json?').concat('&c=?');

        }
        else if ( settings.list == 'CampaignMonitor' ) {

            _name 	= 'cm-name';
            _email 	= 'cm-jydlht-jydlht';
            _action	= settings.url  + "?callback=?";

        }
        else {

            console.log('Subbscribe Error: list value must be set to MailChimp or CampaignMonitor');
            return;

        }

        // Separate the input fields from the HTML
        // if emailonly is set, nameInput should be blank

        var nameInput 	= '';
        var emailInput 	= '<input type="email" name="' + _email + '" id="subb-EMAIL" placeholder="' + settings.placeholder_email + '" />';

        if( !settings.emailonly ) {

            nameInput = ' <input type="text" name="' + _name + '" id="subb-NAME" placeholder="' + settings.placeholder_name + '" />';

        }


        // HTML
        var html = '<div id="subbscribe"> <div class="subb-title">' + settings.title + ' <img class="close-x" src="https://s3-ap-southeast-2.amazonaws.com/subbscribe/img/close.svg" />  </div> <div class="subb-body"> <div class="subb-hidden"> <div class="subb-thumbnail"> <img style="width: 40px; height: 40px;" src="' + settings.thumbnail + '" /> </div> <div class="subb-hidden"> <div class="subb-site"> &nbsp;' + settings.name + ' </div> <button class="subb-button show-form">' + settings.subscribe_button1 + '</button> </div> </div> <div class="subb-form" style="display: none"> <p>' + settings.text + '</p> <form id="mc-embedded-subbscribe-form" method="post" action="' + settings.url + '"> <div class="subbscribe-alert subbscribe-error" style="display: none">' + settings.error_text + '</div> <div class="subbscribe-alert subbscribe-success" style="display: none">' + settings.success_text + '</div> <div class="text-input"> ' + nameInput + ' </div> <div class="text-input"> ' + emailInput + ' </div> <div style="position: absolute; left: -5000px;"><input type="text" name="my_two_cents" id="my_two_cents" tabindex="-1" value=""></div> <button class="subb-button submit-form" type="submit" style="width: 100%; margin-bottom: 10px;">' + settings.subscribe_button2 + '</button></form> <div class="footer">' + settings.footer + '</div> </div> </div> </div>';

        if(getCookie('subbscribe-hidden') != 1) {

            this.append(html);
            $('#subbscribe').css('width', $('.subb-site').width() + 200);
            $('#subbscribe').addClass('animated slideInRight');
            settings.onDisplay.call();
        }

        // Update CSS classes
        $('#subbscribe .subb-button').css('background-color', settings.color);

        /*
         ===============================================================================
         Events
         ===============================================================================
         */

        $('#subbscribe .close-x').click(function(){

            $('#subbscribe').toggleClass('slideInRight fadeOut');
            $('#subbscribe').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){

                $('#subbscribe').remove();
                setCookie('subbscribe-hidden', 1, settings.close_hide_days); // Hide for a day

            });

            settings.onClose.call();

        });

        $('#subbscribe .show-form').click(function(){

            $('#subbscribe .subb-hidden').hide();
            $('#subbscribe .subb-form').show();

        });

        $('#mc-embedded-subbscribe-form').submit(function(e){

            e.preventDefault();

            if (youFellForIt()){
                // KTHNXBYE
                resetFormFields();
                $('.subbscribe-success').slideDown();

                setTimeout(function () {
                    $('#subbscribe').addClass('animated fadeOut');
                }, 2000);
                $('#subbscribe').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {

                    $('#subbscribe').remove();
                    setCookie('subbscribe-hidden', 1, 1825); // Hide for 5 years
                    settings.onSubbscribeBot.call();
                });
            }
            else {
                if (formValidation()) {
                    // perhaps some google analytics here?
                    $('#subbscribe .subbscribe-error').slideUp();
                    $('#subbscribe .submit-form').attr('disabled', 'disabled');

                    $.ajax({

                        url: _action,
                        type: 'post',
                        data: $(this).serialize(),
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",

                        success: function (data) {

                            if (isError(data)) {
                                var err_html = '<div class="subb-title">' + settings.error_title + ' <img class="close-x" src="https://s3-ap-southeast-2.amazonaws.com/subbscribe/img/close.svg" />  </div> <div class="subb-body"> <p>' + data.msg + ' </p> </div>';
                                $('#subbscribe').html(err_html);
                                console.log('Subbscribe Error: submission failed.');
                                settings.onSubbscribeError.call();

                            }
                            else {

                                //SUCCESS
                                resetFormFields()
                                $('.subbscribe-success').slideDown();

                                setTimeout(function () {
                                    $('#subbscribe').addClass('animated fadeOut');
                                }, 2000);
                                $('#subbscribe').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {

                                    $('#subbscribe').remove();
                                    setCookie('subbscribe-hidden', 1, 365); // Hide for a year
                                    settings.onSubbscribe.call();

                                });

                            }
                        }

                    });

                } else {

                    $('#subbscribe .subbscribe-error').slideDown();

                }
            }

        });

        /*
         ===============================================================================
         Helpers
         ===============================================================================
         */

        function isError(data) {

            if ( settings.list == 'MailChimp' ) {

                if( data['result'] != "success" ) {

                    return true;

                }

                return false;

            }
            else if ( settings.list == 'CampaignMonitor' ) {

                if( data.Status === 400 ) {

                    return true;

                }

                return false;

            }

            return true;

        }

        function resetFormFields() {

            $('#subbscribe input').each(function(){
                $(this).val('');
            });

        }

        function validateEmail(email) {

            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);

        }

        function formValidation() {

            var valid   = true;
            var name    = $('#subb-NAME');
            var email   = $('#subb-EMAIL');

            if( !settings.emailonly ) {

                if( name.val().length < 2 ) {

                    valid = false;
                    name.addClass('error');

                } else {

                    name.removeClass('error');

                }

            }

            if ( !validateEmail( email.val() ) ) {

                valid = false;
                email.addClass('error');

            } else {

                email.removeClass('error');

            }

            return valid;

        }

        function youFellForIt() {
            var twoCents = $('#my_two_cents');

            return twoCents.val().length > 0;
        }

        function setCookie(cname, cvalue, exdays) {

            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";

        }

        function getCookie(cname) {

            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
            }

            return "";

        }

    }

}(jQuery));