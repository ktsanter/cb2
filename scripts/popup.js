"use strict";
//-----------------------------------------------------------------------------------
// CommentBuddy Chrome extension popup
//-----------------------------------------------------------------------------------
// TODO: 
//-----------------------------------------------------------------------------------

const app = function () {
	const page = { 
    commentbuddy: null,
    initialized: false,
    reconfigureUI: null
  };
  
  const settings = {
    appName: 'CommentBuddy',
    composeAndShowURL: 'savecomment.html',
    helpURL: 'help.html',
    configparams: null,
    commentbuddy: null,
    usetimer: false
  };

  const apiInfo = {
    apibase: 'https://script.google.com/macros/s/AKfycbxgZL5JLJhR-6jWqbxb3s7aWG5aqkb-EDENYyIdnBT4vVpKHq8/exec',
    apikey: 'MV_commentbuddy2'
  };
        
  const storageKeys = {
    sheetid: 'cb2_fileid',
    sheeturl: 'cb2_fileurl'
  };

	//---------------------------------------
	// get things going
	//----------------------------------------
  function init() {
		page.body = document.getElementsByTagName('body')[0];

    page.body.minWidth = '30em';    
    page.notice = new StandardNotice(page.body, page.body);
    
    var loadparams = [
      {key: storageKeys.sheetid, resultfield: 'spreadsheetid', defaultval: null},
      {key: storageKeys.sheeturl, resultfield: 'spreadsheetlink', defaultval: null}
    ];
    
    new ChromeSyncStorage().load(loadparams, function(result) {
      _continue_init(result);
    });    
  }

  function _continue_init(loadresult) {
    settings.configparams = {};
    for (var key in loadresult) {
      settings.configparams[key] = loadresult[key];
    }
    
    settings.commentbuddy = new CommentBuddy();

    if (settings.configparams.hasOwnProperty('spreadsheetid') && settings.configparams.spreadsheetid != '') {
      _configureAndRender();
    } else {
      page.notice.setNotice('');  
      _renderReconfigureUI();
    }
	}

  //-------------------------------------------------------------------------------------
  // CommentBuddy configuration functions
  //-------------------------------------------------------------------------------------
  async function _configureAndRender() {
    var commentbuddy = settings.commentbuddy;
    
    page.notice.setNotice('loading...', true  );
    page.notice.hideError();
    settings.retrieveddata = await _getCommentData();
    
    if (!settings.usetimer) page.notice.setNotice('');
 
    if (page.commentbuddy != null && settings.initialized) {
      page.body.removeChild(page.commentbuddy);
    }
    settings.initialized = false;

    if (settings.retrieveddata == null) {
      page.notice.setNotice('unable to load data');
      page.notice.hideError();
    } else {
      commentbuddy.init(_makeParams(), _finishConfigureAndRender);
    }
 }
  
  function _finishConfigureAndRender() {
    page.commentbuddy = settings.commentbuddy.renderMe();
    page.body.appendChild(page.commentbuddy);
    settings.initialized = true;
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
        _renderReconfigureUI();
      }
    }
    
    return result;
  }

  function _makeParams() {
    var params = null;
        
    if (settings.retrieveddata != null) { 
      params = {
        title: settings.appName,
        version: chrome.runtime.getManifest().version,
        commentdata: settings.retrieveddata,
        callbacks: {
          menu: [
            {label: 'configure', callback: _configCallback},
            {label: 'open data source', callback: _openSourceSpreadsheetCallback},
            {label: 'compose and save new comment', callback: _showComposeAndSavePage},
            {label: 'help', callback: _showHelp}
          ]
        }
      };
    } 
    
    return params;
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
  
  function _showComposeAndSavePage() {
    settings.commentbuddy._storeSettings();
    window.open(settings.composeAndShowURL, '_blank');
  }
    
  function _showHelp() {
    window.open(settings.helpURL, '_blank');
  }
  
	//-----------------------------------------------------------------------------
	// reconfigure dialog
	//-----------------------------------------------------------------------------   
  function _renderReconfigureUI() {
    page.body.style.height = '5.5em';
    if (settings.initialized) settings.commentbuddy.hideMe()
    
    page.reconfigureUI = CreateElement.createDiv('reconfigureUI', 'reconfigure');
    page.body.appendChild(page.reconfigureUI);  
  
    var container = CreateElement.createDiv(null, 'reconfigure-title');
    page.reconfigureUI.appendChild(container);
    
    container.appendChild(CreateElement.createDiv(null, 'reconfigure-title-label', 'CommentBuddy - configure spreadsheet link'));   
    container.appendChild(CreateElement.createIcon(null, 'fa fa-check reconfigure-icon', 'save changes', _completeReconfigure));
    if (settings.initialized) {
      container.appendChild(CreateElement.createIcon(null, 'fas fa-times reconfigure-icon', 'discard changes', _cancelReconfigure));
    }

    container = CreateElement.createDiv(null, 'reconfigure-item');
    page.reconfigureUI.appendChild(container);

    var configinput = CreateElement.createTextInput('spreadsheetLink', 'reconfigure-input', settings.configparams.spreadsheetlink)
    container.appendChild(configinput);
    configinput.title = 'enter shared link for CommentBuddy repository spreadsheet';
  }
  
  function _endReconfigure(saveNewConfiguration) { 
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
      _storeConfigurationParameters();
      _configureAndRender();
      page.body.removeChild(page.reconfigureUI);
      page.reconfigureUI = null;
      
    } else {
      page.body.removeChild(page.reconfigureUI);
      page.reconfigureUI = null;
      if (settings.initialized) settings.commentbuddy.showMe();
    }
    
    page.body.style.height = '44em';
  }
  
  function _storeConfigurationParameters() {
    var savekeys = [];
    savekeys.push({key: storageKeys.sheetid, value: settings.configparams.spreadsheetid});
    savekeys.push({key: storageKeys.sheeturl, value: settings.configparams.spreadsheetlink});

    new ChromeSyncStorage().store(savekeys);
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
