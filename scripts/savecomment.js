//-----------------------------------------------------------------------------------
// CommentBuddy Chrome extension save comment support page
//-----------------------------------------------------------------------------------
// TODO: refactor save comment to use new API
// TODO: test Chrome sync storage
//-----------------------------------------------------------------------------------

const app = function () {
  const PAGE_TITLE = 'Store new entry in CommentBuddy repository';
  
  const page = {};
  
  const settings = {};
  
  const storageKeys = {
    sheetid: 'cb2_fileid',
    sheeturl: 'cb2_fileurl',
    savecommenttext: 'cb2_savecommenttext'
  };
  
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
  
  const defaultPreviewText = '<span style="color: #777; font-style: italic">preview of formatted comment</span>';
    
  //---------------------------------------
  // get things going
  //----------------------------------------
  function init () {
    page.body = document.getElementsByTagName('body')[0];

    console.log('retrieval of pre-selected test is disabled');

    var loadparams = [
      {key: storageKeys.sheetid, resultfield: 'spreadsheetid', defaultval: null},
      {key: storageKeys.sheeturl, resultfield: 'spreadsheetlink', defaultval: null},
      {key: storageKeys.savecommenttext, resultfield: 'savecommenttext', defaultval: ''}
    ];
    _continue_init(null);
    
    /*-- disabled for local testing ---
    new ChromeSyncStorage().load(loadparams, function(result) {
      _continue_init(result);
    });    
    -----------------------------------*/
  }
  
  function _continue_init(loadresult) {
    //-- temp for local testing -----
    loadresult = {
      spreadsheetid: '1mo3e7xJdOYO4pVZ_6SrRlpROkuIgh_G0M4llM78olvM',
      spreadsheetlink: 'https://drive.google.com/open?id=1mo3e7xJdOYO4pVZ_6SrRlpROkuIgh_G0M4llM78olvM',
      savecommenttext: 'some text'
    };
    //-- end temp -------------------

    for (var key in loadresult) {
      settings[key] = loadresult[key];
    }
    
    page.body.appendChild(_renderPage());
    document.getElementById('commentInput').value = settings.savecommenttext;
    _renderPreviewComment();
  }
  
  //-----------------------------------------------------------------------------
  // page rendering
  //-----------------------------------------------------------------------------  
  function _renderPage() {
    var contents = CreateElement.createDiv('contents', null);
    page.contents = contents;
    
    contents.appendChild(_renderTitle());
    if (settings.spreadsheetid == '' || settings.spreadsheetid == null) {
      contents.appendChild(CreateElement.createDiv(null, null, 'The spreadsheet file ID has not been set for CommentBuddy yet.<br>Please use the configure option in CB to set it first.'));
    } else {
      contents.appendChild(_renderContent());
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
    container.appendChild(_renderPreviewSection());
    container.appendChild(_renderHoverTextSection());
    container.appendChild(_renderControlsSection());

    return container;
  }
  
  function _renderRepositoryLink() {
    var container = CreateElement.createDiv(null, 'content-section');
    
    container.appendChild(CreateElement.createDiv(null, 'label', 'repository'));
    
    var repoLink = CreateElement.createLink(null, null, settings.spreadsheetlink, 'open comment repository spreadsheet', settings.spreadsheetlink);
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
    commentTextArea.cols = 72;
    commentTextArea.addEventListener('input', _handleCommentInputChange, false)
        
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

  function _renderPreviewSection() {
    var container = CreateElement.createDiv(null, 'content-section');
    
    container.appendChild(CreateElement.createDiv(null, 'label', 'preview'));
    
    container.appendChild(CreateElement.createDiv('previewOutput', null, defaultPreviewText));
    
    return container;
  }

  function _renderHoverTextSection() {
    var container = CreateElement.createDiv(null, 'content-section');

    container.appendChild(CreateElement.createDiv(null, 'label', 'hover text'));
  
    var hovertextInput = CreateElement.createTextInput('hovertextInput', 'user-input');
    container.appendChild(hovertextInput);
    hovertextInput.maxlength = 200;
    hovertextInput.placeholder = 'optional hover text...';
    hovertextInput.title = 'hover text displayed when selecting in CommentBuddy (optional)';
   
    return container;
  }
  
  function _renderControlsSection() {
    var container = CreateElement.createDiv(null, 'content-section');
    
    container.appendChild(CreateElement.createButton('saveButton', null, 'save', 'save comment in repository', _handleSaveButton));
    
    return container;
  }

  //------------------------------------------------------------------
  // UI routines
  //------------------------------------------------------------------
  function _renderPreviewComment() {
    var commentInput = document.getElementById('commentInput');
    var previewOutput = document.getElementById('previewOutput');
    
    var commentText = commentInput.value;
    if (commentText == '') commentText = defaultPreviewText;
    
    previewOutput.innerHTML = MarkdownToHTML.convert(commentText);
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
  function _handleCommentInputChange() {
    _renderPreviewComment();
  }

  function _handleShowSampleComments() {
    _setFormattingSectionVisibility(true);
  }

  function _handleHideSampleComments() {
    _setFormattingSectionVisibility(false);
  }
  
  function _handleSaveButton() {
    console.log('save');
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
