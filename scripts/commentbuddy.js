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
  init(params, initFinishedCallback) {
    this._title = params.title;
    this._outerappversion = params.version;
    this._commentdata = params.commentdata;    
    this._callbacks = params.callbacks;

    this._mainContainer = null;
    
    var loadCallback = function (me, cb) { return function(res) {me._finishInit(res, cb);}} (this, initFinishedCallback);
    this._loadSettings(loadCallback);
  }
  
  _finishInit(loadresults, initFinishedCallback) {
    this._settings = loadresults;
    initFinishedCallback();
  }

  //--------------------------------------------------------------------------------
  // load and store settings
  //--------------------------------------------------------------------------------
  _loadSettings(callback) {
    new ChromeSyncStorage().load([
        {key: 'cb2_searchstring', resultfield: 'searchstring', defaultval: ''},
        {key: 'cb2_tagstring', resultfield: 'tagstring', defaultval: ''},
        {key: 'cb2_selectedcommentindex', resultfield: 'selectedcommentindex', defaultval: -1},
      ], 
      callback);
  }
  
  _storeSettings() {
    new ChromeSyncStorage().store([
      {key: 'cb2_searchstring', value: document.getElementById('cbSearchInput').value}, 
      {key: 'cb2_tagstring', value: document.getElementById('cbSearchTags').value},
      {key: 'cb2_selectedcommentindex', value: document.getElementById('cbSelectComment').selectedIndex},
      { key: 'cb2_savecommenttext', value: ''}
    ]);
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
  }

  _renderAbout(attachTo) {
    var sOuterAppVersion = '<span class="commentbuddy-about-version">' + '(v' + this._outerappversion + ')</span>';
    var details = [
      'author: Kevin Santer', 
      'contact: ktsanter@gmail.com'
    ];
    var elemContainer = CreateElement.createDiv('aboutThis', 'commentbuddy-about');
    attachTo.appendChild(elemContainer);
    
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
  }
  
  static _toggleHamburgerMenu() {
    var elem = document.getElementById("navLinks");
    if (elem.style.display === "block") {
      elem.style.display = "none";
    } else {
      elem.style.display = "block";
    }
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
    var container = CreateElement.createDiv('cbSearch', 'commentbuddy-content-section');
    attachTo.appendChild(container);
    
    container.appendChild(CreateElement.createDiv(null, 'commentbuddy-content-section-label', 'search'));
    var searchInput = CreateElement.createTextInput('cbSearchInput', 'commentbuddy-content-section-control', this._settings.searchstring);
    container.appendChild(searchInput);
    var handler = function (me) { return function(e) {me._handleSearchInput(e);}} (this);
    searchInput.addEventListener('input', handler, false);
  }
  
   _renderTags(attachTo) {
    var container = CreateElement.createDiv('cbTags', 'commentbuddy-content-section');
    attachTo.appendChild(container);

    container.appendChild(CreateElement.createDiv(null, 'commentbuddy-content-section-label', 'tags'));
    
    var tagsearchInput = CreateElement.createTextInput('cbSearchTags', 'commentbuddy-content-section-control', this._settings.tagstring);
    container.appendChild(tagsearchInput);
    var handler = function (me) { return function(e) {me._handleTagSearchInput(e);}} (this);
    tagsearchInput.addEventListener('input', handler, false);
    
    var handler = function (me, f) { return function(e) {me._showTagList(e, f);}} (this, true);
    container.appendChild(CreateElement.createIcon('cbTagListOpen', 'fas fa-caret-square-up commentbuddy-tagicon', 'show tag list', handler));
    
    var handler = function (me, f) { return function(e) {me._showTagList(e, f);}} (this, false);
    container.appendChild(CreateElement.createIcon('cbTagListClose', 'fas fa-caret-square-down commentbuddy-tagicon', 'hide tag list', handler));

    var taglistcontainer = CreateElement.createDiv('cbTagList', null);
    container.appendChild(taglistcontainer);
    
    var taglist = this._makeFullTagList(this._commentdata);
    for (var i = 0; i < taglist.length; i++) {
      var handler = function (me) { return function(e) {me._handleTagClick(e);}} (this);
      var tagcheckbox = CreateElement.createCheckbox(null, 'commentbuddy-taglist-item', 'cbTaglistGroup', taglist[i], taglist[i], false, handler);
      taglistcontainer.appendChild(tagcheckbox);
      taglistcontainer.appendChild(CreateElement.createBR());
    }
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
    var searchText = this._settings.searchstring;
    var tagsearchText = this._settings.tagstring;
    if (!container) {
      searchText = document.getElementById('cbSearchInput').value;
      tagsearchText = document.getElementById('cbSearchTags').value;
      container = document.getElementById('cbComments');
    }
    
    while (container.firstChild) container.removeChild(container.firstChild);
    
    var handler = function (me) { return function(e) {me._handleSelectChange(e);}} (this);
    var elemSelect = CreateElement.createSelect('cbSelectComment', null, handler);
    container.appendChild(elemSelect);
    handler = function (me) { return function(e) {me._handleSelectClick(e);}} (this);
    elemSelect.addEventListener('click', handler, false);
    elemSelect.size = 18;

    var selectedComments = this._filterComments(searchText, tagsearchText);
    for (var i = 0; i < selectedComments.length; i++) {
      var elemOption = CreateElement.createOption(null, null, i, selectedComments[i].comment);
      elemSelect.appendChild(elemOption);
      elemOption.title = selectedComments[i].hovertext;
    }

    if (this._settings.selectedcommentindex >= 0 && this._settings.selectedcommentindex < selectedComments.length) {
      elemSelect.selectedIndex = this._settings.selectedcommentindex;
    } else {
      this._settings.selectedcommentindex = -1;
      //this._storeSettings();
    }
  }
  
  //--------------------------------------------------------------------------
  // data processing
  //--------------------------------------------------------------------------  
  _makeFullTagList(commentlist) {
    var tagset = new Set();
    for (var i = 0; i < commentlist.length; i++) {
      var tagarray = this._makeTagArray(commentlist[i].tags);
      for (var j = 0; j < tagarray.length; j++) {
        tagset.add(tagarray[j]);
      }
    }
    
    return Array.from(tagset).sort();
  }
  
  _filterComments(searchText, tagsearchText) {
    var tagsearcharray = this._makeTagArray(tagsearchText);
    
    this._filteredComments = [];
    for (var i = 0; i < this._commentdata.length; i++) {
      var objComment = this._commentdata[i];
      if (objComment.comment.toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
        var tagset = this._makeTagSet(objComment.tags);
        var tagmatch = true;
        for (var j = 0; j < tagsearcharray.length && tagmatch; j++) {
          tagmatch = tagset.has(tagsearcharray[j]);
        }
        if (tagmatch) this._filteredComments.push(objComment);
      }
    }

    return this._filteredComments;
  }
  
  _checkSelectedTags() {
    var elemTagInput = document.getElementById('cbSearchTags');
    var checkboxes = document.getElementsByName('cbTaglistGroup');
    
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = false;
    }
    
    var tagarray = Array.from(this._makeTagSet(elemTagInput.value));
    for (var i = 0; i < tagarray.length; i++) {
      var tagvalue = tagarray[i];
      for (var j = 0; j < checkboxes.length; j++) {
        var tagcheckbox = checkboxes[j];
        if (tagcheckbox.value == tagvalue) {
          tagcheckbox.checked = true;
        }
      }
    }
  }
  
  _processSelectedTag(tagValue, tagSelected) {
    var elemTagInput = document.getElementById('cbSearchTags');
    var tagset = this._makeTagSet(elemTagInput.value);
    
    if (tagSelected) {
      tagset.add(tagValue);
    } else {
      tagset.delete(tagValue);
    }
    
    var tagstring = this._makeTagString(tagset);
    elemTagInput.value = tagstring;
  }
  
  _makeTagArray(tagtext) {
    var tagarray = tagtext.split(',');
    for (var i = 0; i < tagarray.length; i++) {
      tagarray[i] = tagarray[i].trim();
    }
    if (tagarray.length == 1 && tagarray[0] == '') tagarray = [];
    return tagarray;
  }
  
  _makeTagSet(tagtext) {
    return new Set(this._makeTagArray(tagtext));
  }
  
  _makeTagString(tagset) {
    var tagstring = '';

    var tagarray = [];
    tagset.forEach(function(value1, value2, set) {
      tagarray.push(value1);
    });
    
    tagarray = tagarray.sort();
    for (var i = 0; i < tagarray.length; i++) {
      if (i > 0) tagstring += ', ';
      tagstring += tagarray[i];
    }
    return tagstring;
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
  
  _handleSearchInput(e) {
    this._renderSelectedComments();
    this._storeSettings();
  }
  
  _handleTagSearchInput(e) {
    this._renderSelectedComments();
    this._storeSettings();
  }

  _showTagList(e, showlist) {
    var taglist = document.getElementById('cbTagList');
    var openicon = document.getElementById('cbTagListOpen');
    var closeicon = document.getElementById('cbTagListClose');
    var comments = document.getElementById('cbComments');
    var preview = document.getElementById('cbPreview');
    
    if (showlist) {
      taglist.style.display = 'block';
      openicon.style.display = 'none';
      closeicon.style.display = 'inline-block';
      comments.style.display = 'none';
      preview.style.display = 'none';
      this._checkSelectedTags();

    } else {
      taglist.style.display = 'none';
      openicon.style.display = 'inline-block';
      closeicon.style.display = 'none';
      comments.style.display = 'inline-block';
      preview.style.display = 'inline-block';
      this._renderSelectedComments();
    }

    document.getElementById('cbSearchTags').disabled = showlist;
  }
  
  _handleTagClick(e) {
    var tagvalue = e.target.value;
    var tagchecked = e.target.checked;
    
    this._processSelectedTag(tagvalue, tagchecked);
  }

  _handleSelectChange(e) {
    this._processSelectedComment(this._filteredComments[e.target.selectedIndex]);
    this._storeSettings();
  }
    
  _handleSelectClick(e) {
    this._processSelectedComment(this._filteredComments[e.target.parentNode.selectedIndex]);
    this._storeSettings();
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
}
