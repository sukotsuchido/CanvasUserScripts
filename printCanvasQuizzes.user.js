// ==UserScript==
// @name         Print Canvas Quiz
// @namespace    https://github.com/sukotsuchido/CanvasUserScripts
// @version      1.2
// @description  Allows the user to print quizzes from the preview page.
// @author       Chad Scott (ChadScott@katyisd.org)
// @include      https://*.instructure.com/courses/*/quizzes/*/take?preview*
// @require      https://code.jquery.com/jquery-3.4.1.min.js

// ==/UserScript==
(function() {
    $(document).ready ( function(){
        var parent = document.querySelector('#right-side');
        el = document.createElement('button');
        el.classList.add('Button','element_toggler','button-sidebar-wide');
        el.type = 'button';
        el.id = 'printQuizButton';
        var icon = document.createElement('i');
        icon.classList.add('icon-document');
        el.appendChild(icon);
        var txt = document.createTextNode(' Print');
        el.appendChild(txt);
        el.addEventListener('click', allMatchQuestions);
        parent.appendChild(el);
    });
    function allMatchQuestions(){
        var allMatchQuestions = document.querySelectorAll("div.matching_question");
        for (var z = 0; z < allMatchQuestions.length; z++) {
            var options = allMatchQuestions[z].querySelector("select").options;
            var list = document.createElement('div');
            var matchText = document.createElement('div');
            matchText.style.verticalAign = 'middle';
            matchText.innerHTML ='<strong>Match Choices:</strong>';
            for (var t = 0; t < options.length; t++) {
                if(options[t].textContent !=="[ Choose ]"){
                    temp = document.createElement('div');
                    temp.innerHTML = options[t].text;
                    temp.style.display = 'inline-block';
                    temp.style.padding ='20px';
                    temp.style.maxWidth = '25%';
                    temp.style.verticalAlign = 'Top';
                    list.appendChild(temp);
                }
                list.style.width = 'inherit';
                list.style.border = "thin dotted black";
                list.style.padding = "0px 0px 0px 10px";
                var optionsList = allMatchQuestions[z].querySelector(".answers");
                optionsList.appendChild(matchText);
                matchText.appendChild(list);
                var hideOptions = allMatchQuestions[z].querySelectorAll("select");
                console.log(hideOptions);
                for (var q = 0; q < hideOptions.length; q++) {
                    var hideChoice = hideOptions[q].querySelector("select");
                    hideOptions[q].style.visibility="hidden";
                }
            }
        }
        multiSelectQuestions();
        printQuizStyle();
    }
    function multiSelectQuestions(){
        var allMultiSelectQuestions = document.querySelectorAll("div.multiple_dropdowns_question select");
        for (var q = 0; q < allMultiSelectQuestions.length; q++) {
            var len = allMultiSelectQuestions[q].options.length;
            allMultiSelectQuestions[q].setAttribute('size', len);
            allMultiSelectQuestions[q].style.width = 'fit-content';
            allMultiSelectQuestions[q].style.maxWidth ='';
        }
    }
    function printQuizStyle(){
        var scale = document.querySelector("div.ic-Layout-contentMain");
        scale.style.zoom = "74%";
        var questionBlocks = document.querySelectorAll("div.question_holder");
        for (var i = 0; i < questionBlocks.length; i++) {
            questionBlocks[i].style.pageBreakInside = "avoid";
        }
        var answerChoices = document.querySelectorAll("div.answer");
        for (var j = 0; j < answerChoices.length; j++) {
            //answerChoices[j].style.display = "inline-block";
            //answerChoices[j].style.width = "22%";
            answerChoices[j].style.verticalAlign = "Top";
            answerChoices[j].style.borderTop = "none";
        }
        
        //This hides the Submit Quiz footer - delete the /* */ comment tags to hide the footer.
        var formActions = document.querySelectorAll("div.alert,div.ic-RichContentEditor,div.rce_links");
        for (var h = 0; h < formActions.length; h++) {
            formActions[h].style.visibility = "hidden";
        }
        var essayShrink = document.querySelectorAll("div.mce-tinymce");
        for (var m = 0; m < essayShrink.length; m++) {
            essayShrink[m].style.height = "200px";
        }
        window.print();
    }
})();
