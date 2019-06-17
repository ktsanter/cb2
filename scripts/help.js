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

/*
var cbhData = {
	"inputSelector": "#testInput",
	"outputSelector": "#testOutput",
	
	"anchorSelector": ".cbh-nav-anchor",
	"emojiWrapper": "#emojiReferenceWrapper",
	"fullEmojiListButton": "#btnFullEmojiList"
};

$(document).ready(function() {	
	$(cbhData.inputSelector).bind('input change', function() {
		handleTestInputChange();
	});
	
	$(cbhData.anchorSelector).click(function() { handleAnchorSelection(this) });
	
	document.getElementById(cbhData.fullEmojiListButton.substring(1)).addEventListener('click', handleFullEmojiListButton, {passive: true});
	loadEmojiReferenceList();
});

function handleTestInputChange()
{
	var orig = $(cbhData.inputSelector).val();
	var formatted = formatTextFromMarkup(orig, false);
	$(cbhData.outputSelector).html(formatted);
}

function handleAnchorSelection(elem)
{
	$(cbhData.anchorSelector).removeClass('active');
	$(elem).addClass('active');
}

function loadEmojiReferenceList()
{
	var wrapper = document.getElementById(cbhData.emojiWrapper.substring(1));
	var emojiList = getEmojifierReferenceList();
		
	var list = document.createElement('select');
	list.addEventListener('change', function() {handleEmojiListSelection(this);});

	for (var i = 0; i < emojiList.length; i++) {
		var emoji = emojiList[i];
		var opt = document.createElement('option');
		opt.value = emoji.key;
		opt.innerHTML = emoji.key + " " + formatTextFromMarkup("::" + emoji.key + "::", false);
		list.appendChild(opt);
	}
	wrapper.appendChild(list);
	$(cbhData.emojiWrapper).hide();
}

function handleFullEmojiListButton()
{
	var wrapper = $(cbhData.emojiWrapper);
	var btn = $(cbhData.fullEmojiListButton);
	
	wrapper.toggle();
	
	if (wrapper.is(':visible')) {
		btn.addClass('depressed');
	} else {
		btn.removeClass('depressed');
	}
}

function handleEmojiListSelection(elem)
{
	$(cbhData.inputSelector).val( $(cbhData.inputSelector).val() + "::" + elem.value + "::");
	handleTestInputChange();
}
*/