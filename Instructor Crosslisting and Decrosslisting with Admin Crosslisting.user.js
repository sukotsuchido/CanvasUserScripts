// ==UserScript==
// @name         Canvas Crosslisting Instructor Tool
// @namespace    https://github.com/sukotsuchido/CanvasUserScripts
// @version      1.7
// @description  A Canvas UserScript to facilitate crosslisting and de-crosslisting of courses.
// @author       Chad Scott (ChadScott@katyisd.org)
// @include     https://*.instructure.com/courses
// @include     https://*.instructure.com/accounts/*
// @grant        none
// ==/UserScript==
'use strict';
    var assocRegex = new RegExp('^/courses$');
    var assocRegex2 = new RegExp('^/accounts/([0-9]+)$');
    var acc = window.location.pathname;
    var errors = [];
    var parentId = [];
    var termId = '';
    var courses = {};
    var dedupThings = [];
    var wholeName = '';
    var array =[];
    var user = '';
    /* role setup: Change the roles you want to have access to the crosslisting features. assocRegex is for the button on the all courses page and assocRegex2 is for the admin page. */
    var roles = ENV.current_user_roles;
    var cxbuttonRoles = ["admin", "teacher", "root_admin"];
    var admincxbuttonRoles = ["root_admin"];
    var test1 = cxbuttonRoles.some(el => roles.includes(el));
    var test2 = admincxbuttonRoles.some(el => roles.includes(el));
    if( (test1 === true) && (assocRegex.test(window.location.pathname))){
        getCourses();
    }
    if( (test2 === true) && (assocRegex2.test(window.location.pathname))){
        add_buttonAdmin();
    }
    function add_button() {
        var parent = document.querySelector('div.ic-Action-header__Secondary');
        if (parent) {
            var el = parent.querySelector('#jj_cross');
            if (!el) {
                el = document.createElement('button');
                el.classList.add('Button','element_toggler');
                el.type = 'button';
                el.id = 'jj_cross';
                var icon = document.createElement('i');
                icon.classList.add('icon-sis-synced');
                el.appendChild(icon);
                var txt = document.createTextNode(' Crosslist Courses');
                el.appendChild(txt);
                el.addEventListener('click', openDialog);
                parent.appendChild(el);
            }
            //de-crosslist button
            var el2 = parent.querySelector('#jj_decross');
            if (!el2) {
                el2 = document.createElement('button');
                el2.classList.add('Button', 'element_toggler');
                el2.type = 'button';
                el2.id = 'jj_decross';
                var icon2 = document.createElement('i');
                icon2.classList.add('icon-sis-not-synced');
                el2.appendChild(icon2);
                var txt2 = document.createTextNode(' De-Crosslist Courses');
                el2.appendChild(txt2);
                el2.addEventListener('click', openDialog2);
                parent.appendChild(el2);
            }
        }
    }
 /* This function creates the main popup window users interact with the crosslist their courses. 
    I followed the Canvas Style Guide as much as possible to the CSS already available to create the form elements. */
        function createDialog() {
        var el = document.querySelector('#jj_cross_dialog');
        if (!el) {
            el = document.createElement('form');
            el.id = 'jj_cross_dialog';
            el.classList.add('ic-Form-group');
            //Parent Course selection
            var help = document.createElement('div');
            help.innerHTML = '<div class="grid-row middle-xs"><div class="col-lg-8"><div class="content-box">Directions: Complete for each step to crosslist and rename your courses.<br/>Click OPTIONS for more information about Crosslisting.</div></div><div class="col-lg-4"><div id="action_helper" style="cursor: pointer" class="content-box"><div class="ic-image-text-combo Button" type="button"><i class="icon-info"></i><div class="ic-image-text-combo__text">Options</div></div></div></div></div>';
            help.classList.add('ic-Label');
            el.appendChild(help);
            var el5 = document.createElement('div');
            el5.classList.add('ic-Form-control');
            el.appendChild(el5);
            var label = document.createElement('label');
            label.htmlFor = 'jj_cross_parentCourse';
            label.innerHTML = '<a title="Bucket Course:\nThe main course that all other classes will join.">Step 1: Select Bucket Course</a>  (Hover over step for more help)';
            label.classList.add('ic-Label');
            el5.appendChild(label);
            var select = document.createElement('select');
            select.id = 'jj_cross_parentCourse';
            select.classList.add('ic-Input');
            select.onchange = getChildren;
            el5.appendChild(select);
            //childcourse checkboxes
            var el6 = document.createElement('fieldset');
            el6.id = 'child_list';
            el6.style.visibility = 'hidden';
            el6.classList.add("ic-Fieldset", "ic-Fieldset--radio-checkbox");
            el.appendChild(el6);
            var el7 = document.createElement('legend');
            el7.classList.add('ic-Legend');
            el7.innerHTML = '<a title="Only choose courses that need the same course materials.">Step 2: Choose Courses to Crosslist Into Bucket Course</a>    (Hover over step for more help)'; 
            el6.appendChild(el7);
            var el8 = document.createElement('div');
            el8.id = 'checkboxes';
            el8.classList.add('ic-Checkbox-group');
            el6.appendChild(el8);
            //Course Name
            var el9 = document.createElement('div');
            el9.id = 'course_div';
            el9.style.visibility = 'hidden';
            el9.classList.add('ic-Form-control');
            el.appendChild(el9);
            label = document.createElement('label');
            label.htmlFor = 'course_name';
            label.innerHTML = '<a title="Naming Convention: Campus Initials Course Name Teacher Name (First Initial.Last Name)\n\nHigh School: Include Semester A or B after Course Name."> Step 3: Set Course Name</a>    (Hover over step for more help)'; 
            label.classList.add('ic-Label');
            el9.appendChild(label);
            var input = document.createElement('input');
            input.id = 'course_name';
            input.classList.add('ic-Input');
            input.type = 'text';
            //input.placeholder = 'Campus Initials Course Name Teacher Name (First Initial.Last Name)';
            el9.appendChild(input);
            //Course Name Examples
            var el10 = document.createElement('p');
            el10.id = 'examples';
            el10.style.visibility = 'hidden';
            el10.classList = 'text-info';
            el.appendChild(el10);
            var ol = document.createElement('ol');
            ol.textContent = 'Examples:';
            //ol.style.border = "thin solid #0000FF";
            ol.classList = 'unstyled';
            el10.appendChild(ol);
            var li = document.createElement('li');
            li.textContent = 'High School: KHS English 3 A M.Smith';
            ol.appendChild(li);
            li = document.createElement('li');
            li.textContent = 'Junior High: BJH Spanish 1 PreAP G.Moreno';
            ol.appendChild(li);
            li = document.createElement('li');
            li.textContent = 'Elementary: KDE 4 Math G.Rorey';
            ol.appendChild(li);
            //message flash
            var msg = document.createElement('div');
            msg.id = 'jj_cross_msg';
            //msg.classList.add('ic-flash-warning');
            msg.style.display = 'none';
            el.appendChild(msg);
            var parent = document.querySelector('body');
            parent.appendChild(el);
        }
        setParent();
            /* opens the help dialog window */
        document.getElementById("action_helper").addEventListener("click", function(){
            openHelp();
        });
    }
    
    /* Help dialog window, explains the steps of how to crosslist */
    function createhelpDialog(){
        var el = document.querySelector('#help_dialog');
        if (!el) {
            el = document.createElement('div');
            el.innerHTML= '<div><b>Crosslist and Name Course:</b> Complete all 3 steps <br/><b>Crosslist and Don\'t Rename Course:</b> Complete steps 1 and 2 <br/><b>Only Rename Course:</b> Complete steps 1 and 3<br/><br/>Hover over each step for more help.</div>'; 
            el.id = 'help_dialog';
            //Parent Course selection
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
    
    /* This function creates the modal window for the help dialog, I have hidden the titlebar close button and disabled the ability to esc close also. */
    function openHelp() {
        try {
            createhelpDialog();
            $('#help_dialog').dialog({
                'title' : 'Possible Actions',
                'autoOpen' : false,
                'closeOnEscape': false,
                'open': function () { $(".ui-dialog-titlebar-close").hide(); $(".ui-dialog").css("top", "10px");},
                'buttons' : [  {
                    'text' : 'Close',
                    'click' : function() {
                        $(this).dialog('destroy').remove();
                    }
                } ],
                'modal' : true,
                'resizable' : false,
                'height' : 'auto',
                'width' : '30%'
            });
            if (!$('#help_dialog').dialog('isOpen')) {
                $('#help_dialog').dialog('open');
            }
        } catch (e) {
            console.log(e);
        }
    }
    
    /* This function sends an api request to get the current users course list. */
    function getCourses(){
        // Reset global variable errors
        errors= [];
        var url = "/api/v1/users/self/courses?inlcude[]=term&include[]=sections&per_page=75";
        $.ajax({
            'async': true,
            'type': "GET",
            'global': true,
            'dataType': 'JSON',
            'data': JSON.stringify(courses),
            'contentType': "application/json",
            'url': url,
            'success': function(courses){
                dedupThings = Array.from(courses.reduce((m, t) => m.set(t.id, t), new Map()).values());
                add_button();
            }
        });
    }
    /* This function sorts and returns only the most recent term id number. This prevents users from crosslisting into manually created courses. */
    function getTerm(dedupThings, prop) {
        var max;
        for (var i=0 ; i<dedupThings.length ; i++) {
            if (!max || parseInt(dedupThings[i][prop]) > parseInt(max[prop]))
                max = dedupThings[i];
        }
        return max;
    }
    
    /* This function takes the return from getTerm and then filters the courses for only that term id and sets the courses in the dropdown. */ 
    function setParent(){
        var toAppend = '';
        var select = document.getElementById('jj_cross_parentCourse');
        select.options.length = 0; // clear out existing items
        var getMax = getTerm(dedupThings, "enrollment_term_id");
        termId = getMax.enrollment_term_id;
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
    
    /* This function reveals the rest of the form after the parent course is selected. It adds the remaining courses not chosen to be the
    parent course as check boxes.*/
    function getChildren(){
        var show = document.getElementById('child_list');
        show.style.visibility = 'visible';
        var show2 = document.getElementById('course_div');
        show2.style.visibility = 'visible';
        var show3 = document.getElementById('examples');
        show3.style.visibility = 'visible';
        var clear = document.getElementById('checkboxes');
        var clear3='';
        if (clear.innerHTML !== null){
            clear.innerHTML = "";
        }
        parentId = document.getElementById("jj_cross_parentCourse").value;
        var labelAppend = '';
        var inputAppend = '';
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
    }
    /* Users are able to change the course name. This sets the text input to wholeName.*/
    function courseName(){
        var newName= [];
        newName = $.map($('input[id="course_name"]'), function(i){return i.value; });
        $.each(newName, function(index, item){
            if (item !==null){
                wholeName = item;
            }
        });
    }
    
    /* This functions sends an API command to change the name of the parent course.*/
    function updateName(){
        var url = "/api/v1/courses/" + parentId + "?course[name]=" + wholeName;
        $.ajax({
            'cache' : false,
            'url' : url ,
            'type' : 'PUT',
        }).done(function() {
            closeDialog();
        });
    }
    
    /* This function creates the modal window for the form dialog box */
    function openDialog() {
        try {
            createDialog();
            $('#jj_cross_dialog').dialog({
                'title' : 'Crosslist Courses',
                'autoOpen' : false,
                'closeOnEscape': false,
                'open': function () { $(".ui-dialog-titlebar-close").hide(); $(".ui-dialog").css("top", "10px");},
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
                'height' : 'auto',
                'width' : '40%'
            });
            if (!$('#jj_cross_dialog').dialog('isOpen')) {
                $('#jj_cross_dialog').dialog('open');
            }
        } catch (e) {
            console.log(e);
        }
    }
    
    /* this function stores the courses checked in step 2 to the array variable */
    function setChild() {
        array = $.map($('input[name="childCourses"]:checked'), function(c){return c.value; });
    }
    /* This function sends an API command to crosslist the courses stored in the array variable with the parent course.
    When it's done, it will execute the function to set the course to the users dashboard and then close the window.*/
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
                    $.each(data, function(i,o){
                        childSection = o.id;
                        var url2 = "/api/v1/sections/" + childSection + "/crosslist/" + parentId +"?";
                        $.ajax({
                            'cache' : false,
                            'url' : url2 ,
                            'type' : 'POST',
                        }).done(function() {
                            setFavorite();
                            closeDialog();
                        });
                    });
                }
            });
        });
    }
    
    /* Sets the course to the user's dashboard */
    function setFavorite (){
        var url = "/api/v1/users/self/favorites/courses/" + parentId;
        $.ajax({
            'cache' : false,
            'url' : url ,
            'type' : 'POST',
        });
    }
    
    /* If the user omits step 3, a dialog windows pops up verifying if the user doesn't want to rename the course.
    The confirmation button says crosslist only. If the user does want to rename, they can hit close and rename it in step 3. */
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
    /* This creates the modal window for the noname dialog box */
    function opennonameDialog(){
        try {
            nonameDialog();
            $('#nonamedialog').dialog({
                'title' : 'Crosslist Courses Only',
                'autoOpen' : false,
                'closeOnEscape': false,
                'open': function () { $(".ui-dialog-titlebar-close").hide(); },
                'buttons' : [{
                    'text' : 'Cancel',
                    'click' : function() {
                        $(this).dialog('destroy').remove();
                        errors = [];
                        updateMsgs();
                    }
                },{
                    'text' : 'Crosslist Only',
                    'class': 'Button Button--primary',
                    'click' : processDialog
                } ],
                'modal' : true,
                'resizable' : false,
                'height' : 'auto',
                'width' : '40%',
            });
            if (!$('#nonamedialog').dialog('isOpen')) {
                $('#nonamedialog').dialog('open');
            }
        } catch (e) {
            console.log(e);
        }
    }
    /* If the user omits step 2, a dialog windows pops up verifying if the user doesn't want to crosslist any courses.
    The confirmation button says rename only. If the user does want to crosslist, they can hit close and choose courses to crosslist in step 2. */
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
    /* Creates the modal window for the nocross dialog box */
    function opennocrossDialog(){
        try {
            nocrossDialog();
            $('#nocrossdialog').dialog({
                'title' : 'Update Course Name Only',
                'autoOpen' : false,
                'closeOnEscape': false,
                'open': function () { $(".ui-dialog-titlebar-close").hide(); },
                'buttons' : [  {
                    'text' : 'Cancel',
                    'click' : function() {
                        $(this).dialog('destroy').remove();
                        errors = [];
                        updateMsgs();
                    }
                },{
                    'text' : 'Update Name',
                    'class': 'Button Button--primary',
                    'click' : updateName
                } ],
                'modal' : true,
                'resizable' : false,
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
    /* This function processes the request of the main crosslist dialog window. It executes the appropriate functions based on steps completed.
    If step 2 and step 3 are skipped, it throws an error stating to complete step 2 and or step 3. */
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
            errors.push('You must choose a course to crosslist or input a course name.');
            updateMsgs();
        }
    }
    /* This function closes all dialog windows and launches a success dialog */
    function closeDialog(){
        $('#nocrossDialog').dialog('close');
        $('#nonameDialog').dialog('close');
        $('#jj_cross_dialog').dialog('close');
        $('#jj_cross_dialog2').dialog('close');
        window.location.reload(true);
        open_success_dialog();
    }
    /* This creates error messages at the bottom of the crosslist dialog window */
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
    /* This creates the success dialog window */
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
    
    /* This creates the modal window for the success dialog and it closes with the page refresh in the closeDialog function */
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
    /* You can remove the following if an admin panel is not needed. I'll come add comments to this section soon! */
    //Admin De-Crosslist
    function searchUser() {
        // Reset global variable errors
        errors = [];
        var userName;
        var el = document.getElementById('jj_cross_user');
        if (el.value && el.value.trim() !== '') {
            userName = el.value;
            var url = "/api/v1" + acc + "/users?search_term=" + userName + "&per_page=100";
            var userInfo;
            var x = document.getElementById("jj_cross_user");
            if (x.className === "ic-Input") {
                x.style.background = "url(https://imagizer.imageshack.us/a/img922/9776/IinEAt.gif) no-repeat right center";
            }
            $.ajax({
                'async': true,
                'type': "GET",
                'global': true,
                'dataType': 'JSON',
                'data': JSON.stringify(userInfo),
                'contentType': "application/json",
                'url': url,
                'success': function(data){
                    if(data.length > 0){
                        var toAppend = '';
                        var blank = '';
                        var select = document.getElementById('jj_cross_chooseuser');
                        select.options.length = 0; // clear out existing items
                        $.each(data,function(i,o){
                            var n = o.name;
                            if (n.toUpperCase() !== n){
                                toAppend += '<option value="'+o.id+'">'+o.name+'</option>';
                            }
                        });
                        blank += '<option value="">Please select</option>';
                        $('#jj_cross_chooseuser').append(blank);
                        $('#jj_cross_chooseuser').append(toAppend);
                        var x = document.getElementById("jj_cross_user");
                        if (x.className === "ic-Input") {
                            x.style.background = "#fff";
                        }
                    }else{
                        errors.push('No user found');
                        updateMsgs();
                    }
                }
            });
        }else {
            errors.push('You must type in a name.');
        }
        updateMsgs();
    }
    function getCoursesAdmin(){
        // Reset global variable errors
        errors= [];
        user = document.getElementById('jj_cross_chooseuser').value;
        var url = "/api/v1/users/"+ user +"/courses?include[]=term&per_page=75"; 
        $.ajax({
            'async': true,
            'type': "GET",
            'global': true,
            'dataType': 'JSON',
            'data': JSON.stringify(courses),
            'contentType': "application/json",
            'url': url,
            'success': function(courses){
                dedupThings = Array.from(courses.reduce((m, t) => m.set(t.id, t), new Map()).values());
                var toAppend = '';
                var blank ='';
                var select2 = document.getElementById('jj_cross_parentCourse');
                select2.options.length = 0; // clear out existing items
                var getMax = getTerm(dedupThings, "enrollment_term_id");
                termId = getMax.enrollment_term_id;
                $.each(dedupThings, function(i, o){
                    if (o.enrollment_term_id == termId) {
                        toAppend += '<option value="'+o.id+'">'+o.name+'</option>';
                    }
                });
                blank += '<option value="">Please select</option>';
                $('#jj_cross_parentCourse').append(blank);
                $('#jj_cross_parentCourse').append(toAppend);
            }
        });
    }
    function setParentDecross(){
        // Reset global variable errors
        errors= [];
        user = document.getElementById('jj_cross_chooseuser').value;
        var url = "/api/v1/users/"+ user +"/courses?include[]=term&include[]=sections&per_page=75"; 
        $.ajax({
            'async': true,
            'type': "GET",
            'global': true,
            'dataType': 'JSON',
            'data': JSON.stringify(courses),
            'contentType': "application/json",
            'url': url,
            'success': function(courses){
                dedupThings = Array.from(courses.reduce((m, t) => m.set(t.id, t), new Map()).values());
                var toAppend = '';
                var blank ='';
                var select2 = document.getElementById('jj_cross_parentCourse');
                select2.options.length = 0; // clear out existing items
                var getMax = getTerm(dedupThings, "enrollment_term_id");
                termId = getMax.enrollment_term_id;
                $.each(dedupThings, function(i, o){
                    if (o.enrollment_term_id == termId && o.sections.length > 1) {
                        toAppend += '<option value="'+o.id+'">'+o.name+'</option>';
                    }
                });
                blank += '<option value="">Please select</option>';
                $('#jj_cross_parentCourse').append(blank);
                $('#jj_cross_parentCourse').append(toAppend);
            }
        });
    }
    function getSections(){
        var courseSections;
        parentId = document.getElementById("jj_cross_parentCourse").value;
        var url = "/api/v1/courses/" + parentId + "/sections?";
        $.ajax({
            'async': true,
            'type': "GET",
            'global': true,
            'dataType': 'JSON',
            'data': JSON.stringify(courseSections),
            'contentType': "application/json",
            'url': url,
            'success': function (courseSections) {
                $.each(courseSections, function(index,item){
                    array = item.id;
                    if(array !== parentId){
                        var url2 = "/api/v1/sections/" + array + "/crosslist/";
                        $.ajax({
                            'cache' : false,
                            'url' : url2 ,
                            'type' : 'DELETE',

                        }).done(function() {
                            closeDialog();
                        });
                    }
                });
            }
        });
    }
    function openDialog2() {
        try {
            createDialog2();
            $('#jj_cross_dialog2').dialog({
                'title' : 'Admin De-Crosslist Tool',
                'autoOpen' : false,
                'closeOnEscape': false,
                'open': function () { $(".ui-dialog-titlebar-close").hide(); $(".ui-dialog").css("top", "10px");},
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
                    'click' : getSections
                } ],
                'modal' : true,
                'resizable' : false,
                'height' : 'auto',
                'width' : '40%',
            });
            if (!$('#jj_cross_dialog2').dialog('isOpen')) {
                $('#jj_cross_dialog2').dialog('open');
            }
        } catch (e) {
            console.log(e);
        }
    }
    function createDialog2() {
        var el = document.querySelector('#jj_cross_dialog2');
        if (!el) {
            el = document.createElement('form');
            el.id = 'jj_cross_dialog2';
            el.classList.add("ic-Form-control","account_search_form");
            var label = document.createElement('label');
            label.htmlFor = 'jj_cross_user';
            label.textContent = 'Search For Teacher:';
            label.classList.add('ic-Label');
            el.appendChild(label);
            var el11 = document.createElement('div');
            el11.style =('margin: 0 0 10px 0');
            el11.classList.add('ic-Input-group');
            el.appendChild(el11);
            var input = document.createElement('input');
            input.classList.add('ic-Input');
            input.id = 'jj_cross_user';
            input.type = 'text';
            input.placeholder = 'Enter Teacher Name';
            el11.appendChild(input);
            $("#jj_cross_user").keyup(function(event){
                if(event.keyCode == 13){
                    $("#btnSearch").click();
                }
            });
            var searchButton = document.createElement('button');
            searchButton.type = 'button';
            searchButton.id = 'btnSearch';
            searchButton.textContent = 'Search';
            searchButton.onclick = searchUser;
            searchButton.classList.add('Button');
            el11.appendChild(searchButton);
            //teacher dropdown
            label = document.createElement('label');
            label.htmlFor = 'jj_cross_choosuser';
            label.textContent = 'Search Results';
            label.classList.add('ic-Label');
            el.appendChild(label);
            var select = document.createElement('select');
            select.id = 'jj_cross_chooseuser';
            select.classList.add('ic-Input');
            select.placeholder = 'Select Teacher:';
            select.onchange = setParentDecross;
            el.appendChild(select);
            var el5 = document.createElement('div');
            el5.classList.add('ic-Form-control');
            el.appendChild(el5);
            var br = document.createElement('hr');
            el5.appendChild(br);
            label = document.createElement('label');
            label.htmlFor = 'jj_cross_parentCourse';
            label.textContent = 'Step 1: Select Bucket Course:';
            label.classList.add('ic-Label');
            el5.appendChild(label);
            select = document.createElement('select');
            select.id = 'jj_cross_parentCourse';
            select.classList.add('ic-Input');
            el5.appendChild(select);
            //message flash
            var msg = document.createElement('div');
            msg.id = 'jj_cross_msg2';
            //msg.classList.add('ic-flash-warning');
            msg.style.display = 'none';
            el.appendChild(msg);
            var parent = document.querySelector('body');
            parent.appendChild(el);
        }
    }
    function updateMsgs2() {
        var msg = document.getElementById('jj_cross_msg2');
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
    //Admin Crosslist
    function add_buttonAdmin(){

        var rightDiv = document.querySelector('div#right-side-wrapper');
            rightDiv.style.display='list-item';
        
        var parent = document.querySelector('aside#right-side');
        if (parent) {
            var el = parent.querySelector('#jj_cross');
            if (!el) {
                el = document.createElement('button');
                el.classList.add('Button','Button--primary','button-sidebar-wide','element_toggler');
                el.type = 'button';
                el.id = 'jj_cross';
                var icon = document.createElement('i');
                icon.classList.add('icon-sis-synced');
                el.appendChild(icon);
                var txt = document.createTextNode(' Admin Crosslist Tool');
                el.appendChild(txt);
                el.addEventListener('click', openDialog3);
                parent.appendChild(el);
            }
            //decrosslist button
            var el2 = parent.querySelector('#jj_decross');
            if (!el2) {
                el2 = document.createElement('button');
                el2.classList.add('Button','Button--secondary','button-sidebar-wide','element_toggler');
                el2.type = 'button';
                el2.id = 'jj_decross';
                var icon2 = document.createElement('i');
                icon2.classList.add('icon-sis-not-synced');
                el2.appendChild(icon2);
                var txt2 = document.createTextNode(' De-Crosslist Courses');
                el2.appendChild(txt2);
                el2.addEventListener('click', openDialog2);
                parent.appendChild(el2);
            }
        }
    }
    function adminDialog() {
        var el = document.querySelector('#jj_admin_dialog');
        if (!el) {
            //User Search
            el = document.createElement('form');
            el.id = 'jj_admin_dialog';
            el.classList.add("ic-Form-control","account_search_form");
            var label = document.createElement('label');
            label.htmlFor = 'jj_cross_user';
            label.textContent = 'Search For Teacher:';
            label.classList.add('ic-Label');
            el.appendChild(label);
            var el11 = document.createElement('div');
            el11.style =('margin: 0 0 10px 0');
            el11.classList.add('ic-Input-group');
            el.appendChild(el11);
            var input = document.createElement('input');
            input.classList.add('ic-Input');
            input.id = 'jj_cross_user';
            input.type = 'text';
            input.placeholder = 'Enter Teacher Name';
            el11.appendChild(input);
            var searchButton = document.createElement('button');
            searchButton.type = 'button';
            searchButton.id = 'btnSearch';
            searchButton.textContent = 'Search';
            searchButton.onclick = searchUser;
            searchButton.classList.add('Button');
            el11.appendChild(searchButton);
            $("#jj_cross_user").keyup(function(event){
                if(event.keyCode == 13){
                    $("#btnSearch").click();
                }
            });
            //teacher dropdown
            label = document.createElement('label');
            label.htmlFor = 'jj_cross_Results';
            label.textContent = 'Search Results';
            label.classList.add('ic-Label');
            el.appendChild(label);
            var select = document.createElement('select');
            select.id = 'jj_cross_chooseuser';
            select.classList.add('ic-Input');
            select.placeholder = 'Select Teacher:';
            select.onchange = getCoursesAdmin;
            el.appendChild(select);
            var el5 = document.createElement('div');
            el5.classList.add('ic-Form-control');
            el.appendChild(el5);
            var br = document.createElement('hr');
            el5.appendChild(br);
            label = document.createElement('label');
            label.htmlFor = 'jj_cross_parentCourse';
            label.textContent = 'Step 1: Select Bucket Course:';
            label.classList.add('ic-Label');
            el5.appendChild(label);
            select = document.createElement('select');
            select.id = 'jj_cross_parentCourse';
            select.classList.add('ic-Input');
            select.onchange = getChildren;
            el5.appendChild(select);
            //childcourse checkboxes
            var el6 = document.createElement('fieldset');
            el6.id = 'child_list';
            el6.style.visibility = 'none';
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
            el9.id = 'course_div';
            el9.style.visibility = 'none';
            el9.classList.add('ic-Form-control');
            el.appendChild(el9);
            label = document.createElement('label');
            label.htmlFor = 'course_name';
            label.textContent = 'Step 3: Course Name:';
            label.classList.add('ic-Label');
            el9.appendChild(label);
            input = document.createElement('input');
            input.id = 'course_name';
            input.classList.add('ic-Input');
            input.type = 'text';
            input.placeholder = 'Campus Initials Course Name Teacher Name (First Initial.Last Name)';
            el9.appendChild(input);
            //Course Name Examples
            var el10 = document.createElement('p');
            el10.id = 'examples';
            el10.style.visibility = 'none';
            el10.classList = 'text-info';
            el.appendChild(el10);
            var ol = document.createElement('ol');
            ol.textContent = 'Examples:';
            ol.classList = 'unstyled';
            el10.appendChild(ol);
            var li = document.createElement('li');
            li.textContent = 'KHS English III A M.Smith';
            ol.appendChild(li);
            li = document.createElement('li');
            li.textContent = 'BJH Spanish 1 PreAP G.Moreno';
            ol.appendChild(li);
            li = document.createElement('li');
            li.textContent = 'Elementary: KDE 4 Math G.Rorey';
            ol.appendChild(li);
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
    function openDialog3() {
        try {
            adminDialog();
            $('#jj_admin_dialog').dialog({
                'title' : 'Admin Crosslist Tool',
                'autoOpen' : false,
                'closeOnEscape': false,
                'open': function () { $(".ui-dialog-titlebar-close").hide(); $(".ui-dialog").css("top", "10px");},
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
                'height' : 'auto',
                'width' : '40%',
            });
            if (!$('#jj_admin_dialog').dialog('isOpen')) {
                $('#jj_admin_dialog').dialog('open');
            }
        } catch (e) {
            console.log(e);
        }
    }
    /* Remove to here if the admin panel isn't needed */
})();
