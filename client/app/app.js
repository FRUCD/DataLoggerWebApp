'use strict';

import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
// import ngMessages from 'angular-messages';


import {
  routeConfig
} from './app.config';

import login from './login/login.component';
import dashboard from './dashboard/dashboard.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';

import './app.scss';

angular.module('dataLoggerWebApp', [ngCookies, ngResource, ngSanitize, ngAnimate,
    'btford.socket-io', uiRouter, uiBootstrap, login, dashboard, constants, socket, util
  ])
  .config(routeConfig);

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['dataLoggerWebApp'], {
      strictDi: true
    });
  });
