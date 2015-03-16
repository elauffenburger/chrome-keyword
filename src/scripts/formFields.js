var _debug = false;

var _keywordCtxLastInput = null;

function FormInfo(keyword, url, fieldXPath, formXPath) {
  return {
    keyword: keyword,
    url: url,
    fieldXPath: fieldXPath,
    formXPath: formXPath
  };
}

function Response(value) {
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
    return "pepdir";
  }

  var toInjectUrl = chrome.extension.getURL("html/test.html");
  $.get(toInjectUrl, function(html) {
    $("body").append(html);

    var __ck_dialog = $("#__ck_dialog_create_keyword").dialog({
      autoOpen: true,
      modal: true,
      buttons: {
        "Create": function() {
          var keyword = $("#__ck_keywordName").val();

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

function createFormField(request, sendResponse) {
  getKeyword(function(keyword) {
    var lastInput = getLastInput();

    var form = lastInput.form;
    var formInfo = new FormInfo(keyword, lastInput.baseURI, getElementXPath(lastInput), getElementXPath(form));

    sendResponse(new Response(formInfo));
  });
}

function bindListeners() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("received request: %O", request);

    if(request.command == "createFormField") {
      createFormField(request, sendResponse);
    }
  });
}

(function init() {
  bindListeners();
  bindInputEventHandlers();
})();
