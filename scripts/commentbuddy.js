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
    
    console.log(this._commentdata);
    
    this._mainContainer.appendChild(this._renderNavigation(this._title));
    this._mainContainer.appendChild(this._renderAbout());
    this._mainContainer.appendChild(this._renderContent()); 

    return this._mainContainer;
  }
  
  _renderNavigation(title) {
    var elemContainer = CreateElement.createDiv(null, 'commentbuddy-topnav');
    
    var elemLink = CreateElement.createLink(null, 'commentbuddy-title', title, null, '#');
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
  _renderContent() {
    var content = CreateElement.createDiv(null, 'commentbuddy-content');
    
    content.appendChild(this._renderSearch());
    content.appendChild(this._renderTags());
    content.appendChild(this._renderComments());
    content.appendChild(this._renderPreview());

    return content;
  } 
  
  _renderSearch() {
    var container = CreateElement.createDiv('cbSearch', 'commentbuddy-content-section', 'search');
    
    return container;
  }
  
   _renderTags() {
    var container = CreateElement.createDiv('cbSearch', 'commentbuddy-content-section', 'tags');
    
    return container;
  }
  
   _renderComments() {
    var container = CreateElement.createDiv('cbSearch', 'commentbuddy-content-section', 'comments');
    
    return container;
  }
  
   _renderPreview() {
    var container = CreateElement.createDiv('cbSearch', 'commentbuddy-content-section', 'preview');
    
    return container;
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
    
  //---------------------------------------
  // clipboard functions
  //----------------------------------------
  
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
