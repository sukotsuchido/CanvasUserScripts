// ==UserScript==
// @name         Canvas Student Course Enrollment Manager
// @namespace    https://github.com/sukotsuchido/CanvasUserScripts
// @version      1.6
// @description  A Canvas UserScript to manage course enrollments
// @author       Chad Scott (ChadScott@katyisd.org)
// @include     https://*.instructure.com/courses/*/users
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    var assocRegex3 = new RegExp('^/courses/([0-9]+)/users');
    var errors = [];
    var courses = [];
    var sections = [];
    var array =[];
    var courseID = $(location).attr('pathname');
    courseID.indexOf(1);
    courseID = courseID.split("/")[2];
    var pageNum = 0;
    /* role setup */
    var roles = ENV.current_user_roles;
    var buttonRoles = ["admin", "root_admin"];
    var test1 = buttonRoles.some(el => roles.includes(el));
    if( (test1 === true) && (assocRegex3.test(window.location.pathname))){
        add_button();
    }

    function add_button() {
        var parent = document.querySelector('div.ic-Action-header__Secondary');
        if (parent) {
            var el = parent.querySelector('#manage_enrollments');
            if (!el) {
                el = document.createElement('button');
                el.classList.add('Button','button-primary','element_toggler');
                el.type = 'button';
                el.id = 'manage_enrollments';
                var icon = document.createElement('i');
                icon.classList.add('icon-user');
                el.appendChild(icon);
                var txt = document.createTextNode(' Manage Course Enrollments');
                el.appendChild(txt);
                el.addEventListener('click', openDialog);
                parent.prepend(el);
            }
        }
    }

    function getSections(){
        var url = "/api/v1/courses/"+courseID+"/sections?&per_page=100";
        $.ajax({
            'async': true,
            'type': "GET",
            'global': true,
            'dataType': 'JSON',
            'data': JSON.stringify(sections),
            'contentType': "application/json",
            'url': url,
            'success': function (data, textStatus, response) {

                $.each(data,function(i,o){
                    var sectionID = o.id;
                    var sectionName = o.name;

                    sections.push({
    key:   sectionID,
    value: sectionName
});

                });

            }
    });
    }

    function getStudents(){
        // Reset global variable errors
        errors= [];
        document.getElementById('moreStu').value = ++pageNum;
        var url = "/api/v1/courses/"+courseID+"/enrollments?type[]=StudentEnrollment&per_page=100&page="+pageNum;
        $.ajax({
            'async': true,
            'type': "GET",
            'global': true,
            'dataType': 'JSON',
            'data': JSON.stringify(courses),
            'contentType': "application/json",
            'url': url,
            'success': function (data, textStatus, response) {
                var toAppend;
                $.each(data,function(i,o){
                    var dateStr;
                    var dateEnrStr;

                    var stuSectionID;
                    var stuSectionName;
                    stuSectionID = o.course_section_id;

                    stuSectionName = sections.find(item => item.key === stuSectionID).value;



                    var date2 = new Date(o.created_at);
                        var day2 = date2.getDate();
                        var year2 = date2.getFullYear();
                        var month2 = date2.getMonth()+1;
                        if(day2<10){
                            day2='0'+day2;
                        }
                        if(month2<10){
                            month2='0'+month2;
                        }
                        dateEnrStr = month2+"/"+day2+"/"+year2;

                    //last activity date
                    if(o.last_activity_at == null){
                        dateStr = "None";
                    }else{
                        var date = new Date(o.last_activity_at);
                        var day = date.getDate();
                        var year = date.getFullYear();
                        var month = date.getMonth()+1;
                        if(day<10){
                            day='0'+day;
                        }
                        if(month<10){
                            month='0'+month;
                        }
                        dateStr = month+"/"+day+"/"+year;
                    }

                    toAppend += '<tr><td><input type="checkbox" id="'+o.id+'" name="students" value="'+o.id+'"></td><td>'+o.user.sortable_name+'</td><td>'+stuSectionName+'</td><td>'+dateEnrStr+'</td><td>'+dateStr+'</td></tr>';
                });
                $('#table_header').append(toAppend);
            }
        });
    }
    function deleteEnrollments(){
        $.each(array, function(index,item){
            var stuID = item;
            var url = "/api/v1/courses/"+courseID+"/enrollments/"+stuID+"?task=delete";
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
            console.log(stuID);
        });
        window.location.reload(true);
    }



    function createDialog() {
        var el = document.querySelector('#events_dialog');
        if (!el) {
            el = document.createElement('div');
            el.id = 'events_dialog';
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
            th.textContent = 'Student Name';
            th.onmouseover= function(){
                this.style.cursor='pointer';
            };
            th.onclick = function (){
                sortTable(1);
            };
            tr.appendChild(th);
            th = document.createElement('TH');
            th.textContent = 'Section';
            th.onmouseover= function(){
                this.style.cursor='pointer';
            };
            th.onclick = function (){
                sortTable(2);
            };
            tr.appendChild(th);
            th = document.createElement('TH');
            th.textContent = 'Enrollment Date';
            th.onmouseover= function(){
                this.style.cursor='pointer';
            };
            th.onclick = function (){
                sortTable(3);
            };
            tr.appendChild(th);
            th = document.createElement('TH');
            th.textContent = 'Last Activity';
            th.onmouseover= function(){
                this.style.cursor='pointer';
            };
            th.onclick = function (){
                sortTable(4);
            };
            tr.appendChild(th);
            var tbody = document.createElement('tbody');
            tbody.id = 'inner_table';
            tbody.onchange= setEvents;
            table.appendChild(tbody);
            var hr = document.createElement('HR');
            el.appendChild(hr);
            var incrButton = document.createElement('button');
            incrButton.classList.add('Button','button-primary','element_toggler');
            incrButton.type = 'button';
            incrButton.id = 'moreStu';
            incrButton.value = 0;
            var icon = document.createElement('i');
            icon.classList.add('icon-user');
            incrButton.appendChild(icon);
            var txt = document.createTextNode(' Add More');
            incrButton.appendChild(txt);
            incrButton.addEventListener('click', getStudents);
            el.appendChild(incrButton);

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
        array = $.map($('input[name="students"]:checked'), function(c){return c.value; });
    }
    function openDialog() {
        try {
            getSections();
            createDialog();
            $('#events_dialog').dialog({
                'title' : 'Manage Student Enrollments',
                'autoOpen' : false,
                'closeOnEscape': false,
                'open': function () { $(".ui-dialog-titlebar-close").hide(); $(".ui-dialog").css("top", "10px");},
                'buttons' : [  {
                    'text' : 'Cancel',
                    'click' : function() {
                        $(this).dialog('destroy').remove();
                        pageNum=0;
                        errors = [];
                        updateMsgs();
                    }
                },{
                    'text' : 'Remove Students',
                    'class': 'Button Button--primary',
                    'click' : deleteEnrollments

                } ],
                'modal' : true,
                'resizable' : false,
                'height' : '600',
                'width' : '40%',
                'scrollable' : true
            });
            if (!$('#events_dialog').dialog('isOpen')) {
                $('#events_dialog').dialog('open');
                $('#events_dialog').parent().css( "z-index", "9999" );
            }
        } catch (e) {
            console.log(e);
        }
        getStudents();
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
                $('#success_dialog').parent().css( "z-index", "9999" );
            }
        } catch (e) {
            console.log(e);
        }
    }
    function sortTable(n) {
        var el = document.querySelector('#events_dialog');
        if (el) {
            var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
            table = document.getElementById("table_header");
            switching = true;
            // Set the sorting direction to ascending:
            dir = "asc";
            /* Make a loop that will continue until
  no switching has been done: */
            while (switching) {
                // Start by saying: no switching is done:
                switching = false;
                rows = table.rows;
                /* Loop through all table rows (except the
    first, which contains table headers): */
                for (i = 1; i < (rows.length - 1); i++) {
                    // Start by saying there should be no switching:
                    shouldSwitch = false;
                    /* Get the two elements you want to compare,
      one from current row and one from the next: */
                    x = rows[i].getElementsByTagName("TD")[n];
                    y = rows[i + 1].getElementsByTagName("TD")[n];
                    /* Check if the two rows should switch place,
      based on the direction, asc or desc: */
                    if (dir == "asc") {
                        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                            // If so, mark as a switch and break the loop:
                            shouldSwitch = true;
                            break;
                        }
                    } else if (dir == "desc") {
                        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                            // If so, mark as a switch and break the loop:
                            shouldSwitch = true;
                            break;
                        }
                    }
                }
                if (shouldSwitch) {
                    /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
                    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                    // Each time a switch is done, increase this count by 1:
                    switchcount ++;
                } else {
                    /* If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again. */
                    if (switchcount == 0 && dir == "asc") {
                        dir = "desc";
                        switching = true;
                    }
                }
            }
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
