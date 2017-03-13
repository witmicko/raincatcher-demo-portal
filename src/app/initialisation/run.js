var angular = require('angular');

var workorderCoreModule = require('fh-wfm-workorder/lib/client');



/**
 *
 * Creating promises for any of the fh-wfm modules that require asynchronous initialisation
 *
 * @param $rootScope
 * @param $q
 * @param mediator
 * @param userClient
 * @constructor
 */
function createWFMInitialisationPromises($rootScope, $q, mediator, userClient) {
  var initPromises = [];
  var initListener = mediator.subscribe('promise:init', function(promise) {
    initPromises.push(promise);
  });

  mediator.publish('init');
  console.log(initPromises.length, 'init promises to resolve.');
  var all = (initPromises.length > 0) ? $q.all(initPromises) : $q.when(null);
  return all.then(function() {
    $rootScope.ready = true;
    console.log(initPromises.length, 'init promises resolved.');
    mediator.remove('promise:init', initListener.id);
    userClient.clearSession();

    return null;
  });
}


/**
 *
 * Registering listeners for state changes and errors
 *
 * @param $rootScope
 * @param $state
 * @param userClient
 * @constructor
 */
function verifyLoginOnStateChange($rootScope, $state, userClient) {

  // $rootScope.$on('$stateChangeStart', function(e, toState, toParams) {
  //   //Verifying that the logged in user has a session before showing any other screens but the login.
  //   if (toState.name !== "app.login") {
  //     userClient.hasSession().then(function(hasSession) {
  //       if (!hasSession) {
  //         e.preventDefault();
  //         $rootScope.toState = toState;
  //         $rootScope.toParams = toParams;
  //         $state.go('app.login');
  //       }
  //     });
  //   }
  // });

  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    console.error('State change error: ', error, {
      event: event,
      toState: toState,
      toParams: toParams,
      fromState: fromState,
      fromParams: fromParams,
      error: error
    });
    if (error['get stack']) {
      console.error(error['get stack']());
    }
    event.preventDefault();
  });
}

/**
 *
 * Initialising the core modules.
 *
 * @param {Mediator} mediator
 */
function initCoreModules(mediator) {
  workorderCoreModule(mediator);
}

angular.module('app')
  .run(["mediator", initCoreModules])
  .run(["$rootScope", "$q", "mediator", "userClient", createWFMInitialisationPromises])
  .run(["$state", "mediator", "syncPool", subscribeToUserChange])
  .run(["$rootScope", "$state", "userClient", verifyLoginOnStateChange]);