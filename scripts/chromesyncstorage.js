//-------------------------------------------------------------------------------------
// wrapper class for Chrome sync storage
//-------------------------------------------------------------------------------------
class ChromeSyncStorage {
  constructor() {}
  
  //-----------------------------------------------------------------------------------
  // load:
  //   params: [ {key: xxx, resultfield: xxx, defaultval: xxx}, ... } where defaultval is optional
  //   callback: optional callback function
  //-----------------------------------------------------------------------------------
  load(params, callback) {
    var result = {};
    var resultmap = {};
    var loadkeys = [];
    
    for (var i = 0;  i < params.length; i++) {
      var key = params[i].key;
      var resultfield = params[i].resultfield;
      var defaultval = params[i].defaultval ? params[i].defaultval : null;
      
      result[ resultfield ] = defaultval;
      resultmap[ key ] = resultfield;
      loadkeys.push( key );
    }
    
    chrome.storage.sync.get(loadkeys, function (loadresult) {
      for (var key in loadresult) {
        if (typeof loadresult[key] != 'undefined') result[ resultmap[key] ] = loadresult[key];
      }
      
      if (callback != null) callback(result);
    });
   }
  
  //-----------------------------------------------------------------------------------
  // store:
  //   params: { key: {value: xxx}, ... }
  //   callback: optional callback function
  //-----------------------------------------------------------------------------------
  store(params, callback) {
    var storagevals = {};
    for (var key in params) {
      storagevals[key] = params[key].value;
    }
    
    chrome.storage.sync.set(storagevals, function() {
      if (callback != null) callback();
    });
  }
}
