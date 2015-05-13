angular.module("app", [
	"app.blocks.router",
	"app.blocks.url",
	"app.helpers.keywords"
])
	.config(config)
	.run(run);

config.$inject = ["urlHelperProvider", "$urlRouterProvider"];
function config(urlHelperProvider, $urlRouterProvider) {
	urlHelperProvider.setBaseUrl('');

	$urlRouterProvider.otherwise('/');
};

run.$inject = ["routerHelper"];
function run(routerHelper) {
	routerHelper.configure([
		{
			state: 'home',
			config: {
				url: '/',
				controller: 'manageCtrl',
				controllerAs: 'vm',
				templateUrl: 'views/home.html',
				relative: true
			}
		},
		{
			state: 'info',
			config: {
				url: '/info',
				controller: 'homeCtrl',
				controllerAs: 'vm',
				templateUrl: 'views/home.html',
				relative: true
			}
		}
	]);
};