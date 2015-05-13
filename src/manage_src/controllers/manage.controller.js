angular.module("app")
	.controller("manageCtrl", manageCtrl);
	
manageCtrl.$inject = ["$log", "keywordHelper"];

function manageCtrl($log, keywordHelper) {
	$log.debug("Instantiated manageCtrl");
	
	var vm = this;
	
	vm.removeKeyword = removeKeyword;
	
	init();
	//////////
	
	function init() {
		keywordHelper.registerOnUpdateHandler(onStorageUpdate);
		
		refreshKeywords();
	}
	
	function refreshKeywords() {
		keywordHelper.getKeywords().then(function(keywords) {
			vm.keywords = keywords;
		});
	}
	
	function removeKeyword(keyword) {
		keywordHelper.removeKeyword(keyword).then(function() {
			refreshKeywords();
		});
	}
	
	function onStorageUpdate(changes) {
		console.debug("Got changes: %O", changes);
		refreshKeywords();
	}
}