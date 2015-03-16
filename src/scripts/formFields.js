var _debug = false;

var _keywordCtxLastInput = null;
var _loadedAddKeyword = false;

function FormInfo(keyword, url, fieldXPath, formXPath) {
  return {
    keyword: keyword,
    url: url,
    fieldXPath: fieldXPath,
    formXPath: formXPath
  };
}

function CKResponse(value) {
  return {
    value: value
  };
}

function getLastInput() {
  return _keywordCtxLastInput;
}

function bindInputEventHandlers() {
  var inputs = document.querySelectorAll("input[type='text']");

  for(var key in inputs) {
    var input = inputs[key];
    var oldFunction = input.onfocus;

    console.log(input);

    input.onfocus = (function(old_function) {
      console.log("old_function: %O", old_function);

      return function(event) {
        (function setLastInput(event) {
          console.log("event");

          _keywordCtxLastInput = event.target;
        })(event);

        if(old_function) {
          old_function(event);
        }
      };
    })(oldFunction);
  }
}

function getKeyword(callback) {
  if(_debug) {
    callback("pepdir");
  }

  var injectUrl = $.get(chrome.extension.getURL("/html/addKeyword.html")).then(function(html) {
    $("body").append(html);
    _loadedAddKeyword = true;

    var keywordField = $("#__ck_keywordName");
    keywordField.val("");

    var __ck_dialog = $("#__ck_dialog_create_keyword").dialog({
      autoOpen: true,
      modal: true,
      buttons: {
        "Create": function() {
          var keyword = keywordField.val();
          __ck_dialog.dialog("close");

          callback(keyword);
        },
        "Cancel": function() {
          __ck_dialog.dialog("close");
          callback(null);
        }
      }
    });


  });
}

function createFormField(req, res) {
  (function(request, sendResponse) {
    getKeyword(function(keyword) {
      var lastInput = getLastInput();

      var form = lastInput.form;
      var formInfo = new FormInfo(keyword, lastInput.baseURI, getElementXPath(lastInput), getElementXPath(form));

      sendResponse(new CKResponse(formInfo));
    });
  })(req, res);
}

function creationSuccess(request, sendResponse) {
  var success = $("#__ck_dialog_create_keyword_success").dialog({
    autoOpen: true,
    buttons: {
      "Awesome!": function() {
        success.dialog("close");
      }
    }
  });
}

function failureKeyExists(request, sendResponse) {
  var success = $("#__ck_dialog_create_keyword_exists").dialog({
    autoOpen: true,
    buttons: {
      "Ah man...": function() {
        success.dialog("close");
      }
    }
  });
}

function bindListeners() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("received request: %O", request);

    if(request.command == "createFormField") {
      createFormField(request, sendResponse);
    }else if(request.command == "creationSuccess") {
      creationSuccess(request, sendResponse);
    }else if(request.command == "failureKeyExists") {
      failureKeyExists(request, sendResponse);
    }

    return true;
  });
}

(function init() {
  bindListeners();
  bindInputEventHandlers();
})();
