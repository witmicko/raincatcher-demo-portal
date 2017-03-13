'use strict';

var angular = require('angular');
require('fh-js-sdk/dist/feedhenry-forms.js');

angular.module('app', [
  require('angular-ui-router'),
  require('angular-material'),
  require('./feedhenry'),
  require('fh-wfm-mediator'),
  require('fh-wfm-sync'),
  require('fh-wfm-workorder-angular')({
    mode: "admin",
    listColumnViewId: "column2",
    mainColumnViewId: "content@app"
  }),
  require('./home/home')
]);

//Initialising the application with required serviceconfig and initialising script.
require('./initialisation');