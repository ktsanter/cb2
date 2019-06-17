// on install/update of extension create a right-click menu item

//chrome.runtime.onInstalled.addListener(addContextMenuOption);
//chrome.runtime.onStartup.addListener(addContextMenuOption);
addContextMenuOption();

function addContextMenuOption() {
  chrome.contextMenus.create({
    title: 'add selected text to CommentBuddy repository', 
    contexts:["selection"], 
    onclick: contextMenuHandler
  });
}

// handler for context menu selection
function contextMenuHandler(e) {
  addSelectedTextToRepository(e.selectionText);
}

// open save comment page with specified text preloaded
function addSelectedTextToRepository(saveText) {
  chrome.storage.sync.set({"cb2_savecommenttext": saveText}, function() {
    chrome.tabs.create({url: "savecomment.html"});
  });
}

// handler for keyboard shortcut 
chrome.commands.onCommand.addListener(function(command) {
  addSelectedTextToRepository('');
});
