var _debug = false;

contextMenuCallbacks = {};

function message(command, args) {
  return {
    command: command,
    args: args
  };
}

function inputChanged(text, suggest) {
  // suggest([
  //   {
  //     content: "this is a test",
  //     description: "test"
  //   }
  // ]);
}

function createFormUrlEncodedContent(keyValuePairs) {
  var content = [];

  for(var key in keyValuePairs) {
    var value = keyValuePairs[key];

    content.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
  }

  return content.join("&");
}

function buildSubmitFormCode(formID, formFieldID, text){
  var code = "submitForm('{0}', '{1}', '{2}');";
  code = code.replace(/\{0\}/, formID)
  .replace(/\{1\}/, formFieldID)
  .replace(/\{2\}/, text);

  return code;
}

function handleBadRequest() {
  return;
}

function processRequestText(text) {
  if(_debug) {
    return {
      keyword: "pepdir",
      search: text
    };
  }

  var keyword = text.split(' ')[0];
  var search = text.split(' ')[1];

  if(!keyword || !search) {
    return null;
  }

  return {
    keyword: keyword,
    search: search
  };
}

function handleBadKeyword() {
  return;
}

function getFormInfo(keyword, callback) {
  if(_debug) {
    return {
      url: "https://community.pepperdine.edu/directory/employees/default.htm",
      fieldID: "results",
      formID: "frmDirectory"
    };
  }

  chrome.runtime.lastError = null;
  chrome.storage.sync.get("keywords", function(item) {
    var data = item["keywords"];

    var formInfo = findExistingKeyword(data, keyword);
    if(!formInfo) {
      handleBadKeyword();
    }

    callback(formInfo);
  });
}

function handleMissingKeywordSearchRequest(request) {
  console.log("No search defined for keyword: %s", request.keyword);
}

function runSearch(request) {
  getFormInfo(request.keyword, function(formInfo) {
    if(formInfo) {
      chrome.tabs.create({
        url: formInfo.url,
        active: true
      },
      function(tab) {
        chrome.tabs.executeScript(tab.id, {
          file: "submitForm.js",
          runAt: "document_idle"
        },
        function(results) {
          chrome.tabs.executeScript(tab.id, {
            code: buildSubmitFormCode(formInfo.formID, formInfo.fieldID, request.search)
          });
        });
      });
    }else{
      handleMissingKeywordSearchRequest(request);
    }
  });
}

function inputEntered(text) {
  console.log("User entered: %O", text);

  var request = processRequestText(text);

  if(request) {
    runSearch(request);
  }else{
    handleBadRequest();
  }
}

function handleContextMenuClicked(info, tab) {
  contextMenuCallbacks[info.menuItemId](info, tab);
}

function findExistingKeyword(keywords, findKey) {
  for(var key in keywords) {
    var keyword = keywords[key];

    if(keyword.keyword == findKey) {
      return keyword;
    }
  }

  return null;
}

function createContextMenuItems() {
  function createMenuItem(type, id, parent, title, onclick) {
    var returnedID = chrome.contextMenus.create({
      type: type,
      id: id,
      title: title,
      contexts: ["editable"]
    });

    console.log("hello from createMenuItem! %O", id);

    contextMenuCallbacks[returnedID] = onclick;
  }

  function createRootMenu() {
    createMenuItem("normal", "root", null, "Save Form", function(info, tab) {
      if(info.editable) {
        console.log("I'm editable!");

        chrome.tabs.sendMessage(tab.id, new message("createFormField", null), null, function(response) {
          var formInfo = response.value;
          var key = formInfo.keyword;

          if(key) {
            chrome.storage.sync.get("keywords", function(keywords) {
              var allKeywords = keywords.keywords;

              if(!(allKeywords instanceof Array)) {
                allKeywords = [];
              }

              var existingKeyword = findExistingKeyword(allKeywords, key);

              if(!existingKeyword) {
                allKeywords.push(formInfo);

                chrome.storage.sync.set({"keywords": allKeywords}, function(result) {

                });
              }else{
                handleDuplicateKeyCreateRequest();
              }
            });
          }else{
            handleNullKeyCreateRequest();
          }
        });
      }
    });
  }

  chrome.contextMenus.removeAll(function() {
    createRootMenu();
  });
}

function handleNullKeyCreateRequest() {
  console.log("Invalid key entered");
}

function handleDuplicateKeyCreateRequest() {
  console.log("Key already exists!");
}

function createEventHandlers() {
  chrome.omnibox.onInputChanged.addListener(inputChanged);
  chrome.omnibox.onInputEntered.addListener(inputEntered);

  chrome.contextMenus.onClicked.addListener(handleContextMenuClicked);
}

(function init() {
  createEventHandlers();
  createContextMenuItems();

  chrome.storage.sync.get(null, function(allItems) {
    console.log("sync: %O", allItems);
  });
})();