//
// TODO: add MarkDown quick reference link or popup
//

const app = function () {
  const PAGE_TITLE = 'Store new entry in CommentBuddy repository';
  
  const UP_ARROW = '&#9650;'; //'&#11181;';
  const DOWN_ARROW = '&#9660;'; //'&#11183;';
  
  const page = {};
  
  const settings = {};
  
  var markdownReferenceItems = [
    '*italics*',
    '**bold**',
    '%%highlight%%',
    '~~strikethrough~~',
    'x^^2^^\n\nx^^^i^^^',
    'this is an `inline code` example',
    '- first item\n\n- second item',
    '1. first item\n\n2. second item',
    'an [inline link](https://www.google.com "go to google.com")',
    '![alt text](http://bit.ly/2D1Hodh "I am a smiley face")',
    '# this is H1\n\n## this is H2\n\n### this is H3\n\n#### this is H4\n\n##### this is H5'
  ];
    
  //---------------------------------------
  // get things going
  //----------------------------------------
  function init () {
    page.body = document.getElementsByTagName('body')[0];
    _retrieveSettings(_finishInit);
  }
  
  function _finishInit() {
    page.body.appendChild(_renderPage());
  }
  
  function _retrieveSettings(callback) {
    console.log('retrieval of pre-selected test is disabled');
    settings.fileid = '1mo3e7xJdOYO4pVZ_6SrRlpROkuIgh_G0M4llM78olvM';
    settings.fileurl = 'https://drive.google.com/open?id=1mo3e7xJdOYO4pVZ_6SrRlpROkuIgh_G0M4llM78olvM';
    settings.newcommenttext = '';
    callback();
    /*
    chrome.storage.sync.get(['cbSpreadsheetFileId', 'cbCommentText'], function(result) {
      var fileIdString = '';
      var newCommentText = '';

      if (typeof result.cbSpreadsheetFileId != 'undefined') {
        fileIdString = result.cbSpreadsheetFileId;
      }
      if (typeof result.cbCommentText != 'undefined') {
        newCommentText = _sanitizeComment(result.cbCommentText);
      }
      
      settings.fileid = fileIdString;
      settings.newcommenttext = newCommentText;

      callback();
    });
    */
  }
  
  function _sanitizeComment(orig) {
    var sanitized = orig.replace(/[\u00A0]/g,' ');  // nbsp character
    
    return sanitized;
  }
  
  //-----------------------------------------------------------------------------
  // page rendering
  //-----------------------------------------------------------------------------  
  function _renderPage() {
    var contents = CreateElement.createDiv('contents', null);
    page.contents = contents;
    
    contents.appendChild(_renderTitle());
    if (settings.fileid == '' || settings.fileid == null) {
      contents.appendChild(CreateElement.createDiv(
        null, 
        null, 
        'The spreadsheet file ID has not been set for CommentBuddy yet.<br>Please use the configure option in CB to set it first.'
      ));
      
    } else {
      contents.appendChild(_renderContent());
      _addHandlers();
    }
    
    return contents;
  }
  
  function _renderTitle() {
    return CreateElement.createDiv(null, 'title', PAGE_TITLE);
  }
    
  function _renderContent() {
    var container = CreateElement.createDiv(null, null);

    container.appendChild(_renderRepositoryLink()); 
    container.appendChild(_renderTagSection());
    container.appendChild(_renderCommentSection());
    container.appendChild(_renderFormattingReference());
    
    /*
    elemTable.appendChild(_renderCommentPreview());
    elemTable.appendChild(_renderHoverText());
    elemTable.appendChild(_renderControls());
    
    container.appendChild(elemTable);
    */
    return container;
  }
  
  function _renderRepositoryLink() {
    var container = CreateElement.createDiv(null, 'content-section');
    
    container.appendChild(CreateElement.createDiv(null, 'label', 'repository'));
    
    var repoLink = CreateElement.createLink(null, null, settings.fileurl, 'open comment repository spreadsheet', settings.fileurl);
    container.appendChild(repoLink);
    repoLink.target = '_blank';
    
    return container;
  }
  
  function _renderTagSection() {
    var container = CreateElement.createDiv(null, 'content-section');
    
    container.appendChild(CreateElement.createDiv(null, 'label', 'tags'));
    
    var tagInput = CreateElement.createTextInput('tagInput', 'user-input');
    container.appendChild(tagInput);
    tagInput.maxlength = 200;
    tagInput.placeholder = 'tag1, tag2, ...';
    tagInput.title = 'one or more tags for looking up comment';
    
    return container;
  }
    
  function _renderCommentSection() {
    var container = CreateElement.createDiv(null, 'content-section');
    
    var commentLabel = CreateElement.createDiv(null, 'label', 'comment');
    container.appendChild(commentLabel);
    commentLabel.appendChild(CreateElement.createIcon('showSampleComments', 'comment-icon far fa-caret-square-down', 'show formatting reference info', _handleShowSampleComments));
    commentLabel.appendChild(CreateElement.createIcon('hideSampleComments', 'comment-icon far fa-caret-square-up', 'show formatting reference info', _handleHideSampleComments));
    
    var commentTextArea = CreateElement.createTextArea('commentInput', null);
    container.appendChild(commentTextArea);
    commentTextArea.rows = 14;
    commentTextArea.cols = 80;
    //commentTextArea.innerHTML = whatever the retrieved new comment text is
        
    return container;
  }
  
  function _renderFormattingReference() {
    var container = CreateElement.createDiv('referenceSection', 'content-section');
    
    container.appendChild(CreateElement.createDiv(null, 'label', 'reference'));
    
    var tableContainer = CreateElement.createDiv('referenceContainer', null);
    container.appendChild(tableContainer);
    
    var table = CreateElement.createTable(null, null);
    tableContainer.appendChild(table);
    
    var thead = CreateElement._createElement('thead', null, null);
    table.appendChild(thead);
    var row = CreateElement.createTableRow(null, null, thead)
    CreateElement.createTableCell(null, null, 'unformatted', true, row);
    CreateElement.createTableCell(null, null, 'formatted', true, row);
    
    var tbody = CreateElement._createElement('tbody', null, null);
    table.appendChild(tbody);
    for (var i = 0; i < markdownReferenceItems.length; i++) {
      var item = markdownReferenceItems[i];
      row = CreateElement.createTableRow(null, null, tbody);
      CreateElement.createTableCell(null, null, item, false, row);
      CreateElement.createTableCell(null, null, MarkdownToHTML.convert(item), false, row);
    }
      
    return container;
  }

  function _renderHoverText() {
    var elemContainer = document.createElement('tr');   
    var elemCell1 = document.createElement('td');
    var elemCell2 = document.createElement('td');
    
    elemCell1.classList.add('label');

    var elemLabel = document.createElement('span');
    elemLabel.innerHTML = 'hover text';
    elemLabel.title = 'hover text displayed when selecting in CommentBuddy';
    elemCell1.appendChild(elemLabel);

    var elemVal = document.createElement('input');
    elemVal.type = 'text';
    elemVal.classList.add('user-input');
    elemVal.style.width = '100%';
    elemVal.maxlength = 200;
    elemVal.placeholder = 'optional hover text...';
    elemVal.innerHTML = settings.hovertext;
    elemCell2.appendChild(elemVal);
    
    elemContainer.appendChild(elemCell1);
    elemContainer.appendChild(elemCell2);
    
    page.hovertext = elemVal;
    
    return elemContainer;
  }

  function _renderCommentPreview() {
    var elemContainer = document.createElement('tr');   
    var elemCell1 = document.createElement('td');
    var elemCell2 = document.createElement('td');

    elemCell1.classList.add('label');

    var elemLabel = document.createElement('span');
    var elemLabel = document.createElement('span');
    elemLabel.innerHTML = 'preview ';
    elemLabel.title = 'comment after formatting';
    elemCell1.appendChild(elemLabel);
    
    var elemVal = document.createElement('div');
    elemVal.classList.add('noneditable');
    _previewComment(elemVal, settings.newcommenttext);
    elemCell2.appendChild(elemVal);
    
    elemContainer.appendChild(elemCell1);
    elemContainer.appendChild(elemCell2);
    
    page.previewcomment = elemVal;
    
    return elemContainer;
  }
  
  function _renderControls() {
    var elemContainer = document.createElement('tr');
    
    var elemCell1 = document.createElement('td');
    var elemCell2 = document.createElement('td');
    
    var elemButton = document.createElement('button');
    elemButton.classList.add('control-button');
    elemButton.innerHTML = 'save';
    elemButton.title = 'save comment in repository';
    elemCell1.appendChild(elemButton);
    
    var elemStatus = document.createElement('span');
    elemStatus.classList.add('status');
    elemStatus.innerHTML = '';
    elemCell2.appendChild(elemStatus);
        
    elemContainer.appendChild(elemCell1);
    elemContainer.appendChild(elemCell2);
    
    page.savebutton = elemButton;
    page.statusmsg = elemStatus;
    
    return elemContainer;
  }
  
  
  function _renderMarkdownReferenceItem(unformatted) {
    var elemRow = document.createElement('tr');
    var elemUnformatted = document.createElement('td');
    var elemFormatted = document.createElement('td');
    
    elemUnformatted.classList.add('table-borders');
    elemFormatted.classList.add('table-borders');
    
    elemUnformatted.innerHTML = unformatted.replace(/\n\n/g, '<br>');
    elemFormatted.innerHTML = MarkdownToHTML.convert(unformatted);
    
    elemRow.appendChild(elemUnformatted);
    elemRow.appendChild(elemFormatted);
    
    return elemRow;
  }
  
  function _addHandlers() {
    /*
    page.tags.addEventListener('input', _handleTagsChange, false);
    page.newcomment.addEventListener('input', _handleCommentChange, false);
    page.mdrefbutton.addEventListener('click', _handleMarkdownRefClick, false);
    page.hovertext.addEventListener('input', _handleHoverTextChange, false);
    page.savebutton.addEventListener('click', _handleSaveClick, false);
    */
  }

  //------------------------------------------------------------------
  // UI routines
  //------------------------------------------------------------------
  function _previewComment(elem, commentText) {
    elem.innerHTML = MarkdownToHTML.convert(commentText);
  }
  
  function _saveComment() {
    page.savebutton.disabled = true;
    _setStatusMessage('saving comment...');
    _putNewComment(settings.fileid, page.tags.value, page.newcomment.value, page.hovertext.value, _saveComplete);
  }
  
  function _saveComplete(result) {
    if (result.success) {
      console.log('save success');
      page.statusmsg.innerHTML = 'comment saved successfully';
    } else {
      console.log('save fail');
      page.statusmsg.innerHTML = 'comment save failed: ' + result.err;
    }
    page.savebutton.disabled = false;
  }
  
  function _setStatusMessage(msg) {
    page.statusmsg.innerHTML = msg;
  }
  
  function _clearStatusMessage() {
    page.statusmsg.innerHTML = '';
  }
  
  function _toggleMarkdownRefVisibility() {
    var elem = page.markdownreference;
    
    if (elem.classList.contains('hide-me')) {
      elem.classList.remove('hide-me');
      elem.classList.add('show-me');
      page.mdrefbutton.innerHTML = UP_ARROW;
      page.mdrefbutton.title = 'hide formatting reference info';
      
    } else if (elem.classList.contains('show-me')) {
      elem.classList.remove('show-me');
      elem.classList.add('hide-me');
      page.mdrefbutton.innerHTML = DOWN_ARROW;
      page.mdrefbutton.title = 'show formatting reference info';
    }
  }
  
  function _setFormattingSectionVisibility(setVisible) {
    var showbutton = document.getElementById('showSampleComments');
    var hidebutton = document.getElementById('hideSampleComments');
    var referencesection = document.getElementById('referenceSection');
    
    if (setVisible) {
      showbutton.style.display = 'none';
      hidebutton.style.display = 'inline-block';
      referencesection.style.display = 'block';
    } else {
      showbutton.style.display = 'inline-block';
      hidebutton.style.display = 'none';
      referencesection.style.display = 'none';
    }
  }
  
  //------------------------------------------------------------------
  // handlers
  //------------------------------------------------------------------
  function _handleShowSampleComments() {
    _setFormattingSectionVisibility(true);
  }

  function _handleHideSampleComments() {
    _setFormattingSectionVisibility(false);
  }
  
  //--------------------------------------------------------------
  // use Google Sheet web API to save new comment
  //--------------------------------------------------------------
  const API_BASE = 'https://script.google.com/a/mivu.org/macros/s/AKfycbzslpRyJsncJoufxogGhjSHB5bnQov_2flD3hPDryYNCHnH-VkX/exec';
  const API_KEY = 'MVcommentbuddyAPI';
  
  function _putNewComment (fileid, tags, comment, hovertext, callback) {
    //console.log('posting new comment...');

    var postData = {
      "destfileid": fileid,
      "tags": tags,
      "comment": comment,
      "hovertext": hovertext
    };
    
    fetch(_buildApiUrl('comment'), {
        method: 'post',
        contentType: 'application/x-www-form-urlencoded',
        body: JSON.stringify(postData)
      })
      .then((response) => response.json())
      .then((json) => callback({"success": true}))
      .catch((error) => {
        callback({"success": false, "err": error});
        console.log(error);
      })
  }

  function _buildApiUrl (datasetname, params) {
    let url = API_BASE;
    url += '?key=' + API_KEY;
    url += datasetname && datasetname !== null ? '&dataset=' + datasetname : '';

    for (var param in params) {
      url += '&' + param + '=' + params[param].replace(/ /g, '%20');
    }

    //console.log('buildApiUrl: url=' + url);
    
    return url;
  }
  //---------------------------------------
  // utility functions
  //----------------------------------------

  //---------------------------------------
  // return from init
  //----------------------------------------
  return {
    init: init
   };
}();

