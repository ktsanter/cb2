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
  }
	
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------    
  function _handleTestInputChange(e) {
    var origText = page.testinput.value;
    page.testoutput.innerHTML = MarkdownToHTML.convert(origText);
  }
  
	//---------------------------------------
	// return from wrapper function
	//----------------------------------------
	return {
		init: init
 	};
}();
