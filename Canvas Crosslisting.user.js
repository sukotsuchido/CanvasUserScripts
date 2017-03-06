// ==UserScript==
// @name         Canvas Crosslisting 
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to save our time
// @author       Chad Scott
// @include     https://*.instructure.com/accounts/*
// @grant        none
// ==/UserScript==
(function() {
  'use strict';
  var assocRegex = new RegExp('^/accounts/([0-9]+)$');
  var errors = [];
  var childS = [];
  var parentC = [];

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
    var parent = document.querySelector('aside#right-side');
    if (parent) {
      var el = parent.querySelector('#jj_cross');
      if (!el) {
        el = document.createElement('a');
        el.classList.add('btn', 'button-sidebar-wide');
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
    var el = document.querySelector('#jj_cross_dialog');
    if (!el) {
      //field1
      el = document.createElement('div');
      el.id = 'jj_cross_dialog';
      el.classList.add('ic-Form-control');
      var label = document.createElement('label');
      label.htmlFor = 'jj_cross_title';
      label.textContent = 'Parent Course Number:';
      label.classList.add('ic-Label');
      el.appendChild(label);
      var input = document.createElement('input');
      input.id = 'jj_cross_title';
      input.classList.add('ic-Input');
      input.type = 'text';
      input.placeholder = 'Enter Parent (bucket) Course Number:';
      el.appendChild(input);
        //field2
      label = document.createElement('label');
      label.htmlFor = 'jj_cross_child';
      label.textContent = 'Child Course Number: ';
      label.classList.add('ic-Label');
      el.appendChild(label);
      input = document.createElement('input');
      input.id = 'jj_cross_child';
      input.classList.add('ic-Input');
      input.type = 'text';
      input.placeholder = 'Enter Child Course Number:';
      el.appendChild(input);

      //message flash
      var msg = document.createElement('div');
      msg.id = 'jj_cross_msg';
      msg.classList.add('ic-flash-warning');
      msg.style.display = 'none';
      el.appendChild(msg);
      var parent = document.querySelector('body');
      parent.appendChild(el);
    }
  }
   
  function openDialog() {
    try {
      createDialog();
      $('#jj_cross_dialog').dialog({
        'title' : 'Crosslist Courses',
        'autoOpen' : false,
        'buttons' : [ {
          'text' : 'Crosslist',
          'click' : processDialog
        }, {
          'text' : 'Cancel',
          'click' : function() {
            $(this).dialog('close');
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

  function processDialog() {
    // Reset global variable errors
    errors = [];
    var parentCourse, childCourse;
        var el = document.getElementById('jj_cross_title');
    if (el.value && el.value.trim() !== '') {
      parentCourse = el.value;
        parentC = parentCourse;
    } else {
      errors.push('You must provide a parent course.');
    }
 el = document.getElementById('jj_cross_child');
    if (el.value && el.value.trim() !== '') {
      childCourse = el.value;
        var childSection;
        var url = "https://*.instructure.com/api/v1/courses/" + childCourse + "/sections?";
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
        childS = childSection;    
        var url2 = "https://*.instructure.com/api/v1/sections/" + childS + "/crosslist/" + parentC +"?";
    $.ajax({
      'cache' : false,
      'url' : url2 ,
      'type' : 'POST',
    }).done(function() {
      updateMsgs();
      $('#jj_cross_dialog').dialog('close');
      window.location.reload(true);
    }).fail(function() {
      errors.push('All the information was supplied correctly, but there was an error crosslisting courses in Canvas.');
      updateMsgs();
    });
    }
});
    } else {
      errors.push('You must provide a child course.');
    }
    updateMsgs();
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
      var ul = document.createElement('ul');
      var li;
      for (var i = 0; i < errors.length; i++) {
        li = document.createElement('li');
        li.textContent = errors[i];
        ul.appendChild(li);
      }
      msg.appendChild(ul);
      msg.style.display = 'inline-block';
    }
  }


})();
