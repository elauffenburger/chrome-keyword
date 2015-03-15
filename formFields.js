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

function getKeyword() {
  if(_debug) {
    return "pepdir";
  }

  var keyword = prompt("Enter keyword for search: ");

  return keyword;
}

function bindListeners() {
  function Response(value) {
    return {
      value: value
    };
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("received request: %O", request);

    if(request.command == "createFormField") {
      var keyword = getKeyword();
      var lastInput = getLastInput();

      var form = lastInput.form;
      var formInfo = new FormInfo(keyword, lastInput.baseURI, getElementXPath(lastInput), getElementXPath(form));

      sendResponse(new Response(formInfo));
    }
  });
}

(function init() {
  bindListeners();
  bindInputEventHandlers();
})();
