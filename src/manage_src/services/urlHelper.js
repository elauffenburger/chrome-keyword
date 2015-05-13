angular.module("app.blocks.url", [])
	   .provider("urlHelper", urlHelperProvider);
	   
urlHelperProvider.$inject = [];

function urlHelperProvider() {
	/**
	 * Private
	 */
	 var baseUrl = "";
	 
	/**
	 * Public
	 */
	this.$get = urlHelper;
	this.setBaseUrl = setBaseUrl;
	this.getBaseUrl = getBaseUrl;

	//////////
	
	function setBaseUrl(url) {
		baseUrl = url;
	}
	
	function getBaseUrl() {
		return baseUrl;
	}
	
	urlHelper.$inject = [];
	function urlHelper() {
		var service = {
			getRelativePath: getRelativePath	
		};
		
		return service;
		
		//////////
		
		function getRelativePath(url) {
			return baseUrl + url;
		}
	}
}