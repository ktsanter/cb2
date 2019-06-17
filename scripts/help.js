"use strict";
//-----------------------------------------------------------------------------------
// CommentBuddy help page
//-----------------------------------------------------------------------------------
// TODO: 
//-----------------------------------------------------------------------------------

const app = function () {
  const appversion = '2.01';
	const page = {};
  const settings = {};
  
	//---------------------------------------
	// get things going
	//----------------------------------------
  function init() {
		page.body = document.getElementsByTagName('body')[0];
    
    page.testinput = document.getElementById('testInput');
    page.testoutput = document.getElementById('testOutput');
    
    page.testinput.addEventListener('input', _handleTestInputChange, false);
    var navelements = document.getElementsByClassName('cbh-nav-anchor');
    for (var i = 0; i < navelements.length; i++) {
      navelements[i].addEventListener('click', _handleNavItemSelection, false);
    }
  }
	
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------    
  function _handleTestInputChange(e) {
    var origText = page.testinput.value;
    page.testoutput.innerHTML = MarkdownToHTML.convert(origText);
  }
  
  function _handleNavItemSelection(e) {
    var navelements = document.getElementsByClassName('cbh-nav-anchor');
    for (var i = 0; i < navelements.length; i++) {
      var elem = navelements[i];
      if (elem.classList.contains('active')) elem.classList.remove('active');
    }
    e.target.classList.add('active');
  }
  
	//---------------------------------------
	// return from wrapper function
	//----------------------------------------
	return {
		init: init
 	};
}();
