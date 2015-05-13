angular.module("app.blocks.router", [
					"ui.router",	
					"app.blocks.url"
]).provider("routerHelper", routerHelperProvider);

routerHelperProvider.$inject = ["$stateProvider"];	
   
function routerHelperProvider($stateProvider) {
	this.$get = routerProvider;
	
	routerProvider.$inject = ["$state", "urlHelper", "$log"];
	
	function routerProvider($state, urlHelper, $log) {
		var service = {
			configure: configure
		};
		
		return service;
		
		//////////
		
		function configure(states) {
			states.forEach(function(state) {
				$log.debug("Registering state: %O", state);
				if(state.config.relative) {
					$log.debug("State is relative; applying relative path transform");
					
					state.config.templateUrl = urlHelper.getRelativePath(state.config.templateUrl);
				
					$log.debug("New templateUrl: %s", state.config.templateUrl);
				}
				$stateProvider.state(state.state, state.config);
			});
		}
	}
}