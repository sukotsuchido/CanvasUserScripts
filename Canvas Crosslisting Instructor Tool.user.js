// ==UserScript==
// @name         Canvas Crosslisting Instructor Tool
// @namespace    https://github.com/sukotsuchido/CanvasUserScripts
// @version      1.0
// @description  try to save our time
// @author       Chad Scott
// @include     https://*.instructure.com/courses
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    var assocRegex = new RegExp('^/courses');
    var acc = window.location.pathname;
    var errors = [];
    var parentId = [];
    var termId1 = "14";
    var termId2 = "15";
    var termId = termId2;
    var semesterLabel1 = "Spring 2017";
    var semesterLabel2 = "Fall 2017";
    var filteredCourses = [];
    var courses = {};
    var dedupThings = [];
    var wholeName = '';
    var array =[];

    if (assocRegex.test(window.location.pathname)) {
        add_button();
    }

    function getCsrfToken() {
        var csrfRegex = new RegExp('^_csrf_token=(.*)$');
        var csrf;
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            var match = csrfRegex.exec(cookie);
            if (match) {
                csrf = decodeURIComponent(match[1]);
                break;
            }
        }
        return csrf;
    }

    function add_button() {
        var parent = document.querySelector('div.ic-Action-header__Secondary');
        if (parent) {
            var el = parent.querySelector('#jj_cross');
            if (!el) {
                el = document.createElement('a');
                el.classList.add('btn', 'element_toggler');
                el.id = 'jj_cross';
                var icon = document.createElement('i');
                icon.classList.add('icon-import');
                el.appendChild(icon);
                var txt = document.createTextNode(' Crosslist Courses');
                el.appendChild(txt);
                el.addEventListener('click', openDialog);
                parent.appendChild(el);
            }
        }
    }

    function createDialog() {
        getCourses();
        var el = document.querySelector('#jj_cross_dialog');


        if (!el) {

            el = document.createElement('div');
            el.id = 'jj_cross_dialog';
            //Parent Course selection
            var el5 = document.createElement('div');
            el5.classList.add('ic-Form-control');
            el.appendChild(el5);
            var label = document.createElement('label');
            label.htmlFor = 'jj_cross_parentCourse';
            label.textContent = 'Step 1: Select Bucket Course:';
            label.classList.add('ic-Label');
            el5.appendChild(label);
            var select = document.createElement('select');
            select.id = 'jj_cross_parentCourse';
            select.classList.add('ic-Input');
            select.onchange = getChildren;
            el5.appendChild(select);
            //childcourse checkboxes

            var el6 = document.createElement('fieldset');
            el6.classList.add("ic-Fieldset", "ic-Fieldset--radio-checkbox");
            el.appendChild(el6);
            var el7 = document.createElement('legend');
            el7.classList.add('ic-Legend');
            el7.textContent = 'Step 2: Choose Courses to Crosslist Into Bucket Course:';
            el6.appendChild(el7);
            var el8 = document.createElement('div');
            el8.id = 'checkboxes';
            el8.classList.add('ic-Checkbox-group');
            el6.appendChild(el8);
            //Course Name
            var el9 = document.createElement('div');
            el9.classList.add('ic-Form-control');
            el.appendChild(el9);
            label = document.createElement('label');
            label.htmlFor = 'course_name';
            label.textContent = 'Step 3: Course Name:';
            label.classList.add('ic-Label');
            el9.appendChild(label);
            var input = document.createElement('input');
            input.id = 'course_name';
            input.classList.add('ic-Input');
            input.type = 'text';
            input.placeholder = 'Campus Initials Course Name Teacher Name (First Initial.Last Name)';
            el9.appendChild(input);
            //Course Name Examples
            var el10 = document.createElement('p');
            el10.classList = 'text-info';
            el.appendChild(el10);
            var ol = document.createElement('ol');
            ol.textContent = 'Examples:';
            ol.classList = 'unstyled';
            el10.appendChild(ol);
            var li = document.createElement('li');
            li.textContent = 'KHS English III M.Smith';
            ol.appendChild(li);
            li = document.createElement('li');
            li.textContent = 'BJH Spanish 1 PreAP G.Moreno';
            ol.appendChild(li);
            //modal window1
            var el11 = document.createElement('div');
            el11.id = 'example';
            el.appendChild(el11);
            //message flash
            var msg = document.createElement('div');
            msg.id = 'jj_cross_msg';
            //msg.classList.add('ic-flash-warning');
            msg.style.display = 'none';
            el.appendChild(msg);
            var parent = document.querySelector('body');
            parent.appendChild(el);
        }

    }
    function getCourses(){
        // Reset global variable errors
        errors = [];
        var url = "/api/v1/courses?inlcude[]=term&per_page=75"; //may need to change per_page to higher number if instructor has LOTS of courses
        $.ajax({
            'async': true,
            'type': "GET",
            'global': true,
            'dataType': 'JSON',
            'data': JSON.stringify(courses),
            'contentType': "application/json",
            'url': url,
            'success': function(courses){
                var toAppend = '';
                var select = document.getElementById('jj_cross_parentCourse');
                select.options.length = 0; // clear out existing items

                dedupThings = Array.from(courses.reduce((m, t) => m.set(t.id, t), new Map()).values());
                $.each(dedupThings, function(i, o){
                    if (o.enrollment_term_id == termId) {
                        toAppend += '<option value="'+o.id+'">'+o.name+'</option>';
                    }
                });
                var blank =''; 
                blank += '<option value="">Please select</option>';
                $('#jj_cross_parentCourse').append(blank); 
                $('#jj_cross_parentCourse').append(toAppend);

            }
        });
        updateMsgs();
    }
    function getChildren(){
        var clear = document.getElementById('checkboxes');
        var clear2 ='';
        var clear3='';
        if (clear.innerHTML !== null){
            clear.innerHTML = "";
        }
        parentId = document.getElementById("jj_cross_parentCourse").value;
        var labelAppend = '';
        var inputAppend = '';
        var check = document.getElementById('checkboxes');
        $.each(dedupThings,function(i,o){
            if (o.enrollment_term_id == termId && o.id != parentId) {
                labelAppend += '<input type="checkbox" id="'+o.id+'" name="childCourses" value="'+o.id+'">'+'<label class="ic-Label" for="'+o.id+'">'+o.name+'</label>';
                clear3=labelAppend;
                if (labelAppend !== null){
                    labelAppend = '';
                }
                inputAppend += '<div class="ic-Form-control ic-Form-control--checkbox">'+clear3+'</div>';
            }
        });
        $('#checkboxes').append(inputAppend);

        updateMsgs();
    }

    function courseName(){

        var newName= [];
        newName = $.map($('input[id="course_name"]'), function(i){return i.value; });
        $.each(newName, function(index, item){
            if (item !==null){
                wholeName = item;
            }
        });
    }
    function updateName(){
        var url = "/api/v1/courses/" + parentId + "?course[name]=" + wholeName;
        $.ajax({
            'cache' : false,
            'url' : url ,
            'type' : 'PUT',
        }).done(function() {
            closeDialog();
        });

        updateMsgs();
    }
    function openDialog() {
        try {
            createDialog();
            $('#jj_cross_dialog').dialog({
                'title' : 'Crosslist Courses',
                'autoOpen' : false,
                'closeOnEscape': false,
                'open': function () { $(".ui-dialog-titlebar-close").hide(); },
                'buttons' : [ {
                    'text' : 'Crosslist',
                    'click' : submitButton
                }, {
                    'text' : 'Cancel',
                    'click' : function() {
                        $(this).dialog('destroy').remove();
                        errors = [];
                        updateMsgs();
                    }
                } ],
                'modal' : true,
                'height' : 'auto',
                'width' : '80%'
            });
            if (!$('#jj_cross_dialog').dialog('isOpen')) {
                $('#jj_cross_dialog').dialog('open');
            }
        } catch (e) {
            console.log(e);
        }
    }

    function setChild() {
        // Reset global variable errors

        array = $.map($('input[name="childCourses"]:checked'), function(c){return c.value; });

    }
    function processDialog() {


        $.each(array, function(index,item){
            var childCourse = item;
            var childSection;
            var url = "/api/v1/courses/" + childCourse + "/sections?";
            $.ajax({
                'async': true,
                'type': "GET",
                'global': true,
                'dataType': 'JSON',
                'data': JSON.stringify(childSection),
                'contentType': "application/json",
                'url': url,
                'success': function (data) {
                    childSection = data[0].id;
                    var url2 = "/api/v1/sections/" + childSection + "/crosslist/" + parentId +"?";
                    $.ajax({
                        'cache' : false,
                        'url' : url2 ,
                        'type' : 'POST',
                    }).done(function() {
                        closeDialog();
                    });
                }
            });
        });


    }


    function nonameDialog(){
        var el = document.querySelector('#nonamedialog');
        if (!el) {

            el = document.createElement('div');
            el.id = 'nonamedialog';
            var el2 = document.createElement('div');
            el.appendChild(el2);
            var el3 = document.createElement('p');
            el3.textContent = ' No course name entered!';
            el2.appendChild(el3);
            //direction 1
            var div1 = document.createElement('div');
            div1.classList.add('ic-image-text-combo');
            el.appendChild(div1);
            var icon;
            icon = document.createElement('i');
            icon.classList.add('icon-check');
            div1.appendChild(icon);
            var text = document.createElement('div');
            text.classList.add("text-success","ic-image-text-combo__text");
            text.textContent = 'Click "Crosslist Only" to continue without naming';
            div1.appendChild(text);
            //direction 2
            div1 = document.createElement('div');
            div1.classList.add('ic-image-text-combo');
            el.appendChild(div1);
            icon = document.createElement('i');
            icon.classList.add('icon-warning');
            div1.appendChild(icon);
            text = document.createElement('p');
            text.classList.add("text-warning","ic-image-text-combo__text");
            text.textContent = 'Click "Cancel" to go back and name your course.';
            div1.appendChild(text);
            var parent = document.querySelector('body');
            parent.appendChild(el);
        }
    }

    function opennonameDialog(){
        try {
            nonameDialog();
            $('#nonamedialog').dialog({
                'title' : 'Crosslist Courses Only',
                'autoOpen' : false,
                'closeOnEscape': false,
                'open': function () { $(".ui-dialog-titlebar-close").hide(); },
                'buttons' : [ {
                    'text' : 'Crosslist Only',
                    'click' : processDialog
                }, {
                    'text' : 'Cancel',
                    'click' : function() {
                        $(this).dialog('destroy').remove();
                        errors = [];
                        updateMsgs();
                    }
                } ],
                'modal' : true,
                'height' : 'auto',
                'width' : '40%'
            });
            if (!$('#nonamedialog').dialog('isOpen')) {
                $('#nonamedialog').dialog('open');
            }
        } catch (e) {
            console.log(e);
        }
    }
    function nocrossDialog(){
        var el = document.querySelector('#nocrossdialog');
        if (!el) {

            el = document.createElement('div');
            el.id = 'nocrossdialog';
            var el2 = document.createElement('div');
            el.appendChild(el2);
            var el3 = document.createElement('p');
            el3.textContent = ' No courses selected to crosslist!';
            el2.appendChild(el3);
            //direction 1
            var div1 = document.createElement('div');
            div1.classList.add('ic-image-text-combo');
            el.appendChild(div1);
            var icon;
            icon = document.createElement('i');
            icon.classList.add('icon-check');
            div1.appendChild(icon);
            var text = document.createElement('div');
            text.classList.add("text-success","ic-image-text-combo__text");
            text.textContent = 'Click "Update Name" to continue without crosslisting';
            div1.appendChild(text);
            //direction 2
            div1 = document.createElement('div');
            div1.classList.add('ic-image-text-combo');
            el.appendChild(div1);
            icon = document.createElement('i');
            icon.classList.add('icon-warning');
            div1.appendChild(icon);
            text = document.createElement('p');
            text.classList.add("text-warning","ic-image-text-combo__text");
            text.textContent = 'Click "Cancel" to go back and choose courses to crosslist.';
            div1.appendChild(text);
            var parent = document.querySelector('body');
            parent.appendChild(el);
        }
    }
    function opennocrossDialog(){
        try {
            nocrossDialog();
            $('#nocrossdialog').dialog({
                'title' : 'Update Course Name Only',
                'autoOpen' : false,
                'closeOnEscape': false,
                'open': function () { $(".ui-dialog-titlebar-close").hide(); },
                'buttons' : [ {
                    'text' : 'Update Name',
                    'click' : updateName
                }, {
                    'text' : 'Cancel',
                    'click' : function() {
                        $(this).dialog('destroy').remove();
                        errors = [];
                        updateMsgs();
                    }
                } ],
                'modal' : true,
                'height' : 'auto',
                'width' : '40%'
            });
            if (!$('#nocrossdialog').dialog('isOpen')) {
                $('#nocrossdialog').dialog('open');
            }
        } catch (e) {
            console.log(e);
        }
    }
    function submitButton(){
        errors = [];
        courseName();
        setChild();
        if (wholeName !=='' || array !=+ ''){


            if (wholeName !=='' && array !=+ ''){
                updateName();
                processDialog();

            } else if (wholeName ==='' && array !=+ ''){
                opennonameDialog();

            }else{
                opennocrossDialog();
            }
        }else{
            errors.push('You must choose a course to crosslist or course name.');
            updateMsgs();
        }
    }
    function closeDialog(){
        updateMsgs();
        $('#nocrossDialog').dialog('close');
        $('#nonameDialog').dialog('close');
        $('#jj_cross_dialog').dialog('close');
        window.location.reload(true);
    }
    function updateMsgs() {
        var msg = document.getElementById('jj_cross_msg');
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
