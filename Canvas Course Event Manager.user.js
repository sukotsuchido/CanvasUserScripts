// ==UserScript==
// @name         Canvas Course Event Manager
// @namespace    https://github.com/sukotsuchido/CanvasUserScripts
// @version      0.5
// @description  A Canvas UserScript to manage course events
// @author       Chad Scott (ChadScott@katyisd.org)
// @include     https://*.instructure.com/calendar* //change this to the address of your instance of Canvas.
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    var assocRegex3 = new RegExp('^/calendar');
    var errors = [];
    var courseId = '';
    var termId = '';
    var courses = [];
    var allCourses = [];
    var wholeName = '';
    var array =[];
    var user = '';
    /* role setup */
    var roles = ENV.current_user_roles;
    var buttonRoles = ["admin", "teacher", "root_admin"];
    var test1 = buttonRoles.some(el => roles.includes(el));
    if( (test1 === true) && (assocRegex3.test(window.location.pathname))){
        add_button();
    }
    function add_button() {
        var parent = document.querySelector('div.header-table-right');
        if (parent) {
            var el = parent.querySelector('#manage_events');
            if (!el) {
                el = document.createElement('button');
                el.classList.add('Button','element_toggler');
                el.type = 'button';
                el.id = 'manage_events';
                var icon = document.createElement('i');
                icon.classList.add('icon-edit');
                el.appendChild(icon);
                var txt = document.createTextNode(' Manage Course Events');
                el.appendChild(txt);
                el.addEventListener('click', openDialog);
                parent.appendChild(el);
            }
        }
    }
    function getCourses(){
        // Reset global variable errors
        errors= [];
        var url = "/api/v1/users/self/courses?include[]=term&per_page=75"; // change self to specific user number for testing
        $.ajax({
            'async': true,
            'type': "GET",
            'global': true,
            'dataType': 'JSON',
            'data': JSON.stringify(courses),
            'contentType': "application/json",
            'url': url,
            'success': function(courses){
                allCourses = Array.from(courses.reduce((m, t) => m.set(t.id, t), new Map()).values());
                var toAppend = '';
                var select = document.getElementById('event_course');
                select.options.length = 0; // clear out existing items
                $.each(allCourses, function(i, o){
                    if(o.name !== undefined){
                        toAppend += '<option value="'+o.id+'">'+o.name+'</option>';
                    }
                });
                var blank ='';
                blank += '<option value="">Please select</option>';
                $('#event_course').append(blank);
                $('#event_course').append(toAppend);
            }
        });
    }
    function getEvents(){
        // Reset global variable errors
        errors= [];
        courseId = document.getElementById('event_course').value;
        var url = "/api/v1/users/self/calendar_events?per_page=150&all_events=true&context_codes[]=course_"+courseId;
        $.ajax({
            'async': true,
            'type': "GET",
            'global': true,
            'dataType': 'JSON',
            'data': JSON.stringify(courses),
            'contentType': "application/json",
            'url': url,
            'success': function (data, textStatus, request) {
                var toAppend;
                var clear = document.getElementById('inner_table');
                if (clear.innerHTML !== null){
                    clear.innerHTML = "";
                }
                $.each(data,function(i,o){
                    //start date
                    var date = new Date(o.start_at);
                    var day = date.getDate();
                    var year = date.getFullYear();
                    var month = date.getMonth()+1;
                    var dateStr = month+"/"+day+"/"+year;
                    //end date
                    var date2 = new Date(o.end_at);
                    var day2 = date2.getDate();
                    var year2 = date2.getFullYear();
                    var month2 = date2.getMonth()+1;
                    var dateStr2 = month2+"/"+day2+"/"+year2;
                    toAppend += '<tr><td><input type="checkbox" id="'+o.id+'" name="events" value="'+o.id+'"></td><td>'+o.title+'</td><td>'+dateStr+'</td><td>'+dateStr2+'</td></tr>';
                });
                $('#table_header').append(toAppend);
            }
        });
    }
    function deleteEvents(){
        $.each(array, function(index,item){
            var eventId = item;
            var url = "/api/v1/calendar_events/"+eventId;
            $.ajax({
                'async': true,
                'type': "DELETE",
                'global': true,
                'dataType': 'JSON',
                'data': JSON.stringify(),
                'contentType': "application/json",
                'url': url,
                'success': open_success_dialog
            });
        });
        window.location.reload(true);
    }
    function removeDates(){
        $.each(array, function(index,item){
            var eventId = item;
            var url = "/api/v1/calendar_events/"+eventId+"?calendar_event[start_at]=null&calendar_event[end_at]=null";
            $.ajax({
                'async': true,
                'type': "PUT",
                'global': true,
                'dataType': 'JSON',
                'data': JSON.stringify(),
                'contentType': "application/json",
                'url': url,
                'success': open_success_dialog
            });
        });
        window.location.reload(true);
    }
    function createDialog() {
        var el = document.querySelector('#events_dialog');
        if (!el) {
            el = document.createElement('div');
            el.id = 'events_dialog';
            //Parent Course selection
            var el2 = document.createElement('div');
            el2.classList.add('ic-Form-control');
            el.appendChild(el2);
            var label = document.createElement('label');
            label.htmlFor = 'event_course';
            label.textContent = 'Step 1: Select Course:';
            label.classList.add('ic-Label');
            el2.appendChild(label);
            var select = document.createElement('select');
            select.id = 'event_course';
            select.classList.add('ic-Input');
            select.onchange = getEvents;
            el2.appendChild(select);
            //Events Table
            var table = document.createElement('TABLE');
            table.id = 'table_header';
            table.style.width = '100%';
            table.classList.add("ic-Table", "ic-Table--hover-row", "ic-Table--striped");
            el.appendChild(table);
            var tr = document.createElement('TR');
            table.appendChild(tr);
            var th = document.createElement('TH');
            var input = document.createElement('input');
            input.type = 'checkbox';
            input.name = 'select-all';
            input.id = 'select-all';
            input.onchange = setEvents;
            th.appendChild(input);
            th.classList.add('ic-Checkbox-group');
            tr.appendChild(th);
            th = document.createElement('TH');
            th.textContent = 'Event Title';
            tr.appendChild(th);
            th = document.createElement('TH');
            th.textContent = 'Start Date';
            tr.appendChild(th);
            th = document.createElement('TH');
            th.textContent = 'End Date';
            tr.appendChild(th);
            var tbody = document.createElement('tbody');
            tbody.id = 'inner_table';
            tbody.onchange= setEvents;
            table.appendChild(tbody);
            var notice = document.createElement('div');
            notice.id = 'app';
            /*notice.id = 'notice';
            notice.style = 'text-align: right';
            notice.style.padding = '5px';
            notice.style.font ='bold 14px arial,serif';
            notice.textContent ='First 100 Events Only';
            */
            el.appendChild(notice);
            //HR
            var hr = document.createElement('HR');
            el.appendChild(hr);
            //selected action list
            var el3 = document.createElement('div');
            el3.innerHTML ='<fieldset class="ic-Fieldset ic-Fieldset--radio-checkbox"><legend class="ic-Legend">For Selected Events:</legend><div class="ic-Form-control ic-Form-control--radio ic-Form-control--radio-inline"><div class="ic-Radio"><input id="remove_dates" type="radio" value="remove_dates" name="action" checked><label for="remove_dates" class="ic-Label">Remove Dates</label></div><div class="ic-Radio"><input id="delete_events" type="radio" value="delete_events" name="action"><label for="delete_events" class="ic-Label">Delete Events</label></div></div></fieldset>';
            el.append(el3);
            //message flash
            var msg = document.createElement('div');
            msg.id = 'events_msg';
            //msg.classList.add('ic-flash-warning');
            msg.style.display = 'none';
            el.appendChild(msg);
            var parent = document.querySelector('body');
            parent.appendChild(el);
        }
        $('#select-all').click(function(event) { 
            var state = this.checked; $(':checkbox').each(function() { this.checked = state; });
        });
    }
    function setEvents() {
        array = $.map($('input[name="events"]:checked'), function(c){return c.value; });
    }
    function openDialog() {
        try {
            createDialog();
            $('#events_dialog').dialog({
                'title' : 'Manage Course Events',
                'autoOpen' : false,
                'closeOnEscape': false,
                'open': getCourses(), function () { $(".ui-dialog-titlebar-close").hide(); $(".ui-dialog").css("top", "10px");},
                'buttons' : [  {
                    'text' : 'Cancel',
                    'click' : function() {
                        $(this).dialog('destroy').remove();
                        errors = [];
                        updateMsgs();
                    }
                },{
                    'text' : 'Submit',
                    'class': 'Button Button--primary',
                    'click' : submitButton

                } ],
                'modal' : true,
                'resizable' : false,
                'height' : '600',
                'width' : '40%',
                'scrollable' : true
            });
            if (!$('#events_dialog').dialog('isOpen')) {
                $('#events_dialog').dialog('open');
            }
        } catch (e) {
            console.log(e);
        }
    }
    function submitButton(){
        var action = document.querySelector('input[name="action"]:checked').value;
        if(action == "delete_events"){
            deleteEvents();
        }else{
            removeDates();
        }
    }
    function successDialog(){
        var el = document.querySelector('#success_dialog');
        if (!el) {
            el = document.createElement('div');
            el.id = 'success_dialog';
            var div1 = document.createElement('div');
            div1.classList.add('ic-flash-success');
            el.appendChild(div1);
            var div2 = document.createElement('div');
            div2.classList.add('ic-flash__icon');
            div2.classList.add('aria-hidden="true"');
            div1.appendChild(div2);
            var icon = document.createElement('i');
            icon.classList.add('icon-check');
            div2.appendChild(icon);
            var msg = document.createTextNode("The action completed successfully!");
            div1.appendChild(msg);
            var button = document.createElement('button');
            button.type = 'button';
            button.classList.add("Button", "Button--icon-action", "close_link");
            el.appendChild(button);
            icon = document.createElement('i');
            icon.classList.add('ic-icon-x');
            icon.classList.add('aria-hidden="true"');
            button.appendChild(icon);
            var parent = document.querySelector('body');
            parent.appendChild(el);
        }
    }
    function open_success_dialog(){
        try {
            successDialog();
            $('#success_dialog').dialog({
                'autoOpen' : false,
                'closeOnEscape': false,
                'open': function () { $(".ui-dialog-titlebar").hide(); $(".ui-widget-content").css("background", "rgba(255, 255, 255, 0)"); $(".ui-dialog.ui-widget-content").css("box-shadow", "none");},
                'modal' : true,
                'resizable' : false,
                'height' : 'auto',
                'width' : '40%',
            });
            if (!$('#success_dialog').dialog('isOpen')) {
                $('#success_dialog').dialog('open');
            }
        } catch (e) {
            console.log(e);
        }
    }
    function updateMsgs() {
        var msg = document.getElementById('events_msg');
        if (!msg) {
            return;
        }
        if (msg.hasChildNodes()) {
            msg.removeChild(msg.childNodes[0]);
        }
        if (typeof errors === 'undefined' || errors.length === 0) {
            msg.style.display = 'none';
        } else {
            var div1 = document.createElement('div');
            div1.classList.add('ic-flash-error');
            var div2;
            div2 = document.createElement('div');
            div2.classList.add('ic-flash__icon');
            div2.classList.add('aria-hidden="true"');
            div1.appendChild(div2);
            var icon;
            icon = document.createElement('i');
            icon.classList.add('icon-warning');
            div2.appendChild(icon);
            var ul = document.createElement('ul');
            for (var i = 0; i < errors.length; i++) {
                var li;
                li = document.createElement('li');
                li.textContent = errors[i];
                ul.appendChild(li);
            }
            div1.appendChild(ul);
            var button;
            button = document.createElement('button');
            button.type = 'button';
            button.classList.add("Button", "Button--icon-action", "close_link");
            div1.appendChild(button);
            icon = document.createElement('i');
            icon.classList.add('ic-icon-x');
            icon.classList.add('aria-hidden="true"');
            button.appendChild(icon);
            msg.appendChild(div1);
            msg.style.display = 'inline-block';
        }
    }
})();
