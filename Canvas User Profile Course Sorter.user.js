// ==UserScript==
// @name         Canvas Enrollments Sorter
// @namespace    https://github.com/sukotsuchido/CanvasUserScripts
// @version      0.5
// @description  Adds sorting buttons to courses list on User Account Details Page
// @author       Chad Scott (ChadScott@katyisd.org
// @include      https://*.instructure.com/accounts/*/users/*
// @include      https://*.instructure.com/users/*
// @grant        none

// ==/UserScript==

(function() {
   $(document).ready ( function(){
    
//expand enrollments window
document.getElementById('courses_list').childNodes[3].childNodes[1].style.maxHeight = "";
      
$( "li.clearfix" ).each(function( index ) {
  $( this ).find( "span:eq(1)" ).addClass( 'termCS' );
});
       //add id to UL
       document.getElementsByClassName('unstyled_list context_list')[0].id = "courseUL";


       //edit Courses DIV to put sort buttons
       var el = document.querySelector('#courses_list');
       var titleLinks = document.createElement('div');
       titleLinks.id = "sort";
       titleLinks.innerHTML = '<Span><a class="btn" href="#name">Sort by Name</a></span><span><a class="btn" href="#termCS">Sort by Term</a></span>';
       //el.append(titleLinks);
       el.insertBefore(titleLinks, el.childNodes[0]);


//sort function
       $("#sort a").click(function(e) {
    var asc = $(this).hasClass("desc"),
        sort = this.hash.substr(1),
        list = $("#courseUL");
    list.append(list.children().get().sort(function(a, b) {
        var aProp = $(a).find("span."+sort).text(),
            bProp = $(b).find("span."+sort).text();
        return (aProp > bProp ? 1 : aProp < bProp ? -1 : 0) * (asc ? 1 : -1);
    }));
    $(this).toggleClass("asc", asc)
           .toggleClass("desc", !asc)
           .siblings().removeClass("asc desc");
    e.preventDefault();
});
       });
})();
