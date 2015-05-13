angular.module('app.helpers.keywords', [])
	.provider('keywordHelper', keywordHelperProvider);
	
keywordHelperProvider.$inject = [];

function keywordHelperProvider() {
	this.$get = keywordHelper;
	
	keywordHelper.$inject = ["$q"];
	function keywordHelper($q) {
		var onUpdateCallbacks = [];
		
		var service = {
			getKeywords: getKeywords,
			removeKeyword: removeKeyword,
			registerOnUpdateHandler: registerOnUpdateHandler
		};
		
		initService(service);
		
		return service;
		
		//////////
		
		function initService(toInit) {
			chrome.storage.onChanged.addListener(onStorageChanged);
		}
		
		/**
		 * Wraps an async function and returns a promise for its result
		 * @param <Function> fn Function to be wrapped
		 */
		function wrapAsync(fn) {
			var defer = $q.defer();
			
			fn(defer);
			
			return defer.promise;
		}
		
		/**
		 * Gets all keywords in Chrome sync storage
		 * @returns <Object> A promise for keywords
		 */
		function getKeywords() {
			return wrapAsync(function(defer) {
				chrome.storage.sync.get('keywords', function(data) {
					var keywords = data.keywords;
					console.log(keywords);
					
					defer.resolve(keywords);
				});
			});
		}
		
		/**
		 * Removes a given keyword by key
		 * @param <String> Keyword Keyword to be removed
		 * @returns <Object> A promise for completion of removal
		 */
		function removeKeyword(keyword) {
			return wrapAsync(function (defer) {
				getKeywords().then(function(keywords) {
					_.remove(keywords, function(item) {
						return item.keyword == keyword;
					});
					
					setKeywordArray(keywords).then(function() {
						defer.resolve();
					});
				});
			});
		}
		
		/**
		 * Adds an event handler for update events
		 * @param <Function> fn Event handler
		 */
		function registerOnUpdateHandler(fn) {
			onUpdateCallbacks.push(fn);
		}
		
		/**
		 * When Chrome storage updates, we alert all listeners
		 * @param <Object> changes Object mapping each key that changed to its corresponding StorageChange ({ oldValue: "...", newValue: "..." })
		 * @param <String> areaName Name of storage area (should be "sync")
		 */
		function onStorageChanged(changes, areaName) {
			_.forEach(onUpdateCallbacks, function(callback) {
				callback(changes);
			});
		}
		
		/**
		 * Sets the internal keyword storage
		 * @param <Object[]> keywords Keywords to be set
		 * @returns <Object> A promise for completion of operation
		 */
		function setKeywordArray(keywords) {
			return wrapAsync(function(defer) {
				chrome.storage.sync.set({keywords: keywords}, function() {
					defer.resolve();
				});
			});
		}
	}
}