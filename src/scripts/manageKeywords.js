var _debug = false;

function createNewKeyword(request, port) {
  if(_debug) {
    request.args.value.keyword = "pepdir";
    port.postMessage(request);
  }

  var __ck_dialog = $("#__ck_dialog_create_keyword").dialog({
    autoOpen: true,
    modal: true,
    buttons: {
      "Create": function() {
        var keyword = $("#__ck_keywordName").val();
        request.args.value.keyword = keyword;

        port.postMessage(request);
      },
      "Cancel": function() {
        __ck_dialog.dialog("close");

        post.postMessage(null);
      }
    }
  });
}

function onConnect(port) {
  console.log("Received connection: %O", port);

  port.onMessage.addListener((function(localPort) {
    return function(msg) {
      if(msg.command == "createKeyword") {
        createNewKeyword(msg, localPort);
      }
    };
  })(port));

  port.postMessage({status: "ready"});
}

function bindEventHandlers() {
  chrome.runtime.onConnect.addListener(onConnect);
}

function init() {
  bindEventHandlers();
}

(function() {
  init();
})();
