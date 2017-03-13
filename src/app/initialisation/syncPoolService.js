var angular = require('angular');
var _ = require('lodash');
var config = require('../config.json');


/**
 *
 * Service to manage initialising and removing synchronisation processes for:
 *
 * - workorders
 *
 * @param $q
 * @param mediator
 * @param workorderSync
 * @param syncService
 * @returns {{}}
 */
function SyncPoolService($q, mediator, workorderSync, syncService) {
  var syncPool = {};

  //Initialising the sync service - This is the global initialisation
  syncService.init(window.$fh, config.syncOptions);

  syncPool.removeManagers = function() {
    var promises = [];
    promises.push(workorderSync.removeManager());
    return $q.all(promises);
  };

  syncPool.syncManagerMap = function() {

    //If there is no user profile, don't initialise any of the sync managers.
    var promises = [];
    // add any additonal manager creates here
    promises.push(workorderSync.createManager());

    //Initialising the sync managers for the required datasets.
    return syncService.manage(config.datasetIds.workorders, {}, {}, config.syncOptions)
      .then(function() {
        return $q.all(promises).then(function(managers) {
          var map = {};
          managers.forEach(function(managerWrapper) {
            map[managerWrapper.manager.datasetId] = managerWrapper;
            managerWrapper.start();
          });
          map.workorders.manager.publishRecordDeltaReceived(mediator);
          return map;
        });
      });
  };

  syncPool.forceSync = function(managers) {
    var promises = [];
    _.forOwn(managers, function(manager) {
      promises.push(
        manager.forceSync()
          .then(manager.waitForSync)
          .then(function() {
            return manager;
          })
      );
    });
    return $q.all(promises);
  };

  return syncPool;
}

angular.module('app').service('syncPool', ["$q", "mediator", "workorderSync", "syncService", SyncPoolService]);