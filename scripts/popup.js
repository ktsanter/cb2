"use strict";
//-----------------------------------------------------------------------------------
// CommentBuddy Chrome extension popup
//-----------------------------------------------------------------------------------
// TODO: 
//-----------------------------------------------------------------------------------

const app = function () {
	const page = { 
    commentbuddy: null,
    commentbuddyinitialized: false,
    reconfigureUI: null
  };
  
  const settings = {
    appName: 'CommentBuddy',
    helpURL: 'https://ktsanter.github.io/commentbuddy/',
    configparams: null,
    commentbuddy: null,
    usetimer: false
  };

  const apiInfo = {
    apibase: 'https://script.google.com/macros/s/AKfycbxgZL5JLJhR-6jWqbxb3s7aWG5aqkb-EDENYyIdnBT4vVpKHq8/exec',
    apikey: 'MV_commentbuddy2'
  };
        
	//---------------------------------------
	// get things going
	//----------------------------------------
  function init() {
		page.body = document.getElementsByTagName('body')[0];

    page.body.minWidth = '30em';    
    page.notice = new StandardNotice(page.body, page.body);
    _getConfigurationParameters(_continue_init);
  }
  
  async function _continue_init() {
    settings.commentbuddy = new CommentBuddy();

    if (settings.configparams.hasOwnProperty('spreadsheetid') && settings.configparams.spreadsheetid != '') {
      _configureAndRender(settings.commentbuddy);
    } else {
      page.notice.setNotice('');  
      _renderReconfigureUI();
    }
	}
  
  //-------------------------------------------------------------------------------------
  // use chrome.storage to get and set configuration parameters
  //-------------------------------------------------------------------------------------
  const storageKeys = {
    sheetid: 'cb2_fileid',
    sheeturl: 'cb2_fileurl'
  };
    
  function _getConfigurationParameters(callback) {        
    chrome.storage.sync.get( [storageKeys.sheetid, storageKeys.sheeturl],  function (result) {
      var configParams = {
        spreadsheetid: '',
        spreadsheetlink: ''
      };

      if (typeof result[storageKeys.sheetid] != 'undefined') {
        configParams.spreadsheetid = result[storageKeys.sheetid];
      }
      if (typeof result[storageKeys.sheeturl] != 'undefined') {
        configParams.spreadsheetlink = result[storageKeys.sheeturl];
      }        
      
      settings.configparams = configParams;
      callback();
    });
  }
  
  function _storeConfigurationParameters(callback) {
    var savekeys = {};
    savekeys[ storageKeys.sheetid ] = settings.configparams.spreadsheetid;
    savekeys[ storageKeys.sheeturl ] = settings.configparams.spreadsheetlink

    chrome.storage.sync.set(savekeys, function() {
      if (callback != null) callback;
    });
  }

  //-------------------------------------------------------------------------------------
  // CommentBuddy configuration functions
  //-------------------------------------------------------------------------------------
  async function _configureAndRender(commentbuddy) { 
    page.notice.setNotice('loading...', true  );
    settings.studentandlayoutdata = await _getCommentData();
    console.log('data=' + JSON.stringify(settings.studentandlayoutdata));
    if (!settings.usetimer) page.notice.setNotice('');
 
    if (page.commentbuddy != null && settings.commentbuddyinitialized) {
      page.body.removeChild(page.commentbuddy);
    }
    settings.commentbuddyinitialized = false;

    commentbuddy.init(_makeParams());
    page.commentbuddy = commentbuddy.renderMe();
    page.body.appendChild(page.commentbuddy);
    settings.commentbuddyinitialized = true;
    //document.getElementById('selectControl').focus(); // this should probably be generalized
  }
  
  async function _getCommentData() {
    var result = null;
    
    if (settings.configparams != null) {
      if (settings.usetimer) var startTime = new Date();
      
      var params = {sourcefileid: settings.configparams.spreadsheetid};
      var requestResult  = await googleSheetWebAPI.webAppGet(apiInfo, 'cbdata', params, page.notice);
      
      if (requestResult.success) {
        if (settings.usetimer) var elapsedTime = new Date() - startTime;
        if (settings.usetimer) page.notice.setNotice(elapsedTime/1000.0);
        result = requestResult.data;
        
      } else {
        console.log('ERROR: in _getCommentData' );
        console.log(requestResult.details);
      }
    }
    
    return result;
  }

  function _makeParams(studendAndLayoutData) {
    var params = null;
        
    if (settings.studentandlayoutdata != null) { 
      var indexfield = _findIndexField(settings.studentandlayoutdata);
      
      params = {
        title: settings.appName,
        version: chrome.runtime.getManifest().version,
        callbacks: {
          menu: [
            {label: 'configure', callback: _configCallback},
            {label: 'open data source', callback: _openSourceSpreadsheetCallback},
            {label: 'help', callback: _showHelp}
          ]
        }
      };
    } 
    
    return params;
  }
  
  function _findIndexField(data) {
    var fields = data.layoutinfo.fields;
    var indexFieldKey = null;
    
    for (var key in fields) {
      var field = fields[key];
      if (field.fieldtype == 'index') indexFieldKey = key;
    }
    
    return indexFieldKey;    
  }
  
  function _makeIndexList(indexfield, data) {
    var indexlistWithDupes = [];
    for (var i = 0; i < data.length; i++) {
      indexlistWithDupes.push(data[i][indexfield])
    }
    
    var indexList = Array.from(new Set(indexlistWithDupes));
    return indexList.sort();
  }
  
  function _makeFieldTypeParams(layout) {
    var fieldtypes = {};
    var fields = layout.fields;
    for (var key in fields) {
      fieldtypes[key] = fields[key].fieldtype;
    }
    return fieldtypes;
  }
  
  //-------------------------------------------------------------------------------------
  // callback functions
  //-------------------------------------------------------------------------------------
  function _configCallback() {
    _renderReconfigureUI();
  }
  
  function _openSourceSpreadsheetCallback() {
    window.open(settings.configparams.spreadsheetlink, '_blank');
  }
    
  function _showHelp() {
    window.open(settings.helpURL, '_blank');
  }
  
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------   
  function _renderReconfigureUI() {
    if (settings.commentbuddyinitialized) settings.commentbuddy.hideMe()
    
    page.reconfigureUI = CreateElement.createDiv('reconfigureUI', 'reconfigure');
    page.body.appendChild(page.reconfigureUI);  
  
    var container = CreateElement.createDiv(null, 'reconfigure-title');
    page.reconfigureUI.appendChild(container);
    
    container.appendChild(CreateElement.createDiv(null, 'reconfigure-title-label', 'spreadsheet embed link'));   
    container.appendChild(CreateElement.createIcon(null, 'fa fa-check fa-lg reconfigure-icon', 'save changes', _completeReconfigure));
    if (settings.commentbuddyinitialized) {
      container.appendChild(CreateElement.createIcon(null, 'fas fa-times fa-lg reconfigure-icon', 'discard changes', _cancelReconfigure));
    }

    container = CreateElement.createDiv(null, 'reconfigure-item');
    page.reconfigureUI.appendChild(container);

    container.appendChild(CreateElement.createTextInput('spreadsheetLink', 'reconfigure-input', settings.configparams.spreadsheetlink));
  }
  
  async function _endReconfigure(saveNewConfiguration) { 
    if (saveNewConfiguration) {
      var userEntry = document.getElementById('spreadsheetLink').value;

      var sID = userEntry.match(/\?id=([a-zA-Z0-9-_]+)/);
      if (sID == null) {
        sID = '';
      } else {
        sID = sID[0].slice(4);
      }

      settings.configparams.spreadsheetlink = userEntry;
      settings.configparams.spreadsheetid = sID;
      _storeConfigurationParameters(null);
      _configureAndRender(settings.commentbuddy);
      page.body.removeChild(page.reconfigureUI);
      page.reconfigureUI = null;
      
    } else {
      page.body.removeChild(page.reconfigureUI);
      page.reconfigureUI = null;
      if (settings.commentbuddyinitialized) settings.commentbuddy.showMe();
      page.notice.setNotice('');
    }
  }
    
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------
  function _completeReconfigure() {
    _endReconfigure(true);
  }
  
  function _cancelReconfigure() {
    _endReconfigure(false);
  }
    
	//---------------------------------------
	// utility functions
	//----------------------------------------

	//---------------------------------------
	// return from wrapper function
	//----------------------------------------
	return {
		init: init
 	};
}();
