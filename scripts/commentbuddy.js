"use strict";
//-----------------------------------------------------------------------------------
// CommentBuddy class
//-----------------------------------------------------------------------------------
// TODO: 
//-----------------------------------------------------------------------------------

class CommentBuddy {
  constructor() {
    this._version = '0.01';
  }
  
  //--------------------------------------------------------------------------------
  // initializing
  //    expected values in deckParams object:
  //    {
  //      title: string,
  //      version: string
  //      commentdata: array of {tags, comment, hovertext}
  //      callbacks: {
  //         menu: array of menu options e.g. [{label: 'configure', callback: callbackfunc}, ...]
  //      }
  //    }
  //--------------------------------------------------------------------------------
  init(params) {
    this._title = params.title;
    this._outerappversion = params.version;
    this._commentdata = params.commentdata;    
    this._callbacks = params.callbacks;
    
    // initialize this._search and this._tags and this._selectedComment from storage
    
    this._mainContainer = null;
  }

  //--------------------------------------------------------------------------------
  // show/hide
  //--------------------------------------------------------------------------------
  hideMe() {
    this._mainContainer.style.display = 'none';
  }
  
  showMe() {
    this._mainContainer.style.display = 'inline-block';
  }
  
  //--------------------------------------------------------------------------------
  // rendering
  //--------------------------------------------------------------------------------
  renderMe() {
    this._mainContainer = CreateElement.createDiv(null, 'commentbuddy-main');
    
    this._renderNavigation(this._mainContainer);
    this._renderAbout(this._mainContainer);
    this._renderContent(this._mainContainer); 

    return this._mainContainer;
  }
  
  _renderNavigation(attachTo) {
    var elemContainer = CreateElement.createDiv(null, 'commentbuddy-topnav');
    attachTo.appendChild(elemContainer);
    
    var elemLink = CreateElement.createLink(null, 'commentbuddy-title', this._title, null, '#');
    elemContainer.appendChild(elemLink);
    
    var elemSubLinksContainer = CreateElement.createDiv('navLinks', null);
    
    var menuOptions = this._callbacks.menu;
    for (var i = 0; i < menuOptions.length; i++) {
      var handler = function (me, f) { return function(e) {me._doMenuOption(f);}} (this, menuOptions[i].callback);
      elemLink = CreateElement.createLink(null, 'commentbuddy-navlink', menuOptions[i].label, null, '#', handler); 
      elemSubLinksContainer.appendChild(elemLink);
    }
    
    elemSubLinksContainer.appendChild(CreateElement.createHR(null, null));
    elemSubLinksContainer.appendChild(CreateElement.createLink(null, 'commentbuddy-navigation', 'about', null, '#', e => CommentBuddy._doAbout(e)));
    elemContainer.appendChild(elemSubLinksContainer);
    
    elemLink = CreateElement.createLink('hamburger', 'icon', null, null, '#', e => CommentBuddy._toggleHamburgerMenu());
    elemLink.appendChild(CreateElement.createIcon(null, 'fa fa-bars'));
    elemContainer.appendChild(elemLink);
    
    return elemContainer;     
  }


  _renderAbout() {
    var sOuterAppVersion = '<span class="commentbuddy-about-version">' + '(v' + this._outerappversion + ')</span>';
    var details = [
      'author: Kevin Santer', 
      'contact: ktsanter@gmail.com'
    ];
    var elemContainer = CreateElement.createDiv('aboutThis', 'commentbuddy-about');
    
    var elemTitle = CreateElement.createDiv(null, null);
    elemTitle.appendChild(CreateElement.createDiv(null, 'commentbuddy-about-label', 'About <em>' + this._title + '</em> ' + sOuterAppVersion));
    elemTitle.appendChild(CreateElement.createIcon(null, 'fas fa-times fa-lg commentbuddy-about-close', 'close "about"', e => this._handleAboutCloseClick(e)));
    elemContainer.appendChild(elemTitle);
    
    var elemDetailContainer = CreateElement.createDiv(null, null);
    for (var i = 0; i < details.length; i++) {
      var elemDetail = CreateElement.createDiv('', 'commentbuddy-about-detail', details[i]);
      elemDetail.innerHTML = details[i];
      elemDetailContainer.appendChild(elemDetail);      
    }
    elemContainer.appendChild(elemDetailContainer);
        
    return elemContainer;
  }
  
  //--------------------------------------------------------------------------
  // render comment info
  //--------------------------------------------------------------------------
  _renderContent(attachTo) {
    var content = CreateElement.createDiv(null, 'commentbuddy-content');
    attachTo.appendChild(content);
    
    this._renderSearch(content);
    this._renderTags(content);
    this._renderComments(content);
    this._renderPreview(content);
  } 
  
  _renderSearch(attachTo) {
    var container = CreateElement.createDiv('cbSearch', 'commentbuddy-content-section', 'search');
    attachTo.appendChild(container);
  }
  
   _renderTags(attachTo) {
    var container = CreateElement.createDiv('cbTags', 'commentbuddy-content-section', 'tags');
    attachTo.appendChild(container);
  }
  
   _renderComments(attachTo) {
    var container = CreateElement.createDiv('cbComments', 'commentbuddy-content-section');
    attachTo.appendChild(container);
    
    this._renderSelectedComments(container);
  }
  
   _renderPreview(attachTo) {
    var container = CreateElement.createDiv('cbPreview', 'commentbuddy-content-section', '<em>preview of formatted comment</em>');
    attachTo.appendChild(container);
  }
  
  _renderSelectedComments(container) {
    if (!container) {
      container = document.getElementById('cbComments');
    }
    while (container.firstChild) container.removeChild(container.firstChild);
    
    var handler = function (me) { return function(e) {me._handleSelectChange(e);}} (this);
    var elemSelect = CreateElement.createSelect('selectComment', null, handler);
    container.appendChild(elemSelect);
    elemSelect.size = 20;
    
    var selectedComments = this._filterComments();
    for (var i = 0; i < selectedComments.length; i++) {
      elemSelect.appendChild(CreateElement.createOption(null, null, i, selectedComments[i].comment));
    }
  }

  //--------------------------------------------------------------------------
  // data processing
  //--------------------------------------------------------------------------  
  _filterComments() {
    // TODO: filter with search and tags
    this._filteredComments = this._commentdata;
    return this._filteredComments;
  }
  
  _processSelectedComment(objComment) {
    var preview = document.getElementById('cbPreview');
    var commentText = objComment.comment;
    var renderedComment = MarkdownToHTML.convert(commentText)
    preview.innerHTML = renderedComment;
    this._copyRenderedToClipboard(renderedComment);
  }
  
  //--------------------------------------------------------------------------
  // handlers
  //--------------------------------------------------------------------------  
  static _doAbout() { 
    document.getElementById('navLinks').style.display = 'none';
    document.getElementById('aboutThis').style.display = 'block';
  }

  _doMenuOption(callback) {
    CommentBuddy._toggleHamburgerMenu();
    callback();
  }
  
  _handleAboutCloseClick() {
    document.getElementById('aboutThis').style.display = 'none';
  }
  
  static _toggleHamburgerMenu() {
    CommentBuddy._toggleDisplay(document.getElementById("navLinks"));
  }
  
  _handleSelectChange(e) {
    this._processSelectedComment(this._filteredComments[e.target.selectedIndex]);
  }
    
  //---------------------------------------
  // clipboard functions
  //----------------------------------------
  _copyToClipboard(txt) {
    if (!this._mainContainer._clipboard) this._mainContainer._clipboard = new ClipboardCopy(this._mainContainer, 'plain');

    this._mainContainer._clipboard.copyToClipboard(txt);
	}	

  _copyRenderedToClipboard(txt) {
    if (!this._mainContainer._renderedclipboard) this._mainContainer._renderedclipboard = new ClipboardCopy(this._mainContainer, 'rendered');

    this._mainContainer._renderedclipboard.copyRenderedToClipboard(txt);
	}	
  
  //---------------------------------------
  // utility functions
  //----------------------------------------
  static _toggleDisplay(elem) {
    if (elem.style.display === "block") {
      elem.style.display = "none";
    } else {
      elem.style.display = "block";
    }
  }
}
