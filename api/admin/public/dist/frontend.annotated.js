(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core.services', []);
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core.services')
    .factory('usersPermissionsService', usersPermissionsService);

  usersPermissionsService.$inject = ['Config', '$http', '_', '$q', 'messageService'];

  function usersPermissionsService(Config, $http, _, $q, messageService) {

    var service = {
      getRoutesAndRoles: getRoutesAndRoles,
      formatRoutes: formatRoutes,
      updateRoutes: updateRoutes
    };

    return service;

    // Private functions.

    /**
     * Get the list of roles and routes (grouped).
     *
     * @returns {{routes: [], roles: []}
     */

    function getRoutesAndRoles() {
      var deferred = $q.defer();

      var promises = [];

      // Http call to get routes.
      promises.push($http.get(Config.backendUrl + '/admin/routes'));

      promises.push(getRoles());

      $q.all(promises)
        .then(function (responses) {
          var routesGroups = responses[0].data;
          var roles = responses[1];

          // Format routes.
          formatRoutes(routesGroups, roles);

          // Finally resolve the promise.
          deferred.resolve({
            routes: routesGroups,
            roles: roles
          });
        })
        .catch(function (err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    /**
     * Get the list of roles.
     *
     * @returns {*}
     */

    function getRoles() {
      var deferred = $q.defer();

      // Http call to get roles.
      $http({
        method: 'get',
        url: Config.backendUrl + '/admin/explorer/role',
        params: {
          populate: {}
        }
      })
        .success(function (roles) {
          // Order properly the list of roles.
          var adminRole = _.find(roles, {
            name: 'admin'
          });

          // If the `admin` role is found, it is moved at the
          // end of the list of roles.
          if (adminRole) {
            var index = _.indexOf(roles, adminRole);
            roles.splice(index, 1);
            roles.push(adminRole);
          }
          console.log('roles', roles);

          deferred.resolve(roles);
        })
        .catch(function (err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }

    /**
     * Update a list of routes
     *
     * @param routesGroups
     * @returns {*} Promise
     */

    function updateRoutes(routesGroups) {
      // Clone the object in order to disturb the display during the update.
      routesGroups = angular.copy(routesGroups);

      // Format the list of routes.
      var routes = [];
      angular.forEach(routesGroups, function (routesGroup) {
        angular.forEach(routesGroup, function (route) {
          var enabledRoutes = _.where(route.roles, {
            enabled: true
          });
          route.roles = enabledRoutes;
          routes.push(route);
        });
      });

      // Finally call the API.
      return $http({
        method: 'put',
        url: Config.backendUrl + '/admin/routes',
        data: routes
      })
        .success(function () {
          messageService.success('Permissions updated', 'Success');
        });
    }

    /**
     * Helper which format routes according to there roles.
     *
     * @param routesGroups
     * @param roles
     *
     * @returns {*}
     */

    function formatRoutes(routesGroups, roles) {
      var roleFound;
      var tmpRoles;

      angular.forEach(routesGroups, function (routesGroup) {
        angular.forEach(routesGroup, function (route) {
          // Format the list of roles of the current route.
          route.roles = route.roles || [];

          // Temporary list of roles used in the loop.
          tmpRoles = [];
          angular.forEach(roles, function (role, index) {
            // This is the list of roles currently enabled for this route.
            roleFound = _.find(route.roles, {name: role.name});

            // Clone the role object.
            role = angular.copy(role);

            // Set the attribute enabled to `true` if the current `role` is
            // found list of `roles` of the current `routes`.
            if (roleFound) {
              role.enabled = true;
              route.roles[index] = role;
            } else if (role.name && role.name.toLowerCase() === 'admin') {
              // Admin role is always enabled.
              role.enabled = true;
            } else {
              role.enabled = false;
            }
            tmpRoles[index] = role;
          });
          // Set the temporary roles as the `roles` attribute of the object.
          route.roles = angular.copy(tmpRoles);
        });
      });

      return routesGroups;
    }
  }
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.strapi.users.permissions', []);

})();

(function () {
  'use strict';

  angular.module('frontend.strapi.users.permissions')
    .controller('UsersPermissionsController', UsersPermissionsController);

  UsersPermissionsController.$inject = ['usersPermissionsService', '_routesAndRoles'];

  function UsersPermissionsController(usersPermissionsService, _routesAndRoles) {

    var vm = this;
    var routesBackup;
    vm.roles = [];
    vm.collapsedBooleans = {};
    vm.collapse = collapse;
    vm.update = update;
    vm.cancel = cancel;
    vm.getRouteClass = getRouteClass;
    vm.colWidth = 0;
    vm.getRoleModel = getRoleModel;

    _init();

    // Private functions.

    function _init() {
      vm.routes = _routesAndRoles.routes;
      vm.roles = _routesAndRoles.roles;
      routesBackup = angular.copy(vm.routes);
      vm.colWidth = 98 / (vm.roles.length + 3) + '%';

      // Collapse.
      collapse();
    }

    /**
     * Update the routes.
     */

    function update() {
      usersPermissionsService.updateRoutes(vm.routes)
        .then(function (response) {
          vm.routes = usersPermissionsService.formatRoutes(response.data, vm.roles);
          routesBackup = angular.copy(vm.routes);
        });
    }

    /**
     * Helper for verbs class.
     *
     * @param verb
     * @returns {*}
     */

    function getRouteClass(verb) {
      verb = angular.isString(verb) ? verb.toLowerCase() : '';

      var classes = {
        get: 'bg-primary',
        post: 'bg-success',
        put: 'bg-warning',
        patch: 'bg-warning',
        delete: 'bg-danger',
        options: 'bg-default'
      };

      return classes[verb];
    }

    /**
     * Cancel function.
     */

    function cancel() {
      vm.routes = angular.copy(routesBackup);
    }

    /**
     * Return the model of the route.
     *
     * @param route
     * @param index
     * @returns {*}
     */
    function getRoleModel(route, index) {
      return index === 0 ? route.isPublic : route.roles[index].enabled;
    }

    /**
     * Collapse.
     *
     * @param newExpanded
     */

    function collapse(newExpanded) {
      angular.forEach(vm.routes, function (group, name) {
        if (name === newExpanded) {
          vm.collapsedBooleans[name] = !vm.collapsedBooleans[name];
        } else {
          vm.collapsedBooleans[name] = true;
        }
      });
    }
  }
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core.directives', []);
})();

(function () {
  'use strict';

  /**
   * Directive used to create switch buttons.
   */
  angular.module('frontend.core.directives')
    .directive('strapiSwitch', strapiSwitch);

  strapiSwitch.$inject = [];

  function strapiSwitch() {
    var directive = {
      restrict: 'AE',
      replace: true,
      transclude: true,
      link: function (scope, elem, attrs) {
        scope.isDisabled = function () {
          return scope.$eval(attrs.ngDisabled);
        };
      },
      template: function (element, attrs) {
        var html = '';
        html += '<span';
        html += ' class="switch' + (attrs.class ? ' ' + attrs.class : '') + '"';
        html += attrs.ngModel ? ' ng-click="' + attrs.disabled + ' ? ' + attrs.ngModel + ' : ' + attrs.ngModel + '=!' + attrs.ngModel + (attrs.ngChange ? '; ' + attrs.ngChange + '()"' : '"') : '';
        html += ' ng-class="{ checked:' + attrs.ngModel + ', disabled: isDisabled() }"';
        html += '>';
        html += '<small></small>';
        html += '<input type="checkbox"';
        html += attrs.id ? ' id="' + attrs.id + '"' : '';
        html += attrs.name ? ' name="' + attrs.name + '"' : '';
        html += attrs.ngModel ? ' ng-model="' + attrs.ngModel + '"' : '';
        html += ' style="display:none" />';
        html += '<span class="switch-text">';
        // Adding new container for switch text
        html += attrs.on ? '<span class="on">' + attrs.on + '</span>' : '';
        // Switch text on value set by user in directive html markup
        html += attrs.off ? '<span class="off">' + attrs.off + '</span>' : ' ';
        // Switch text off value set by user in directive html markup
        html += '</span>';
        return html;
      }
    };

    return directive;
  }
})();


(function () {
  'use strict';

  /**
   * Directive used to format text to json
   * (using JSON.parse function to parse text value).
   */
  angular.module('frontend.core.directives')
    .directive('jsonInput', jsonInput);

  jsonInput.$inject = [];

  function jsonInput() {

    var directive = {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elem, attr, ctrl) {
        ctrl.$parsers.push(function (input) {
          try {
            var obj = JSON.parse(input);
            ctrl.$setValidity('jsonInput', true);
            return obj;
          } catch (e) {
            ctrl.$setValidity('jsonInput', false);
            return null;
          }
        });
        ctrl.$formatters.push(function (data) {
          if (data === null) {
            ctrl.$setValidity('jsonInput', false);
            return '';
          }
          try {
            var str = JSON.stringify(data);
            ctrl.$setValidity('jsonInput', true);
            return str;
          } catch (e) {
            ctrl.$setValidity('codeme', false);
            return '';
          }
        });
      }
    };

    return directive;
  }
})();

(function () {
  'use strict';

  /**
   * Directive used for infinite scroll (used
   * for relations in the Data Explorer edit view).
   */
  angular.module('frontend.core.directives')
    .directive('infiniteScroll', infiniteScroll);

  infiniteScroll.$inject = ['$rootScope', '$window', '$timeout'];

  function infiniteScroll($rootScope, $window, $timeout) {
    var directive = {
      link: link
    };

    return directive;

    function link(scope, elem, attrs) {
      var checkWhenEnabled;
      var scrollEnabled;
      $window = angular.element($window);
      elem.css('overflow-y', 'auto');
      elem.css('overflow-x', 'hidden');
      elem.css('height', 'inherit');
      scrollEnabled = true;
      checkWhenEnabled = false;
      if (attrs.infiniteScrollDisabled !== null) {
        scope.$watch(attrs.infiniteScrollDisabled, function (value) {
          scrollEnabled = !value;
          if (scrollEnabled && checkWhenEnabled) {
            checkWhenEnabled = false;
            return handler();
          }
        });
      }
      $rootScope.$on('refreshStart', function () {
        elem.animate({scrollTop: '0'});
      });
      function handler() {
        var container;
        var elementBottom;
        var remaining;
        var shouldScroll;
        var containerBottom;
        container = angular.element(elem.children()[0]);
        container.offset = offset;
        elem.offset = offset;
        elementBottom = elem.offset().top + elem[0].offsetHeight;
        containerBottom = container.offset().top + container[0].offsetHeight;
        remaining = containerBottom - elementBottom;
        shouldScroll = remaining <= 0;

        if (shouldScroll && scrollEnabled && !scope.$eval(attrs.infiniteScrollLoading)) {
          if ($rootScope.$$phase) {
            return scope.$eval(attrs.infiniteScroll);
          } else {
            return scope.$apply(attrs.infiniteScroll);
          }
        } else if (shouldScroll) {
          checkWhenEnabled = true;
          return checkWhenEnabled;
        }
      }

      elem.on('scroll', handler);
      scope.$on('$destroy', function () {
        return $window.off('scroll', handler);
      });
      return $timeout(function () {
        if (attrs.infiniteScrollImmediateCheck) {
          if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
            return handler();
          }
        } else {
          return handler();
        }
      }, 0);
    }
  }

  /**
   * JQuery mixin
   *
   * @returns {{top: number, left: number}}
   */
  function offset() {
    /* jshint validthis: true */
    var self = this;
    var elem = self[0];

    if (!elem) {
      return;
    }

    var rect = elem.getBoundingClientRect();

    // Make sure element is not hidden (display: none) or disconnected
    return {
      top: rect.top + window.pageYOffset - document.documentElement.clientTop,
      left: rect.left + window.pageXOffset - document.documentElement.clientLeft
    };
  }
})();

(function () {
  'use strict';

  angular.module('frontend.core.directives')
    .directive('autofocus', autofocus);

  autofocus.$inject = ['$timeout'];

  function autofocus($timeout) {
    var directive = {
      restrict: 'A',
      link: function ($scope, $element) {
        $timeout(function () {
          $element[0].focus();
        });
      }
    };

    return directive;
  }
})();

(function () {
  'use strict';

  /**
   * Directive used to format text to array
   * (using the `,` symbol as separator).
   */
  angular.module('frontend.core.directives')
    .directive('arrayInput', arrayInput);

  arrayInput.$inject = ['_'];

  function arrayInput(_) {
    var directive = {
      restrict: 'A',
      require: 'ngModel',
      link: link
    };

    return directive;

    function link(scope, elem, attr, ctrl) {
      ctrl.$parsers.push(function (input) {
        ctrl.$setValidity('arrayInput', true);
        if (typeof input === 'string') {
          return input.split(',');
        }
      });
      ctrl.$formatters.push(function (data) {
        if (data === null) {
          ctrl.$setValidity('arrayInput', false);
          return [];
        }
        if (_.isArray(data)) {
          ctrl.$setValidity('arrayInput', true);
          return data;
        } else {
          ctrl.$setValidity('arrayInput', false);
          return '';
        }
      });
    }
  }
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core.auth.services', []);
})();

(function () {
  'use strict';

  /**
   * Service used to get current user data.
   */
  angular.module('frontend.core.auth.services')
    .factory('userService', userService);

  userService.$inject = ['$localStorage'];

  function userService($localStorage) {
    var service = {
      user: user
    };

    return service;

    /**
     * Return user object
     *
     * It's expose globaly, so you can use it everywhere
     *  <div data-ng-show="auth.isAuthenticated()">
     *      Hello, <strong>{{user().email}}</strong>
     *  </div>
     *
     * @return {Object}
     */
    function user() {
      return $localStorage.credentials ? $localStorage.credentials.user : null;
    }
  }
})();

(function () {
  'use strict';

  /**
   * Service containing the main authentication logic.
   */
  angular.module('frontend.core.auth.services')
    .factory('authService', authService);

  authService.$inject = ['$http', '$state', '$localStorage', 'AccessLevels', 'Config', 'messageService', '$location', 'initService', '$injector'];

  function authService($http, $state, $localStorage, AccessLevels, Config, messageService, $location, initService, $injector) {

    var service = {
      authorize: authorize,
      isAuthenticated: isAuthenticated,
      login: login,
      logout: logout,
      register: register,
      forgotPassword: forgotPassword,
      changePassword: changePassword
    };

    return service;

    /**
     * Method to authorize current user with given access level in application.
     *
     * @param  {Number}  accessLevel Access level to check
     *
     * @return {Boolean}
     */
    function authorize(accessLevel) {
      if (accessLevel === AccessLevels.user) {
        return service.isAuthenticated();
      } else if (accessLevel === AccessLevels.admin) {
        return service.isAuthenticated() && Boolean($localStorage.credentials.user.admin);
      } else {
        return accessLevel === AccessLevels.anon;
      }
    }

    /**
     * Method to check if current user is authenticated or not.
     * This will just simply call 'Storage' service 'get' method and
     * returns it results.
     *
     * @return {Boolean}
     */
    function isAuthenticated() {
      return Boolean($localStorage.credentials);
    }

    /**
     * Method make login request to backend server. Successfully response from
     * server contains user data and JWT token as in JSON object. After successful
     * authentication method will store user data and JWT token to local storage
     * where those can be used.
     *
     * @param  {Object}  credentials
     */
    function login(credentials) {
      return $http.post(Config.backendUrl + '/auth/local', credentials, {
        withCredentials: true
      })
        .then(function (response) {
          var configService = $injector.get('configService');
          configService.getApp(true).then(function () {
            messageService.success('You have been logged in.');
          });

          $localStorage.credentials = response.data;
        });
    }

    /**
     * The backend doesn't care about actual user logout, just delete the token
     * and you're good to go.
     */
    function logout() {
      $localStorage.$reset();
      return $http.post(Config.backendUrl + '/auth/logout', {})
        .then(function () {
          $state.go('auth.login');
        });
    }

    /**
     * HTTP request on server to create new user.
     *
     * @param {Object} user
     */
    function register(user) {
      return $http.post(Config.backendUrl + '/auth/local/register', user)
        .then(function (response) {
          messageService.success('You have been logged in.');

          $localStorage.credentials = response.data;
        });
    }

    /**
     * HTTP request on server to create link with code token to change password.
     *
     * @param {String} email
     */
    function forgotPassword(email) {
      var changePasswordUrl = $location.$$protocol + '://' + $location.$$host + ':' + $location.$$port + '/admin/#!/forgot-password/change-password';

      return $http.post(Config.backendUrl + '/auth/forgot-password', {
        email: email,
        url: changePasswordUrl
      })
        .then(function () {
          messageService.success('Request sent, check your emails');

          return false;
        })
        .catch(function () {
          return true;
        });
    }

    /**
     * HTTP request on server to change user password.
     *
     * @param {Object} scope
     */
    function changePassword(scope) {
      return $http.post(Config.backendUrl + '/auth/change-password', scope)
        .then(function (response) {
          messageService.success('Password changed');

          $localStorage.credentials = response.data;

          return false;
        })
        .catch(function () {
          return true;
        });
    }
  }
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core.auth.register', []);
})();

(function () {
  'use strict';

  // Module config.
  angular.module('frontend.core.auth.register')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          .state('auth.register', {
            url: '/register',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/core/auth/register/register.html',
                controller: 'RegisterController as RegisterCtrl'
              }
            }
          })
          .state('auth.register.confirmation', {
            url: '/register/confirmation',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/core/auth/register/confirm.html'
              }
            }
          });
      }
    ]);
})();

(function () {
  'use strict';

  angular.module('frontend.core.auth.register')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = ['$state', 'authService', 'configService'];

  function RegisterController($state, authService, configService) {
    // Already authenticated so redirect back to the dashboard page.
    if (authService.isAuthenticated()) {
      $state.go('strapi.dashboard');
    }

    // Disable registration if there more than 0 user existing.
    if (configService.getConfig() && !configService.getConfig().isNewApp) {
      $state.go('auth.login');
    }

    var vm = this;

    // Init the loading variable
    vm.loading = false;

    // Scope user and set password to empty string
    vm.user = {
      username: '',
      email: '',
      password: '',
      passwordConfirmation: ''
    };

    /**
     * Call authService to make register request
     *
     * @scope
     */
    vm.action = function () {
      if (vm.registrationForm.$valid) {
        vm.loading = true;

        authService
          .register(vm.user)
          .then(function () {
            // Go to the dashboard page.
            $state.go('strapi.dashboard');
            vm.loading = false;

            // Reload the app config.
            configService.getApp();
          })
          .catch(function () {
            vm.loading = false;
          });
      }
    };

    /**
     * Helper for submit button.
     *
     * @returns {boolean}
     */
    vm.matchPassword = function () {
      return vm.user.password === vm.user.passwordConfirmation;
    };

    // Form fields
    vm.fields = [{
      type: 'input',
      key: 'username',
      templateOptions: {
        placeholder: 'Username',
        label: '',
        minlength: 3,
        focus: true,
        required: true,
        addonLeft: {
          class: 'fa fa-user'
        }
      }
    }, {
      type: 'input',
      key: 'email',
      templateOptions: {
        type: 'email',
        placeholder: 'E-mail',
        label: '',
        minlength: 6,
        required: true,
        addonLeft: {
          class: 'fa fa-envelope'
        }
      }
    }, {
      type: 'input',
      key: 'password',
      templateOptions: {
        type: 'password',
        label: '',
        placeholder: 'Password',
        minlength: 6,
        required: true,
        addonLeft: {
          class: 'fa fa-lock'
        }
      }
    }, {
      type: 'input',
      key: 'passwordConfirmation',
      extras: {
        validateOnModelChange: true
      },
      templateOptions: {
        type: 'password',
        label: '',
        placeholder: 'Confirm Password',
        minlength: 6,
        required: true,
        addonLeft: {
          class: 'fa fa-lock'
        }
      },
      validators: {
        confirmation: {
          expression: function (viewValue, modelValue) {
            var value = modelValue || viewValue;
            return !vm.user.password || vm.user.password === value;
          },
          message: '"Password  does not match with the password field"'
        }
      }
    }];
  }
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core.auth.login', []);
})();

(function () {
  'use strict';

  // Module config.
  angular.module('frontend.core.auth.login')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          .state('auth.login', {
            url: '/login',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/core/auth/login/login.html',
                controller: 'LoginController as LoginCtrl'
              }
            }
          });
      }
    ]);
})();

(function () {
  'use strict';

  angular.module('frontend.core.auth.login')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$state', 'authService', 'configService'];

  function LoginController($state, authService, configService) {
    // Already authenticated so redirect back to dashboard.
    if (authService.isAuthenticated() && configService.getConfig().isNewApp !== undefined) {
      return $state.go('strapi.dashboard');
    }

    // Auto redirection if there are no user yet.
    if (configService.getConfig() && configService.getConfig().isNewApp) {
      return $state.go('auth.register');
    }

    var vm = this;
    vm.action = action;
    vm.loading = false;
    vm.fields = getFields();

    _init();

    /**
     * Call authService to make login request
     */
    function action() {
      if (vm.loginForm.$valid) {
        vm.loading = true;
        authService
          .login(vm.credentials)
          .then(function success() {
            $state.go('strapi.dashboard', null, {
              reload: true
            });
            vm.loading = false;
          })
          .catch(function error() {
            vm.credentials.password = '';
            vm.loading = false;
          });
      }
    }

    /**
     * Return the list of fields for the login form.
     *
     * @returns [] fields
     */
    function getFields() {
      return [{
        type: 'input',
        key: 'identifier',
        templateOptions: {
          placeholder: 'Email or username',
          label: '',
          focus: true,
          minlength: 3,
          addonLeft: {
            class: 'fa fa-user'
          }
        }
      }, {
        type: 'input',
        key: 'password',
        templateOptions: {
          type: 'password',
          placeholder: 'Password',
          label: '',
          minlength: 6,
          addonLeft: {
            class: 'fa fa-lock'
          }
        }
      }];
    }

    /**
     * Private helper function to reset credentials and set focus to
     * username input.
     *
     * @private
     */
    function _init() {
      // Initialize credentials
      vm.credentials = {
        identifier: '',
        password: ''
      };
    }
  }

})();

(function () {
  'use strict';

  angular.module('frontend.core.auth.forgotPassword', []);

})();

(function () {
  'use strict';

  angular.module('frontend.core.auth.forgotPassword')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          .state('auth.forgotPassword', {
            url: '/forgot-password',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/core/auth/forgot-password/forgot-password.html',
                controller: 'ForgotPasswordController as ForgotPasswordCtrl'
              }
            }
          });
      }
    ]);
})();

(function () {
  'use strict';

  angular.module('frontend.core.auth.forgotPassword')
    .controller('ForgotPasswordController', ForgotPasswordController);

  ForgotPasswordController.$inject = ['$state', 'authService'];

  function ForgotPasswordController($state, authService) {
    // Already authenticated so redirect back to dashboard.
    if (authService.isAuthenticated()) {
      return $state.go('strapi.dashboard');
    }

    var vm = this;
    vm.action = action;
    vm.fields = getFields();

    /**
     * Call authService to make forgot password request
     */
    function action() {
      if (vm.forgotPasswordForm.$valid) {
        authService
          .forgotPassword(vm.form.email)
          .then(function (err) {
            if (err) {
              return;
            }

            $state.go('auth.login');
          });
      }
    }

    /**
     * Return the list of fields for the login form.
     *
     * @returns [] fields
     */
    function getFields() {
      return [{
        type: 'input',
        key: 'email',
        templateOptions: {
          type: 'email',
          focus: true,
          placeholder: 'Your e-mail',
          label: '',
          minlength: 6,
          addonLeft: {
            class: 'fa fa-envelope'
          }
        }
      }];
    }
  }
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core.auth.changePassword', []);
})();

(function () {
  'use strict';

  // Module config.
  angular.module('frontend.core.auth.changePassword')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          .state('auth.forgotPassword.change', {
            url: '/change-password',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/core/auth/change-password/change-password.html',
                controller: 'ChangePasswordController as ChangePasswordCtrl'
              }
            }
          });
      }
    ]);
})();

(function () {
  'use strict';

  angular.module('frontend.core.auth.changePassword')
    .controller('ChangePasswordController', ChangePasswordController);

  ChangePasswordController.$inject = ['$state', '$location', 'authService'];

  function ChangePasswordController($state, $location, authService) {
    // Already authenticated so redirect back to dashboard.
    if (authService.isAuthenticated()) {
      return $state.go('strapi.dashboard');
    }

    var vm = this;
    vm.action = action;
    vm.fields = getFields();

    /**
     * Call authService to make change password request.
     */
    function action() {
      if (vm.changePasswordForm.$valid) {
        var scope = {
          password: vm.form.password,
          passwordConfirmation: vm.form.passwordConfirmation,
          code: $location.$$search.code
        };

        authService
          .changePassword(scope)
          .then(function (err) {
            if (err) {
              vm.form.password = '';
              vm.form.confirmPassword = '';
              return;
            }

            $state.go('strapi.dashboard');
          });
      }
    }

    /**
     * Return the list of fields for the login form.
     *
     * @returns [] fields
     */
    function getFields() {
      return [{
        type: 'input',
        key: 'password',
        templateOptions: {
          type: 'password',
          label: '',
          focus: true,
          placeholder: 'Password (min. 8 charachters)',
          minlength: 6,
          addonLeft: {
            class: 'fa fa-lock'
          }
        }
      }, {
        type: 'input',
        key: 'passwordConfirmation',
        templateOptions: {
          type: 'password',
          label: '',
          placeholder: 'Confirm Password',
          minlength: 6,
          addonLeft: {
            class: 'fa fa-lock'
          }
        }
      }];
    }
  }
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.strapi.users', [
    'frontend.strapi.users.permissions'
  ]);

})();

(function () {
  'use strict';

  // Module configuration
  angular.module('frontend.strapi.users')
    .config([
      '$stateProvider',
      function ($stateProvider) {
        var menuGroup = 'users';

        $stateProvider
          .state('strapi.users', {
            url: '/users',
            data: {
              access: 1,
              menuGroup: menuGroup
            },
            views: {
              'content@': {
                templateUrl: '/frontend/strapi/users/users.html'
              }
            }
          })
          .state('strapi.users.permissions', {
            url: '/permissions',
            data: {
              access: 1,
              menuGroup: menuGroup
            },
            views: {
              'content@': {
                templateUrl: '/frontend/strapi/users/permissions/permissions.html',
                controller: 'UsersPermissionsController as UsersPermissionsCtrl'
              }
            },
            resolve: {
              _routesAndRoles: ['usersPermissionsService', function (usersPermissionsService) {
                return usersPermissionsService.getRoutesAndRoles();
              }]
            }
          });
      }
    ]);
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.strapi.explorer', []);
})();

(function () {
  'use strict';

  /**
   * Service used for the Data Explorer part of the admin panel.
   */
  angular.module('frontend.strapi.explorer')
    .factory('explorerService', explorerService);

  explorerService.$inject = ['_', '$filter'];

  function explorerService(_, $filter) {

    var service = {};
    var optionsFields = getOptionsFields();

    // Function used in the data explorer edit view.
    service.generateFormFields = generateFormFields;
    service.generateCreatedUpdatedField = generateCreatedUpdatedField;

    return service;

    // Private functions.

    function generateFormFields(attributes) {
      // Init the list of fields.
      var fields = [];

      // For each attributes of the model.
      angular.forEach(attributes, function (attribute, key) {
        // The attribute must be an object.
        if (!angular.isObject(attribute)) {
          return;
        }

        // Format values.
        attribute = attribute || {};
        attribute.type = optionsFields[attribute.type] ? attribute.type : 'string';

        // Filter attributes having relations (model or collection).
        if (attribute.model || attribute.collection) {
          return;
        }

        // Skip theses keys.
        var ignoredKeys = ['id', 'template', 'id_ref', 'lang', 'createdAt', 'updatedAt'];
        if (ignoredKeys.indexOf(key) > -1) {
          return;
        }

        // Init the field object.
        var field = angular.copy(optionsFields[attribute.type]) || {};

        // Disabled keys.
        var disabledKeys = [];
        if (disabledKeys.indexOf(key) > -1) {
          field = angular.copy(optionsFields.string);
          field.templateOptions.disabled = true;
        }

        // Set the key as a value of the field.
        field.key = key;

        // Format label and placeholder for better display.
        field.templateOptions.label = $filter('humanize')(key);
        field.templateOptions.placeholder = field.templateOptions.placeholder || _.capitalize(key);

        // Specific attributes.
        angular.forEach(field.templateOptions.waterlineOptions, function (waterlineAttr, key) {
          if (attribute[waterlineAttr]) {
            field.templateOptions[key] = attribute[waterlineAttr];
          } else {
            delete field.templateOptions[key];
          }
        });

        // Delete the waterlineOptions object
        delete field.waterlineOptions;

        // Auto focus on first field.
        if (fields.length === 0) {
          field.templateOptions.focus = true;
        }

        // Finally push to the fields list
        fields.push(field);
      });

      return fields;
    }

    /**
     * Function used to generate `createdAt` and `updatedAt` fields.
     *
     * @param item
     * @returns {Array}
     */

    function generateCreatedUpdatedField(item) {
      var fields = [];

      var createdAtField = angular.copy(optionsFields.date) || {};
      createdAtField.key = 'createdAt';
      createdAtField.name = 'createdAt';
      createdAtField.templateOptions.label = 'Created At';
      createdAtField.templateOptions.placeholder = 'Created At';
      fields.push(createdAtField);

      if (item.id) {
        var updatedAtField = angular.copy(optionsFields.date) || {};
        updatedAtField.key = 'updatedAt';
        updatedAtField.name = 'updatedAt';
        updatedAtField.templateOptions.label = 'Updated At';
        updatedAtField.templateOptions.placeholder = 'Updated At';
        fields.push(updatedAtField);
      }

      return fields;
    }

    /**
     * Simple function which returns the list of possible Waterline possible attributes
     * with appropriated options for the `angular-formly` module.
     *
     * @returns {{}}
     */

    function getOptionsFields() {
      return {
        string: {
          type: 'input',
          templateOptions: {
            type: 'text',
            waterlineOptions: {
              // Waterline
              minlength: 'minLength',
              maxlength: 'maxLength',
              required: 'required'
            }
          }
        },
        email: {
          type: 'input',
          templateOptions: {
            type: 'email',
            waterlineOptions: {
              // Waterline
              minlength: 'minLength',
              maxlength: 'maxLength',
              required: 'required'
            }
          }
        },
        text: {
          type: 'textarea',
          templateOptions: {
            type: 'text',
            waterlineOptions: {
              // Waterline
              minlength: 'minLength',
              maxlength: 'maxLength',
              required: 'required'
            }
          }
        },
        integer: {
          type: 'input',
          templateOptions: {
            type: 'number',
            waterlineOptions: {
              // Waterline
              min: 'min',
              max: 'max',
              required: 'required'
            }
          }
        },
        float: {
          type: 'input',
          templateOptions: {
            type: 'number',
            waterlineOptions: {
              // Waterline
              min: 'min',
              max: 'max',
              required: 'required'
            }
          }
        },
        date: {
          type: 'datepicker',
          templateOptions: {
            label: 'Date',
            type: 'text',
            datepickerPopup: 'dd-MMMM-yyyy'
          }
        },
        datetime: {
          type: 'datepicker',
          templateOptions: {
            label: 'Date',
            type: 'text',
            datepickerPopup: 'dd-MMMM-yyyy'
          }
        },
        boolean: {
          type: 'radio',
          templateOptions: {
            options: [
              {
                name: 'True',
                value: true
              },
              {
                name: 'False',
                value: false
              },
              {
                name: 'Unknown',
                value: undefined
              }
            ]
          }
        },
        // Not supported yet
        // binary: {},
        array: {
          type: 'array',
          templateOptions: {
            placeholder: 'Insert values separated with comas.'
          }
        },
        json: {
          type: 'json',
          templateOptions: {
            placeholder: 'Insert a valid JSON.'
          }
        }
      };
    }
  }
})();

(function () {
  'use strict';

  // Module configuration
  angular.module('frontend.strapi.explorer')
    .config([
      '$stateProvider',
      function ($stateProvider) {
        var menuGroup = 'explorer';

        $stateProvider
          .state('strapi.explorer', {
            abstract: true
          })
          .state('strapi.explorer.home', {
            url: '/strapi/explorer',
            data: {
              access: 1,
              menuGroup: menuGroup
            },
            views: {
              'content@': {
                templateUrl: '/frontend/strapi/explorer/explorer.html'
              }
            }
          })
          // List data view.
          .state('strapi.explorer.list', {
            url: '/strapi/explorer/:model',
            data: {
              access: 1,
              menuGroup: menuGroup
            },
            views: {
              'content@': {
                templateUrl: '/frontend/strapi/explorer/explorer-list.html',
                controller: 'ExplorerListController as ExplorerListCtrl'
              }
            },
            params: {
              where: undefined
            }
          })
          // Create data view.
          .state('strapi.explorer.list.create', {
            url: '/create',
            data: {
              access: 1,
              menuGroup: menuGroup
            },
            views: {
              'content@': {
                templateUrl: '/frontend/strapi/explorer/explorer-edit.html',
                controller: 'ExplorerEditController as ExplorerEditCtrl',
                resolve: {
                  _entry: function () {
                    return undefined;
                  }
                }
              }
            }
          })
          // Edit data view.
          .state('strapi.explorer.list.edit', {
            url: '/:entryId',
            data: {
              access: 1,
              menuGroup: menuGroup
            },
            views: {
              'content@': {
                templateUrl: '/frontend/strapi/explorer/explorer-edit.html',
                controller: 'ExplorerEditController as ExplorerEditCtrl',
                resolve: {
                  _entry: ['$stateParams', 'DataModel', function ($stateParams, DataModel) {
                    var model = new DataModel('admin/explorer/' + $stateParams.model);

                    return model.fetch($stateParams.entryId);
                  }]
                }
              }
            }
          });
      }
    ]);
})();

(function () {
  'use strict';

  /**
   * Directive used to create links, through collection, in the Data Explorer list views.
   */
  angular.module('frontend.strapi.explorer')
    .directive('goToCollection', goToCollection);

  goToCollection.$inject = ['$state', '_', '$window'];

  function goToCollection($state, _, $window) {
    var directive = {
      restrict: 'A',
      link: function link(scope) {
        scope.goToCollection = function (collection, currentModel, newModel, targetBlank) {
          var where = {
            // Filter according to the list of `ids`.
            id: _.map(collection, function (item) {
              return item.id;
            })
          };

          // Name of the state of the Data Explorer list view.
          var state = 'strapi.explorer.list';

          // State parameters used as params for the link.
          var stateParams = {
            model: newModel,
            where: where
          };

          // Choose behavior according to `targetBlank` parameter
          // (open, or not, in a new tab).
          if (targetBlank) {
            // Build the url.
            var url = $state.href(state, stateParams);
            url += '?where=' + encodeURIComponent(angular.toJson(where));

            // Open the link in a new tab.
            $window.open(url, '_blank');
          } else {
            // Go the state with params.
            $state.go(state, stateParams, {
              inherit: false
            });
          }
        };
      }
    };

    return directive;
  }
})();

(function () {
  'use strict';

  /**
   * This is the controller of the list view of the Data Explorer. Most of the queries are
   * based on the Waterline query language. For more information, please refer to the Waterline documentation.
   */
  angular.module('frontend.strapi.explorer')
    .controller('ExplorerListController', ExplorerListController);

  ExplorerListController.$inject = ['$stateParams',
    'configService',
    '$localStorage',
    'confirmationModal',
    'messageService',
    '_',
    '$filter',
    '$location',
    'DataModel',
    '$q',
    '$http',
    'Config',
    '$scope',
    'userService'];

  function ExplorerListController($stateParams,
                                  configService,
                                  $localStorage,
                                  confirmationModal,
                                  messageService,
                                  _,
                                  $filter,
                                  $location,
                                  DataModel,
                                  $q,
                                  $http,
                                  Config,
                                  $scope,
                                  userService) {

    // Init variables.
    var vm = this;
    var loadParams = {};
    var dataModel;

    var paginationPageSizeDefault = 15;
    var pageRequest;
    var countRequest;

    // Check URL Params.
    var initParams = {
      skip: isNaN($location.search().skip) ? 0 : Number($location.search().skip),
      limit: isNaN($location.search().limit) ? paginationPageSizeDefault : Number($location.search().limit),
      sort: $location.search().sort && $location.search().sort.split(' ') && $location.search().sort.split(' ')[1],
      sortColumn: $location.search().sort && $location.search().sort.split(' ') && $location.search().sort.split(' ')[0]
    };
    initParams.page = initParams.skip === 0 ? 1 : initParams.limit / initParams.skip + 1;

    // Grid settings.
    var paginationOptions = {
      pageNumber: initParams.page,
      pageSize: initParams.limit,
      sort: initParams.sort || 'desc',
      sortColumn: initParams.sortColumn || 'createdAt'
    };

    _init();

    // Private functions.

    /**
     * Function called when the value of the search input changed
     */
    function searchChanged() {
      if (vm.search) {
        loadParams.where = loadParams.where || {};
        loadParams.where.or = [];
        loadParams.where.or.push({
          id: vm.search
        });

        angular.forEach(vm.displayedAttributes, function (attribute) {
          var displayedAttributeParam = {};
          displayedAttributeParam[attribute] = {
            contains: vm.search
          };
          loadParams.where.or.push(displayedAttributeParam);
        });
      } else if (_.keys(loadParams.where).length > 1) {
        delete loadParams.where.or;
      } else if (loadParams.where) {
        delete loadParams.where;
      }

      getPage();
    }

    /**
     * Function called when the `Empty filters` button is clicked.
     */
    function emptyFilters() {
      // Empty the search query.
      vm.search = '';
      delete loadParams.where;

      // Reload the list of items.
      getPage();
    }

    /**
     * Sort changed (ui-grid).
     */
    function sortChanged() {
      if (paginationOptions.sortColumn && paginationOptions.sort) {
        // Invert the sort order.
        var order = paginationOptions.sort === 'desc' ? ' desc' : ' asc';
        loadParams.sort = paginationOptions.sortColumn + order;
      } else {
        // Remove the sort param.
        loadParams.sort = null;
      }

      // Reload the list of items.
      getPage();
    }

    /**
     * Pagination changed (ui-grid).
     */
    function paginationChanged() {
      // Set the number of entries to skip.
      loadParams.skip = (paginationOptions.pageNumber - 1) * paginationOptions.pageSize;

      // Reload the list of items.
      getPage();
    }

    /**
     * Main function used to get the list of items.
     */
    function getPage() {

      // Start loading.
      vm.loading = true;

      // Set the limit.
      loadParams.limit = paginationOptions.pageSize;

      // Cancel the previous request.
      if (pageRequest && pageRequest.cancel) {
        pageRequest.cancel();
      }

      // Empty search params.
      angular.forEach($location.search(), function (value, key) {
        $location.search(key, undefined);
      });

      // Set search params.
      angular.forEach(loadParams, function (value, key) {
        $location.search(key, angular.isObject(value) ? angular.toJson(value) : value);
      });
      $location.search('search', vm.search);

      // Init the request.
      pageRequest = dataModel.load(loadParams);
      countRequest = dataModel.count(loadParams);

      $q.all({
        items: pageRequest.promise,
        count: countRequest
      })
        .then(function (results) {
          // Pass the results to the grid options in
          // order to display them.
          vm.gridOptions.data = results.items.data;
          vm.gridOptions.totalItems = results.count.data;

          // Not loading anymore.
          vm.loading = false;

          // First load is done.
          vm.firstLoad = false;
        })
        .catch(function () {
          // Not loading anymore.
          vm.loading = false;
        });
    }

    /**
     * Helper for ui-grid resizing.
     *
     * @returns {{height: string}}
     */
    vm.getTableStyle = function () {
      var rowHeight = 30;
      var headerHeight = 45;
      var height = (paginationOptions.pageSize * rowHeight + headerHeight) + (vm.gridOptions.enableFiltering ? 50 : 20);

      // Should be moved in a directive.
      document.querySelector('.ui-grid-viewport').style.height = height + 'px';

      return {
        height: height + 'px'
      };
    };

    /**
     * Delete an entry.
     *
     * @param {String} id
     */
    function deleteEntry(id) {
      // Open the confirmation modal in order to prevent
      // accidental clicks.
      confirmationModal.open()
        .then(function () {
          dataModel.delete(id)
            .then(function success() {
              // Success message.
              messageService.success('The entry has been deleted', 'Success');

              // Delete the item for the current list.
              var index = _.findIndex(vm.gridOptions.data, {id: id});
              vm.gridOptions.data.splice(index, 1);

              // Reload the list of items.
              getPage();
            });
        });
    }

    /**
     * Prevent user auto-deletion.
     *
     * @param entryId
     * @returns {boolean}
     */
    function hideDeleteButton(entryId) {
      var isUserModel = vm.configModel.identity === 'user';
      var currentUserId = userService.user().id;
      return isUserModel && entryId === currentUserId;
    }

    /**
     * First function launched.
     *
     * @private
     */
    function _init() {
      // `vm` variables.
      vm.loading = true;
      vm.firstLoad = true;
      vm.configModel = configService.getConfig().models[$stateParams.model];
      vm.getPage = getPage;
      vm.emptyFilters = emptyFilters;
      vm.searchChanged = searchChanged;
      vm.displayedAttributes = [];

      // Here we have to use the `$scope` because of the `angular-ui-grid` module.
      $scope.deleteEntry = deleteEntry;
      $scope.hideDeleteButton = hideDeleteButton;

      // Init a new instance of the `DataModel` service.
      dataModel = new DataModel('admin/explorer/' + vm.configModel.identity);

      // Add the `count` function to the `DataModel` service instance.
      dataModel.count = function (loadParams) {
        return $http.get(Config.backendUrl + '/admin/explorer/' + vm.configModel.identity + '/count', loadParams);
      };

      // Format `loadParams` according to the URL params.
      loadParams = {};
      angular.forEach($location.search(), function (param, key) {
        try {
          param = JSON.parse(param);
        } catch (err) {
        }

        if (param) {
          loadParams[key] = isNaN(param) ? param : Number(param);
        }
      });
      loadParams.sort = paginationOptions.sortColumn + ' ' + paginationOptions.sort;
      loadParams.where = loadParams.where ? loadParams.where : $stateParams.where;
      vm.search = loadParams.search;
      delete loadParams.search;

      // Use the `displayedAttribute` of the model.
      if (configService.getConfig().models[$stateParams.model].displayedAttribute) {
        vm.displayedAttributes.push(configService.getConfig().models[$stateParams.model].displayedAttribute);
      }

      angular.forEach(configService.getConfig().models[$stateParams.model].templates, function (template) {
        if (template.displayedAttribute && vm.displayedAttributes.indexOf(template.displayedAttribute) === -1) {
          vm.displayedAttributes.push(template.displayedAttribute);
        }
      });

      // `angular-ui-grid` module options.
      vm.gridOptions = {
        enableColumnResizing: true,
        rowTemplate: '<div ng-class="{ \'my-css-class\': grid.appScope.rowFormatter( row ) }">' +
        '  <div ng-if="row.entity.merge">{{row.entity.title}}</div>' +
        '  <div ng-if="!row.entity.merge" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
        '</div>',
        data: [],
        paginationPageSizes: [paginationPageSizeDefault, 50, 100],
        paginationPageSize: initParams.limit,
        enableGridMenu: true,
        enableFiltering: false,
        onRegisterApi: function (gridApi) {
          vm.gridApi = gridApi;
          getPage(vm.gridApi.grid, [vm.gridOptions.columnDefs[1]]);
          vm.gridApi.core.on.sortChanged(null, function (grid, sortColumns) {
            if (sortColumns.length === 0) {
              paginationOptions.sort = null;
              paginationOptions.sortColumn = null;
            } else {
              paginationOptions.sort = sortColumns[0].sort.direction;
              paginationOptions.sortColumn = sortColumns[0].field;
            }
            vm.gridOptions.paginationCurrentPage = 1;
            paginationOptions.pageNumber = 1;
            sortChanged();
          });
          vm.gridApi.pagination.on.paginationChanged(null, function (newPage, pageSize) {
            paginationOptions.pageNumber = newPage;
            paginationOptions.pageSize = pageSize;
            paginationChanged();
          });
          vm.gridApi.colMovable.on.columnPositionChanged(null, function (colDef, originalPosition, newPosition) {
            function generateColumOrder() {
              // Remove fron original position
              vm.gridOptions.columnDefs.splice(originalPosition, 1);
              // Add to new position
              vm.gridOptions.columnDefs.splice(newPosition, 0, colDef);
            }

            generateColumOrder();
            $localStorage.explorer[configService.getConfig().appName][vm.configModel.identity].columnDefs = vm.gridOptions.columnDefs;
          });
        },
        useExternalPagination: true,
        useExternalSorting: true,
        paginationCurrentPage: initParams.page
      };

      vm.gridOptions.totalItems = 100;

      // Check local storage params to display appropriated attributes.
      function checkLocalStorage() {
        $localStorage.explorer = angular.isObject($localStorage.explorer) ? $localStorage.explorer : {};
        $localStorage.explorer[configService.getConfig().appName] = angular.isObject($localStorage.explorer[configService.getConfig().appName]) ? $localStorage.explorer[configService.getConfig().appName] : {};
        $localStorage.explorer[configService.getConfig().appName][vm.configModel.identity] = angular.isObject($localStorage.explorer[configService.getConfig().appName][vm.configModel.identity]) ? $localStorage.explorer[configService.getConfig().appName][vm.configModel.identity] : {};
      }

      checkLocalStorage();

      /**
       * Generate the columns for the `angular-ui-grid` module.
       *
       * @returns {Array}
       */
      function generateColumnDefs() {
        var columns = [];
        _.forEach(vm.configModel.attributes, function (value, key) {
          var column = {
            name: key,
            visible: false
          };
          if (key === 'id') {
            column.visible = true;
            column.cellTemplate = '<div class="ui-grid-cell-contents"><a data-ui-sref="strapi.explorer.list.edit({model: \'' + vm.configModel.identity + '\',entryId:COL_FIELD})">{{COL_FIELD CUSTOM_FILTERS}}</a></div>';
          }
          if (vm.displayedAttributes.indexOf(key) !== -1) {
            column.visible = true;
            column.cellTemplate = '<div class="ui-grid-cell-contents"><a data-ui-sref="strapi.explorer.list.edit({model: \'' + vm.configModel.identity + '\',entryId:row.entity.id})">{{COL_FIELD CUSTOM_FILTERS}}</a></div>';
          }
          if (value.type === 'date' || value.type === 'datetime') {
            column.cellTemplate = '<div class="ui-grid-cell-contents"><span>{{COL_FIELD | date}}</a></div>';
          }
          if (value.model) {
            column.visible = true;
            column.enableSorting = false;
            column.cellTemplate = '<div class="ui-grid-cell-contents"><a data-ui-sref="strapi.explorer.list.edit({model: \'' + value.model + '\',entryId:COL_FIELD.id})">{{COL_FIELD[\'' + configService.getConfig().models[value.model].displayedAttribute + '\' || \'id\'] CUSTOM_FILTERS}}</a></div>';
          }
          if (value.collection) {
            column.visible = true;
            column.enableSorting = false;
            column.cellTemplate = '<div class="ui-grid-cell-contents"><a class="cursor-pointer" data-go-to-collection ng-click="goToCollection(COL_FIELD, \'' + vm.configModel.identity + '\', \'' + value.collection + '\')">See ' + $filter('pluralize')(value.collection) + ' ({{COL_FIELD.length}})</a></div>';
          }
          if (key === 'createdAt') {
            column.visible = true;
          }
          if (key === paginationOptions.sortColumn) {
            column.sort = {
              direction: paginationOptions.sort === 'asc' ? 'asc' : 'desc'
            };
          }
          columns.push(column);
        });

        var defaultColumns = {
          id: {
            newPosition: 0
          }
        };

        angular.forEach(defaultColumns, function () {
          angular.forEach(columns, function (column, i) {
            if (defaultColumns[column.name]) {
              defaultColumns[column.name].originalPosition = i;
            }
          });
        });

        angular.forEach(defaultColumns, function (value) {
          if (value.originalPosition) {
            var columnCopy = angular.copy(columns[value.originalPosition]);
            columns.splice(value.originalPosition, 1);
            columns.splice(value.newPosition, 0, columnCopy);
          }
        });

        columns.push({
          cellTemplate: '<div class="ui-grid-cell-contents text-center">' +
          '<button class="explorer-action-btn btn btn-success btn-sm" data-ui-sref="strapi.explorer.list.edit({model:\'' + vm.configModel.identity + '\', entryId: row.entity.id})">Edit</button>' +
          '<button ng-hide="grid.appScope.hideDeleteButton(row.entity.id)" class="explorer-action-btn btn btn-warning btn-sm" data-ng-click="grid.appScope.deleteEntry(row.entity.id, row)">Delete</button>' +
          '</div>',
          enableSorting: false,
          field: 'Actions'
        });

        return columns;
      }

      // Get columns from the local storage or generate them.
      if ($localStorage.explorer[configService.getConfig().appName][vm.configModel.identity].columnDefs) {
        vm.gridOptions.columnDefs = $localStorage.explorer[configService.getConfig().appName][vm.configModel.identity].columnDefs;
      } else {
        vm.gridOptions.columnDefs = generateColumnDefs();
      }
    }
  }
})();

(function () {
  'use strict';

  angular.module('frontend.strapi.explorer')
    .controller('ExplorerEditController', ExplorerEditController);

  ExplorerEditController.$inject = ['_entry',
    'explorerService',
    'configService',
    '$stateParams',
    '$state',
    'messageService',
    'confirmationModal',
    '$filter',
    '_',
    'DataModel',
    '$scope',
    'userService',
    'stringService',
    'Config',
    '$http',
    '$localStorage'];

  function ExplorerEditController(_entry,
                                  explorerService,
                                  configService,
                                  $stateParams,
                                  $state,
                                  messageService,
                                  confirmationModal,
                                  $filter,
                                  _,
                                  DataModel,
                                  $scope,
                                  userService,
                                  stringService,
                                  Config,
                                  $http,
                                  $localStorage) {

    // Init variables.
    var vm = this;
    var configModel = vm.configModel = configService.getConfig().models[$stateParams.model];
    var dataModel = new DataModel('admin/explorer/' + $stateParams.model);
    var backupModel = angular.copy(_entry) || {};

    // `vm` variables.
    vm.resetModel = resetModel;
    vm.refreshSuggestions = refreshSuggestions;
    vm.templateChanged = templateChanged;
    vm.onSubmit = onSubmit;
    vm.deleteEntry = deleteEntry;
    vm.changeUserPasswordType = changeUserPasswordType;
    vm.generateRandomPassword = generateRandomPassword;
    vm.toggleUserPasswordDisplayField = toggleUserPasswordDisplayField;

    // `$scope` variables.
    $scope.getDisplayedAttribute = getDisplayedAttribute;

    // Private functions.

    /*
     * Reset the model as it was when the page loaded.
     */
    function resetModel() {
      vm.model = angular.copy(backupModel);
    }

    /**
     * Function used to refresh the list of items suggested in the relations.
     *
     * @param relation
     * @param search
     * @param entries
     * @param reset
     */
    function refreshSuggestions(relation, search, entries, reset) {
      // Cancel the previous request.
      if (relation.dataLoad) {
        relation.dataLoad.cancel();
      }

      // Empty the params object.
      var loadParams = {};

      // Init a new instance of the `DataModel` service.
      var dataModel = new DataModel('admin/explorer/' + (relation.model || relation.collection));

      // Default values of the list of entries.
      entries = entries || [];

      if (relation.previousSearch !== search || reset) {
        relation.suggestions = [];
        relation.skip = 0;
        relation.endLoad = false;
      } else if (relation.endLoad) {
        return;
      } else {
        relation.skip = (relation.skip + 10) || 0;
      }

      relation.limit = relation.limit || 10;
      relation.suggestions = relation.suggestions || [];
      relation.loading = true;
      relation.previousSearch = search;

      loadParams.where = {};
      loadParams.populate = [];
      loadParams.limit = relation.limit;
      loadParams.skip = relation.skip;

      if (search) {
        loadParams.where[relation.displayedAttribute] = {
          contains: search
        };
      }

      if (entries.length) {
        loadParams.where.id = {
          '!': _.map(entries, function (entry) {
            return entry.id;
          })
        };
      }

      relation.dataLoad = dataModel.load(loadParams);

      relation.dataLoad
        .promise
        .success(function (response) {
          if (response.length) {
            angular.forEach(response, function (result) {
              relation.suggestions.push(result);
            });
            if (relation.model) {
              var empty = {};
              empty[$scope.getDisplayedAttribute(relation)] = 'Leave empty';
              empty.id = null;
              relation.suggestions.push(empty);
            }
          } else {
            relation.endLoad = true;
          }

          // Loading is done.
          relation.loading = false;

          if (!relation.suggestions.length && vm.model[relation.key] && !vm.model[relation.key].length) {
            relation.suggestions.push({createLink: true});
          }
        })
        .catch(function () {
          // Reset the list of suggestions.
          relation.suggestions = [];

          // Loading is done.
          relation.loading = false;
        });
    }

    /**
     * Function used when the user selects a specific template. Generate the new
     * list of fields.
     */
    function templateChanged() {
      generateFields(configModel.templates[vm.model.template].attributes);
    }

    function onSubmit() {
      vm.submitting = true;

      // Format the relations of the model.
      var formattedModel = reduceModelRelations(angular.copy(vm.model));
      _.forEach(formattedModel, function (value, key) {
        formattedModel[key] = value || '';
      });

      if (formattedModel.id) {
        // Updating.
        dataModel.update(formattedModel.id, formattedModel)
          .then(function success(response) {
            vm.model = response.data;
            vm.submitting = false;

            // Success message.
            messageService.success('The ' + $stateParams.model + ' has been updated', 'Success');

            // Go to the list view.
            $state.go('strapi.explorer.list', {
              model: configModel.identity
            });

            // Update registered user username.
            if ($state.params.model === 'user' && userService.user().id === response.data.id) {
              $localStorage.credentials.user = response.data;
            }
          })
          .catch(function error() {
            vm.submitting = false;
          });
      } else if ($state.params.model === 'user') {
        // The user is trying to register a new user. So we call a specific route.
        $http.post(Config.backendUrl + '/auth/local/register', formattedModel)
          .then(function success(response) {
            vm.submitting = false;
            backupModel = angular.copy(response.data.user);
            $state.go('strapi.explorer.list', {
              model: configModel.identity
            });
            messageService.success('The entry has been created', 'Success');
          })
          .catch(function error() {
            vm.submitting = false;
          });
      } else {
        dataModel.create(formattedModel)
          .then(function success(response) {
            vm.submitting = false;
            backupModel = angular.copy(response && response.data);
            $state.go('strapi.explorer.list', {
              model: configModel.identity
            });
            messageService.success('The entry has been created', 'Success');
          })
          .catch(function error() {
            vm.submitting = false;
          });
      }
    }

    /**
     * Delete the current entry.
     */
    function deleteEntry() {
      confirmationModal.open()
        .then(function () {
          dataModel.delete(vm.model.id)
            .then(function success() {
              // Succes message.
              messageService.success('The ' + $stateParams.model + ' has been deleted', 'Success');

              // Go to the list view.
              $state.go('strapi.explorer.list', {
                model: configModel.identity
              });
            })
            .catch(function error() {
            });
        });
    }

    /**
     * Return the `displayedAttribute` of the current model.
     *
     * @param relation
     * @param template
     * @returns {*|templates|{toast, progressbar}|string}
     */
    function getDisplayedAttribute(relation, template) {
      var model = configService.getConfig().models[relation.model || relation.collection];
      return model && model.templates && model.templates[template] && model.templates[template].displayedAttribute || model.displayedAttribute;
    }

    /**
     *  Change the type of the password input.
     *  Switch between text and password.
     */
    function changeUserPasswordType() {
      if (vm.userPasswordInput && vm.userPasswordInput.type === 'password') {
        vm.userPasswordInput = {
          type: 'text',
          action: 'Hide'
        };
      } else {
        vm.userPasswordInput = {
          type: 'password',
          action: 'Display'
        };
      }
    }

    /**
     * Generate a random passord and assign
     * in to the password field of the current model.
     */
    function generateRandomPassword() {
      vm.model.password = stringService.random(10);
      vm.userPasswordInput = {
        type: 'text',
        action: 'Hide'
      };
    }

    /**
     * Display, or not, the user password field.
     */
    function toggleUserPasswordDisplayField() {
      if (vm.displayUserPasswordField) {
        vm.displayUserPasswordField = false;
        if ($state.params.model === 'user') {
          delete vm.model.password;
        }
      } else {
        delete vm.model.password;
        vm.displayUserPasswordField = true;
      }
    }

    /**
     * Helper
     *
     * @param attributesForFields
     */
    function generateFields(attributesForFields) {
      vm.fields = explorerService.generateFormFields(attributesForFields);
      vm.createdUpdatedFields = explorerService.generateCreatedUpdatedField(vm.model);
    }

    /**
     * Helper
     *
     * @param model
     * @returns {*}
     */
    function reduceModelRelations(model) {
      angular.forEach(vm.relations, function (relation) {
        if (relation.collection) {
          angular.forEach(model[relation.key], function (value, i) {
            model[relation.key][i] = value.id;
          });
        } else if (relation.model) {
          model[relation.key] = model[relation.key] && model[relation.key].id;
        }
      });
      return model;
    }

    _init();

    /**
     * Function called at the first page load.
     * @private
     */

    function _init() {
      vm.submitting = false;

      var defaultEntry = {
        createdBy: userService.user(),
        createdAt: new Date(),
        contributors: [userService.user()]
      };

      // Format the model.
      vm.model = _entry || defaultEntry;

      // Change the behavior according to the presence of
      // templates in the current model.
      if (configModel.templates) {
        vm.model.template = vm.model.template || _.keys(configModel.templates)[0];
        generateFields(configModel.templates[vm.model.template].attributes);
      } else {
        generateFields(configModel.attributes);
      }

      // Display user password.
      if ($state.params.model === 'user') {
        vm.userPasswordInput = {
          type: 'password',
          action: 'Display'
        };
        if (!vm.model.id) {
          vm.displayUserPasswordField = true;
        }
      }

      // List of the relations
      vm.relations = _.map(_.filter(configModel.attributes, function (relation, key) {
        relation.key = key;
        if (relation.collection) {
          vm.model[key] = vm.model[key] || [];
        }

        // To improve creation page.
        if (relation.key !== 'updatedBy' || vm.model.id) {
          return relation.model || relation.collection;
        }
      }), function (relation) {
        relation.name = relation.model || relation.collection;
        relation.formattedName = relation.model ? relation.name : $filter('pluralize')(relation.name);
        relation.displayedAttribute = configService.getConfig().models[relation.name].displayedAttribute || 'id';
        vm.refreshSuggestions(relation);
        return relation;
      });

      // Infinite scroll config for relations lists.
      vm.infiniteScroll = {};
      vm.infiniteScroll.numToAdd = 20;
      vm.infiniteScroll.currentItems = 20;

      // Lang attribute.
      if (configModel.attributes.lang) {
        vm.model.lang = vm.model.lang || configService.getConfig().settings.i18n.defaultLocale;
      }
    }
  }
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.strapi.dashboard', []);
})();

(function () {
  'use strict';

  // Module configuration.
  angular.module('frontend.strapi.dashboard')
    .config([
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('strapi.dashboard', {
            url: '/',
            data: {
              access: 1
            },
            views: {
              'content@': {
                templateUrl: '/frontend/strapi/dashboard/dashboard.html'
              }
            }
          });
      }
    ]);
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core.templates', []);
})();

(function () {
  'use strict';

  /**
   * Templates for the `datepicker ui bootstrap` module.
   */
  angular.module('frontend.core.templates')
    .run(['$templateCache', function ($templateCache) {

      $templateCache.put('template/datepicker/day.html',
        '<table role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n' +
        '  <thead>\n' +
        '    <tr>\n' +
        '      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-left\"></i></button></th>\n' +
        '      <th colspan=\"{{::5 + showWeeks}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n' +
        '      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-right\"></i></button></th>\n' +
        '    </tr>\n' +
        '    <tr>\n' +
        '      <th ng-if=\"showWeeks\" class=\"text-center\"></th>\n' +
        '      <th ng-repeat=\"label in ::labels track by $index\" class=\"text-center\"><small aria-label=\"{{::label.full}}\">{{::label.abbr}}</small></th>\n' +
        '    </tr>\n' +
        '  </thead>\n' +
        '  <tbody>\n' +
        '    <tr ng-repeat=\"row in rows track by $index\">\n' +
        '      <td ng-if=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n' +
        '      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{::dt.uid}}\" ng-class=\"::dt.customClass\">\n' +
        '        <button type=\"button\" style=\"min-width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{\'btn-info\': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"::{\'text-muted\': dt.secondary, \'text-info\': dt.current}\">{{::dt.label}}</span></button>\n' +
        '      </td>\n' +
        '    </tr>\n' +
        '  </tbody>\n' +
        '</table>\n' +
        '');

      $templateCache.put('template/datepicker/month.html',
        'table role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n' +
        '  <thead>\n' +
        '    <tr>\n' +
        '      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-left\"></i></button></th>\n' +
        '      <th><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n' +
        '      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-right\"></i></button></th>\n' +
        '    </tr>\n' +
        '  </thead>\n' +
        '  <tbody>\n' +
        '    <tr ng-repeat=\"row in rows track by $index\">\n' +
        '      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{::dt.uid}}\" ng-class=\"::dt.customClass\">\n' +
        '        <button type=\"button\" style=\"min-width:100%;\" class=\"btn btn-default\" ng-class=\"{\'btn-info\': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"::{\'text-info\': dt.current}\">{{::dt.label}}</span></button>\n' +
        '      </td>\n' +
        '    </tr>\n' +
        '  </tbody>\n' +
        '</table>\n' +
        '');

      $templateCache.put('template/datepicker/popup.html',
        '<ul class=\"dropdown-menu\" ng-if=\"isOpen\" style=\"display: block\" ng-style=\"{top: position.top+\'px\', left: position.left+\'px\'}\" ng-keydown=\"keydown($event)\" ng-click=\"$event.stopPropagation()\">\n' +
        '	<li ng-transclude></li>\n' +
        '	<li ng-if=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n' +
        '		<span class=\"btn-group pull-left\">\n' +
        '			<button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"select(\'today\')\">{{ getText(\'current\') }}</button>\n' +
        '			<button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"select(null)\">{{ getText(\'clear\') }}</button>\n' +
        '		</span>\n' +
        '		<button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"close()\">{{ getText(\'close\') }}</button>\n' +
        '	</li>\n' +
        '</ul>\n' +
        '');

      $templateCache.put('template/datepicker/year.html',
        '<table role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n' +
        '  <thead>\n' +
        '    <tr>\n' +
        '      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-left\"></i></button></th>\n' +
        '      <th colspan=\"3\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n' +
        '      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"fa fa-chevron-right\"></i></button></th>\n' +
        '    </tr>\n' +
        '  </thead>\n' +
        '  <tbody>\n' +
        '    <tr ng-repeat=\"row in rows track by $index\">\n' +
        '      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center\" role=\"gridcell\" id=\"{{::dt.uid}}\">\n' +
        '        <button type=\"button\" style=\"min-width:100%;\" class=\"btn btn-default\" ng-class=\"{\'btn-info\': dt.selected, active: isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\"><span ng-class=\"::{\'text-info\': dt.current}\">{{::dt.label}}</span></button>\n' +
        '      </td>\n' +
        '    </tr>\n' +
        '  </tbody>\n' +
        '</table>\n' +
        '');
    }]);
})();

(function () {
  'use strict';

  /**
   * Templates for the `angular-formly` module.
   */
  angular.module('frontend.core.templates')
    .run(['$templateCache', function ($templateCache) {

      $templateCache.put('templates/angular-formly/input-template.html',
        '<input type=\"{{options.templateOptions.type || \'text\'}}\"' +
        '	       class=\"form-control\"' +
        '	       id=\"{{id}}\"' +
        '	       formly-dynamic-name=\"id\"' +
        '	       formly-custom-validation=\"options.validators\"' +
        '	       placeholder=\"{{options.templateOptions.placeholder}}\"' +
        '	       aria-describedby=\"{{id}}_description\"' +
        '	       ng-required=\"options.templateOptions.required\"' +
        '	       ng-disabled=\"options.templateOptions.disabled\"' +
        '	       ng-model=\"model[options.key]\">');

      $templateCache.put('templates/angular-formly/textarea-template.html',
        '<textarea' +
        '	       class=\"form-control\"' +
        '	       id=\"{{id}}\"' +
        '	       formly-dynamic-name=\"id\"' +
        '	       formly-custom-validation=\"options.validators\"' +
        '	       placeholder=\"{{options.templateOptions.placeholder}}\"' +
        '	       aria-describedby=\"{{id}}_description\"' +
        '	       ng-required=\"options.templateOptions.required\"' +
        '	       ng-disabled=\"options.templateOptions.disabled\"' +
        '	       ng-model=\"model[options.key]\"><\/textarea>');

      $templateCache.put('templates/angular-formly/input-checkbox.html',
        '<input type=\"checkbox\"' +
        '             id=\"{{id}}\"' +
        '             formly-dynamic-name=\"id\"' +
        '             formly-custom-validation=\"options.validators\"' +
        '             aria-describedby=\"{{id}}_description\"' +
        '             ng-required=\"options.templateOptions.required\"' +
        '             ng-disabled=\"options.templateOptions.disabled\"' +
        '             ng-model=\"model[options.key]\">' +
        '      {{options.templateOptions.label || \'Checkbox\'}}' +
        '      {{options.templateOptions.required ? \'*\' : \'\'}}');

      $templateCache.put('templates/angular-formly/input-checkbox.html',
        '<formly-transclude></formly-transclude>' +
        '<div ng-messages=\"fc.$error\" ng-if=\"form.$submitted || options.formControl.$touched\" class=\"error-messages\">' +
        '<div ng-message=\"{{ ::name }}\" ng-repeat=\"(name, message) in ::options.validation.messages\" class=\"message\">{{ message(fc.$viewValue, fc.$modelValue, this)}}</div>');

    }]);
})();

(function () {
  'use strict';

  /**
   * String service.
   */
  angular.module('frontend.core.services')
    .factory('stringService', stringService);

  stringService.$inject = [];

  function stringService() {
    var service = {};

    service.random = random;

    return service;

    // Private functions.

    /**
     * Return a random alpha-numeric string.
     *
     * @param {Number}    length
     * @param {string}    chars
     * @returns {string}
       */
    function random(length, chars) {
      var result = '';
      chars = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      length = length || 10;
      for (var i = length; i >= 0; i--) {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
      }
      return result;
    }
  }
})();

(function () {
  'use strict';

  angular.module('frontend.core.services')
    .factory('messageService', messageService);

  messageService.$inject = ['toastr', '_'];

  function messageService(toastr, _) {
    var service = {
      success: success,
      info: info,
      warning: warning,
      error: error
    };

    return service;

    /**
     * Private helper function to make actual message via toastr component.
     *
     * @param   {string}  message         Message content
     * @param   {string}  title           Message title
     * @param   {{}}      options         Message specified options
     * @param   {{}}      defaultOptions  Default options for current message type
     * @param   {string}  type            Message type
     * @private
     */
    function _makeMessage(message, title, options, defaultOptions, type) {
      title = title || '';
      options = options || {};

      toastr[type](message, title, _.assign(defaultOptions, options));
    }

    /**
     * Method to generate 'success' message.
     *
     * @param   {string}  message   Message content
     * @param   {string}  [title]   Message title
     * @param   {{}}      [options] Message options
     */
    function success(message, title, options) {
      var defaultOptions = {
        timeOut: 3000
      };

      _makeMessage(message, title, options, defaultOptions, 'success');
    }

    /**
     * Method to generate 'info' message.
     *
     * @param   {string}  message   Message content
     * @param   {string}  [title]   Message title
     * @param   {{}}      [options] Message options
     */
    function info(message, title, options) {
      var defaultOptions = {
        timeout: 4000
      };

      _makeMessage(message, title, options, defaultOptions, 'info');
    }

    /**
     * Method to generate 'warning' message.
     *
     * @param   {string}  message   Message content
     * @param   {string}  [title]   Message title
     * @param   {{}}      [options] Message options
     */
    function warning(message, title, options) {
      var defaultOptions = {
        timeout: 5000
      };

      _makeMessage(message, title, options, defaultOptions, 'warning');
    }

    /**
     * Method to generate 'error' message.
     *
     * @param   {string}  message   Message content
     * @param   {string}  [title]   Message title
     * @param   {{}}      [options] Message options
     */
    function error(message, title, options) {
      var defaultOptions = {
        timeout: 6000
      };

      _makeMessage(message, title, options, defaultOptions, 'error');
    }
  }
})();

(function () {
  'use strict';

  /**
   * Service used when the app is loaded.
   */
  angular.module('frontend.core.services')
    .factory('initService', initService);

  initService.$inject = ['$q'];

  function initService($q) {
    var service = {};
    var deferred = $q.defer();

    service.deferred = deferred;
    service.promise = deferred.promise;

    return service;
  }
})();

(function () {
  'use strict';

  /*
   * Service to wrap generic HTTP status specified helper methods.
   */
  angular.module('frontend.core.services')
    .factory('httpStatusService', httpStatusService);

  httpStatusService.$inject = [];

  function httpStatusService() {
    var service = {
      getStatusCodeText: getStatusCodeText
    };

    return service;

    // Private functions.

    /**
     * Getter method for HTTP status message by given status code.
     *
     * @param   {Number}  statusCode  HTTP status code
     *
     * @returns {String}              Status message
     */
    function getStatusCodeText(statusCode) {
      var output = '';

      switch (parseInt(statusCode.toString(), 10)) {
        // 1xx Informational
        case -1:
          output = 'Impossible to connect to the server. Check if it is online.';
          break;
        case 100:
          output = 'Continue';
          break;
        case 101:
          output = 'Switching Protocols';
          break;
        case 102:
          output = 'Processing (WebDAV; RFC 2518)';
          break;
        // 2xx Success
        case 200:
          output = 'OK';
          break;
        case 201:
          output = 'Created';
          break;
        case 202:
          output = 'Accepted';
          break;
        case 203:
          output = 'Non-Authoritative Information (since HTTP/1.1)';
          break;
        case 204:
          output = 'No Content';
          break;
        case 205:
          output = 'Reset Content';
          break;
        case 206:
          output = 'Partial Content';
          break;
        case 207:
          output = 'Multi-Status (WebDAV; RFC 4918)';
          break;
        case 208:
          output = 'Already Reported (WebDAV; RFC 5842)';
          break;
        case 226:
          output = 'IM Used (RFC 3229)';
          break;
        // 3xx Redirection
        case 300:
          output = 'Multiple Choices';
          break;
        case 301:
          output = 'Moved Permanently';
          break;
        case 302:
          output = 'Found';
          break;
        case 303:
          output = 'See Other';
          break;
        case 304:
          output = 'Not Modified';
          break;
        case 305:
          output = 'Use Proxy';
          break;
        case 306:
          output = 'Switch Proxy';
          break;
        case 307:
          output = 'Temporary Redirect';
          break;
        case 308:
          output = 'Permanent Redirect (Experimental RFC; RFC 7238)';
          break;
        // 4xx Client Error
        case 400:
          output = 'Bad Request';
          break;
        case 401:
          output = 'Unauthorized';
          break;
        case 402:
          output = 'Payment Required';
          break;
        case 403:
          output = 'Forbidden';
          break;
        case 404:
          output = 'Not Found';
          break;
        case 405:
          output = 'Method Not Allowed';
          break;
        case 406:
          output = 'Not Acceptable';
          break;
        case 407:
          output = 'Proxy Authentication Required';
          break;
        case 408:
          output = 'Request Timeout';
          break;
        case 409:
          output = 'Conflict';
          break;
        case 410:
          output = 'Gone';
          break;
        case 411:
          output = 'Length Required';
          break;
        case 412:
          output = 'Precondition Failed';
          break;
        case 413:
          output = 'Request Entity Too Large';
          break;
        case 414:
          output = 'Request-URI Too Long';
          break;
        case 415:
          output = 'Unsupported Media Type';
          break;
        case 416:
          output = 'Requested Range Not Satisfiable';
          break;
        case 417:
          output = 'Expectation Failed';
          break;
        case 418:
          output = 'I\'m a teapot (RFC 2324)';
          break;
        case 419:
          output = 'Authentication Timeout (not in RFC 2616)';
          break;
        case 420:
          output = 'Method Failure (Spring Framework) / Enhance Your Calm (Twitter)';
          break;
        case 422:
          output = 'Unprocessable Entity (WebDAV; RFC 4918)';
          break;
        case 423:
          output = 'Locked (WebDAV; RFC 4918)';
          break;
        case 424:
          output = 'Failed Dependency (WebDAV; RFC 4918)';
          break;
        case 426:
          output = 'Upgrade Required';
          break;
        case 428:
          output = 'Precondition Required (RFC 6585)';
          break;
        case 429:
          output = 'Too Many Requests (RFC 6585)';
          break;
        case 431:
          output = 'Request Header Fields Too Large (RFC 6585)';
          break;
        case 440:
          output = 'Login Timeout (Microsoft)';
          break;
        case 444:
          output = 'No Response (Nginx)';
          break;
        case 449:
          output = 'Retry With (Microsoft)';
          break;
        case 450:
          output = 'Blocked by Windows Parental Controls (Microsoft)';
          break;
        case 451:
          output = 'Unavailable For Legal Reasons (Internet draft) / Redirect (Microsoft)';
          break;
        case 494:
          output = 'Request Header Too Large (Nginx)';
          break;
        case 495:
          output = 'Cert Error (Nginx)';
          break;
        case 496:
          output = 'No Cert (Nginx)';
          break;
        case 497:
          output = 'HTTP to HTTPS (Nginx)';
          break;
        case 498:
          output = 'Token expired/invalid (Esri)';
          break;
        case 499:
          output = 'Client Closed Request (Nginx) / Token required (Esri)';
          break;
        // 5xx Server Error
        case 500:
          output = 'Internal Server Error';
          break;
        case 501:
          output = 'Not Implemented';
          break;
        case 502:
          output = 'Bad Gateway';
          break;
        case 503:
          output = 'Service Unavailable';
          break;
        case 504:
          output = 'Gateway Timeout';
          break;
        case 505:
          output = 'HTTP Version Not Supported';
          break;
        case 506:
          output = 'Variant Also Negotiates (RFC 2295)';
          break;
        case 507:
          output = 'Insufficient Storage (WebDAV; RFC 4918)';
          break;
        case 508:
          output = 'Loop Detected (WebDAV; RFC 5842)';
          break;
        case 509:
          output = 'Bandwidth Limit Exceeded (Apache bw/limited extension)';
          break;
        case 510:
          output = 'Not Extended (RFC 2774)';
          break;
        case 511:
          output = 'Network Authentication Required (RFC 6585)';
          break;
        case 520:
          output = 'Origin Error (Cloudflare)';
          break;
        case 521:
          output = 'Web server is down (Cloudflare)';
          break;
        case 522:
          output = 'Connection timed out (Cloudflare)';
          break;
        case 523:
          output = 'Proxy Declined Request (Cloudflare)';
          break;
        case 524:
          output = 'A timeout occurred (Cloudflare)';
          break;
        case 598:
          output = 'Network read timeout error (Unknown)';
          break;
        case 599:
          output = 'Network connect timeout error (Unknown)';
          break;
        default:
          output = 'Unknown HTTP status \'' + statusCode + '\', what is this?';
          break;
      }
      return output;
    }
  }
})();

/**
 * Generic data service to interact with Strapi.io backend. This will just
 * wrap $http methods to a single service, that is used from application.
 *
 * This is needed because we need to make some common url handling for sails
 * endpoint.
 */
(function () {
  'use strict';

  angular.module('frontend.core.services')
    .factory('dataService', [
      '$http',
      '_',
      'Config',
      '$q',
      function factory($http,
                       _,
                       Config,
                       $q) {
        /**
         * Helper function to get "proper" end point url for sails backend API.
         *
         * @param   {string}    endPoint        Name of the end point
         * @param   {number}    [identifier]    Identifier of endpoint object
         *
         * @returns {string}
         * @private
         */
        function _parseEndPointUrl(endPoint, identifier) {
          if (!_.isUndefined(identifier)) {
            endPoint = endPoint + '/' + identifier;
          }

          return Config.backendUrl + '/' + endPoint;
        }

        /**
         * Helper function to parse used parameters in 'get' and 'count' methods.
         *
         * @param   {{}}    parameters  Used query parameters
         *
         * @returns {{params: {}}}
         * @private
         */
        function _parseParameters(parameters) {
          parameters = parameters || {};

          return {
            params: parameters
          };
        }

        return {
          /**
           * Service method to get count of certain end point objects.
           *
           * @param   {string}    endPoint    Name of the end point
           * @param   {{}}        parameters  Used query parameters
           *
           * @returns {Promise|*}
           */
          count: function count(endPoint, parameters) {
            return $http
              .get(_parseEndPointUrl(endPoint) + '/count/', _parseParameters(parameters));
          },

          /**
           * Service method to get data from certain end point. This will always return a collection
           * of data.
           *
           * @param   {string}    endPoint    Name of the end point
           * @param   {{}}        parameters  Used query parameters
           *
           * @returns {Promise|*}
           */
          collection: function collection(endPoint, parameters) {
            var canceller = $q.defer();

            var cancel = function (reason) {
              canceller.resolve(reason);
            };

            var promise = $http({
              method: 'get',
              url: _parseEndPointUrl(endPoint),
              params: parameters || {},
              timeout: canceller.promise,
              data: {
                cancelable: true
              }
            });

            return {
              promise: promise,
              cancel: cancel
            };
          },

          /**
           * Service method to get data from certain end point. This will return just a one
           * record as an object.
           *
           * @param   {string}    endPoint    Name of the end point
           * @param   {number}    identifier  Identifier of endpoint object
           * @param   {{}}        parameters  Used query parameters
           *
           * @returns {Promise|*}
           */
          fetch: function fetch(endPoint, identifier, parameters) {
            return $http
              .get(_parseEndPointUrl(endPoint, identifier), _parseParameters(parameters));
          },

          /**
           * Service method to create new object to specified end point.
           *
           * @param   {string}    endPoint    Name of the end point
           * @param   {{}}        data        Data to update
           *
           * @returns {Promise|*}
           */
          create: function create(endPoint, data) {
            return $http
              .post(_parseEndPointUrl(endPoint), data);
          },

          /**
           * Service method to update specified end point object.
           *
           * @param   {string}    endPoint    Name of the end point
           * @param   {number}    identifier  Identifier of endpoint object
           * @param   {{}}        data        Data to update
           *
           * @returns {Promise|*}
           */
          update: function update(endPoint, identifier, data) {
            return $http
              .put(_parseEndPointUrl(endPoint, identifier), data);
          },

          /**
           * Service method to delete specified object.
           *
           * @param   {string}    endPoint    Name of the end point
           * @param   {number}    identifier  Identifier of endpoint object
           *
           * @returns {Promise|*}
           */
          delete: function remove(endPoint, identifier) {
            return $http
              .delete(_parseEndPointUrl(endPoint, identifier));
          }
        };
      }
    ]);
})();

(function () {
  'use strict';

  /**
   * Service used to open a confirmation modal.
   *
   * The main function is `open` and return a promise according to the user's choice.
   */
  angular.module('frontend.core.services')
    .factory('confirmationModal', confirmationModal);

  confirmationModal.$inject = ['$uibModal'];

  function confirmationModal($uibModal) {
    var service = {
      open: openModal
    };

    return service;

    /**
     * Open a confirmation modal
     *
     * @param {Object} options
     * @returns {Promise}
     */
    function openModal(options) {
      // Params options.
      options = angular.isObject(options) ? options : {};
      options.size = options.size || 'md';
      options.title = options.title || 'Please confirm';
      options.content = options.content || 'Are you sure you want to proceed this action ?';

      var modalInstance = $uibModal.open({
        animation: options.animation || true,
        templateUrl: '/frontend/core/services/partials/confirmation-modal.html',
        controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
          $scope.options = options;

          // Confirm.
          $scope.ok = function () {
            $uibModalInstance.close('ok');
          };

          // Cancel.
          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };

        }],
        size: options.size,
        resolve: {
          items: function () {
            return [];
          }
        }
      });

      // Return the modal promise which will be resolve or rejected
      // when the user clicks on one of the buttons.
      return modalInstance.result;
    }
  }
})();

(function () {
  'use strict';

  angular.module('frontend.core.services')
    .factory('configService', configService);

  configService.$inject = ['$http', 'Config', 'messageService', '$sessionStorage', '$q', '$state', 'authService'];

  function configService($http, Config, messageService, $sessionStorage, $q, $state, authService) {
    var config = {};
    var firstLoad = true;
    var service = {
      getConfig: getConfig,
      getApp: getApp
    };

    return service;

    // Private functions.

    /**
     * Return the private `config` object.
     * @returns {{}}
     */
    function getConfig() {
      return config;
    }

    /**
     * Gey the config of the app from its API.
     *
     * @param {Boolean}  ignoreError
     * @returns {*}
     */
    function getApp(ignoreError) {

      // Init promise.
      var deferred = $q.defer();

      // Get the config of the app.
      $http({
        method: 'GET',
        url: Config.backendUrl + '/admin/config'
      }).then(function (response) {
        // Set the config.
        config = response.data;

        // Set the isNewApp value in configService object.
        config.isNewApp = response.data.settings && response.data.settings.isNewApp;

        config.models = response.data.models;

        // Check if the user is connected.
        if (!config.connected) {
          if (config.isNewApp) {
            $state.go('auth.register');
          } else if ($state.includes('strapi')) {
            $state.go('auth.login');
          }
        }

        deferred.resolve();
      })
        .catch(function (response) {
          if (response.data && response.data.message) {
            // User is not admin.
            $state.go('auth.login');
            if (!ignoreError) {
              messageService.error(response.data && response.data.message, 'Error', {
                timeOut: 60000
              });
            }
            authService.logout();
          } else if (firstLoad) {
            // App is offline.
            messageService.error('Your app looks offline, please start it and reload this page.', 'Error', {
              timeOut: 60000
            });
          }
          firstLoad = false;
          deferred.reject();
        });
      return deferred.promise;
    }
  }
})();

(function () {
  'use strict';

  angular.module('frontend.core.models', []);

})();

/**
 * This file contains generic model factory that will return a specified model instance for desired endpoint with
 * given event handlers. Basically all of this boilerplate application individual models are using this service to
 * generate real model.
 */
(function () {
  'use strict';

  DataModel.$inject = ["$log", "_", "dataService"];
  angular.module('frontend.core.models')
    .factory('DataModel', DataModel);

  DataModel.$injdect = ['$log', '_', 'dataService'];

  function DataModel($log, _, dataService) {
    /**
     * Constructor for actual data model.
     *
     * @param   {string}  [endpoint]  Name of the API endpoint
     * @constructor
     */
    var Model = function (endpoint) {
      // Initialize default values.
      this.object = {};
      this.objects = [];

      // Cache parameters
      this.cache = {
        count: {},
        fetch: {},
        load: {}
      };

      // Is scope used with data model or not, if yes this is actual scope
      this.scope = false;

      // Scope item names for single, collection and count
      this.itemNames = {
        object: false,
        objects: false,
        count: false
      };

      // Subscribe to specified endpoint
      if (endpoint) {
        this.endpoint = endpoint;
      } else {
        this.endpoint = false;
      }
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Service function to set used model endpoint. Note that this will also trigger subscribe for
     * this endpoint actions (created, updated, deleted, etc.).
     *
     * @param {string}  endpoint  Model endpoint definition
     */
    Model.prototype.setEndpoint = function setEndpoint(endpoint) {
      var self = this;

      // Set used endpoint
      self.endpoint = endpoint;

      // Subscribe to specified endpoint
      self._subscribe();
    };

    /**
     * Service function to set used model and 'item' names which are updated on specified scope when
     * socket events occurs.
     *
     * @param {{}}              scope
     * @param {string|boolean}  [nameObject]
     * @param {string|boolean}  [nameObjects]
     * @param {string|boolean}  [nameCount]
     */
    Model.prototype.setScope = function setScope(scope, nameObject, nameObjects, nameCount) {
      var self = this;

      self.scope = scope;
      self.itemNames = {
        object: nameObject || false,
        objects: nameObjects || false,
        count: nameCount || false
      };
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Default behaviour for created objects for specified endpoint. If you need some custom logic
     * for your model, just overwrite this function on your model.
     *
     * @param {{
         *          verb:       String,
         *          data:       {},
         *          id:         Number,
         *          [previous]: {}
         *        }}  message
     */
    Model.prototype.handlerCreated = function handlerCreated(message) {
      var self = this;

      $log.log('Object created', self.endpoint, message);

      // Scope is set, so we need to load collection and determine count again
      if (self.scope) {
        if (self.itemNames.objects) {
          self.load(null, true);
        }

        if (self.itemNames.count) {
          self.count(null, true);
        }
      }
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Default behaviour for updated objects for specified endpoint. If you need some custom logic
     * for your model, just overwrite this function on your model.
     *
     * @param {{
         *          verb:       String,
         *          data:       {},
         *          id:         Number,
         *          [previous]: {}
         *        }}  message
     */
    Model.prototype.handlerUpdated = function handlerUpdated(message) {
      var self = this;

      $log.log('Object updated', self.endpoint, message);

      // Scope is set, so we need to fetch collection and object data again
      if (self.scope) {
        if (self.itemNames.object && parseInt(message.id, 10) === parseInt(self.object.id, 10)) {
          self.fetch(null, null, true);
        }

        if (self.itemNames.objects) {
          self.load(null, true);
        }
      }
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Default behaviour for deleted objects for specified endpoint. If you need some custom logic
     * for your model, just overwrite this function on your model.
     *
     * @param {{
         *          verb:       String,
         *          data:       {},
         *          id:         Number,
         *          [previous]: {}
         *        }}  message
     */
    Model.prototype.handlerDeleted = function handlerDeleted(message) {
      var self = this;

      $log.log('Object deleted', self.endpoint, message);

      // Scope is set, so we need to fetch collection and object data again
      if (self.scope) {
        if (self.itemNames.object && parseInt(message.id, 10) === parseInt(self.object.id, 10)) {
          $log.warn('How to handle this case?');
        }

        if (self.itemNames.objects) {
          self.load(null, true);
        }

        if (self.itemNames.count) {
          self.count(null, true);
        }
      }
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Default behaviour for addedTo events for specified endpoint. If you need some custom logic for
     * your model, just overwrite this function on your model.
     *
     * @param {{
         *          verb:       String,
         *          data:       {},
         *          id:         Number,
         *          [previous]: {}
         *        }}  message
     */
    Model.prototype.handlerAddedTo = function handlerAddedTo(message) {
      var self = this;

      $log.log('AddedTo', self.endpoint, message);
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     * Default behaviour for removedFrom events for specified endpoint. If you need some custom logic
     * for your model, just overwrite this function on your model.
     *
     * @param  {{
         *           verb:       String,
         *           data:       {},
         *           id:         Number,
         *           [previous]: {}
         *         }}  message
     */
    Model.prototype.handlerRemovedFrom = function handlerRemovedFrom(message) {
      var self = this;

      $log.log('RemovedFrom', self.endpoint, message);
    };

    /**
     * Service function to return count of objects with specified parameters.
     *
     * @param   {{}}        [parameters]    Query parameters
     * @param   {Boolean}   [fromCache]     Fetch with cache parameters
     *
     * @returns {Promise|models.count}
     */
    Model.prototype.count = function count(parameters, fromCache) {
      var self = this;

      // Normalize parameters
      parameters = parameters || {};
      fromCache = fromCache || false;

      if (fromCache) {
        parameters = self.cache.count.parameters;
      } else {
        // Store used parameters
        self.cache.count = {
          parameters: parameters
        };
      }

      return dataService
        .count(self.endpoint, parameters)
        .then(
        function onSuccess(response) {
          if (fromCache && self.scope && self.itemNames.count) {
            self.scope[self.itemNames.count] = response.data.count;
          }

          return response.data;
        },
        function onError(error) {
          $log.error('Model.count() failed.', error, self.endpoint, parameters);
        }
      );
    };

    /**
     * Service function to load objects from specified endpoint with given parameters. Note that this
     * function will also store those objects to current service instance.
     *
     * @param   {{}}        [parameters]    Query parameters
     * @param   {Boolean}   [fromCache]     Fetch with cache parameters
     *
     * @returns {Promise|*}
     */
    Model.prototype.load = function load(parameters, fromCache) {
      var self = this;

      // Normalize parameters.
      parameters = parameters || {};
      fromCache = fromCache || false;

      if (fromCache) {
        parameters = self.cache.load.parameters;
      } else {
        // Store used parameters
        self.cache.load = {
          parameters: parameters
        };
      }

      var request = dataService.collection(self.endpoint, parameters);

      return request;
    };

    /**
     * Service function to load single object from specified endpoint with given parameters. Note that
     * this will also store fetched object to current instance of this service.
     *
     * @param   {Number}    identifier      Object identifier
     * @param   {{}}        [parameters]    Query parameters
     * @param   {Boolean}   [fromCache]     Fetch with cache parameters
     *
     * @returns {Promise|*}
     */
    Model.prototype.fetch = function fetch(identifier, parameters, fromCache) {
      var self = this;

      // Normalize parameters
      parameters = parameters || {};
      fromCache = fromCache || false;

      if (fromCache) {
        identifier = self.cache.fetch.identifier;
        parameters = self.cache.fetch.parameters;
      } else {
        // Store identifier and used parameters to cache
        self.cache.fetch = {
          identifier: identifier,
          parameters: parameters
        };
      }

      return dataService
        .fetch(self.endpoint, identifier, parameters)
        .then(
        function onSuccess(response) {
          self.object = response.data;

          if (fromCache && self.scope && self.itemNames.object) {
            self.scope[self.itemNames.object] = self.object;
          }

          return self.object;
        });
    };

    /**
     * Service function to create new object to current model endpoint. Note that this will also
     * trigger 'handleMessage' service function, which will handle all necessary updates to current
     * service instance.
     *
     * @param   {{}}    data    Object data to create
     *
     * @returns {Promise|*}
     */
    Model.prototype.create = function create(data) {
      var self = this;

      return dataService
        .create(self.endpoint, data)
        .then(
        function onSuccess(result) {
          return result;
        });
    };

    /**
     * Service function to update specified object in current model endpoint. Note that this will also
     * trigger 'handleMessage' service function, which will handle all necessary updates to current
     * service instance.
     *
     * @param   {Number}    identifier  Object identifier
     * @param   {{}}        data        Object data to update
     *
     * @returns {Promise|*}
     */
    Model.prototype.update = function update(identifier, data) {
      var self = this;

      return dataService
        .update(self.endpoint, identifier, data)
        .then(
        function onSuccess(result) {
          return result;
        });
    };

    /**
     * Service function to delete specified object from current model endpoint. Note that this will
     * also trigger 'handleMessage' service function, which will handle all necessary updates to
     * current service instance.
     *
     * @param   {Number}    identifier  Object identifier
     *
     * @returns {Promise|*}
     */
    Model.prototype.delete = function deleteObject(identifier) {
      var self = this;

      return dataService
        .delete(self.endpoint, identifier)
        .then(
        function onSuccess(result) {
          return result;
        });
    };

    return Model;
  }
})();

// Generic models angular module initialize.
(function () {
  'use strict';

  angular.module('frontend.core.libraries', []);
})();

(function () {
  'use strict';

  /**
   * Service used to inject `pluralize` library inside a controller, service, directive...
   */
  angular.module('frontend.core.libraries')
    .factory('pluralizeFactory', pluralizeFactory);

  pluralizeFactory.$inject = ['$window'];

  function pluralizeFactory($window) {
    return $window.pluralize;
  }
})();

(function () {
  'use strict';

  /**
   * Service used to inject `lodash` library inside a controller, service, directive...
   */
  angular.module('frontend.core.libraries')
    .factory('_', lodashFactory);

  lodashFactory.$inject = ['$window'];

  function lodashFactory($window) {
    var service = $window._;

    return service;
  }
})();

(function () {
  'use strict';

  // Init the module.
  angular.module('frontend.core.layout', []);
})();

(function () {
  'use strict';

  /*
   * Generic service to return all available menu items for main level navigation.
   */
  angular.module('frontend.core.layout')
    .factory('layoutService', layoutService);

  layoutService.$inject = [];

  function layoutService() {

    var service = {};

    service.collapsedBooleans = {
      dashboard: true,
      explorer: true,
      users: true
    };

    service.expand = expand;

    return service;

    // Private functions.

    /**
     * Expand links in the menu.
     *
     * @param newExpanded
     */

    function expand(newExpanded, disableAutoCollapse) {
      angular.forEach(service.collapsedBooleans, function (value, key) {
        if (key === newExpanded && disableAutoCollapse) {
          service.collapsedBooleans[key] = false;
        } else if (key === newExpanded) {
          service.collapsedBooleans[key] = !service.collapsedBooleans[key];
        } else {
          service.collapsedBooleans[key] = true;
        }
      });
    }
  }
})();

(function () {
  'use strict';

  /**
   * Controllers used for the header and the menu.
   */
  angular.module('frontend.core.layout')
    .controller('HeaderController', HeaderController)
    .controller('MenuController', MenuController);

  HeaderController.$inject = ['userService', 'authService', 'messageService'];

  function HeaderController(userService, authService, messageService) {

    var vm = this;
    vm.user = userService.user;

    vm.logout = logout;

    // Private functions.

    /*
     * Simple helper function which triggers user logout action.
     */
    function logout() {
      authService.logout();
      messageService.success('You have been logged out.');
    }
  }

  MenuController.$inject = ['configService', 'layoutService'];

  function MenuController(configService, layoutService) {

    var vm = this;
    vm.menuLinks = {};
    vm.menuLinks.models = [];
    vm.collapsedBooleans = layoutService.collapsedBooleans;
    vm.expand = layoutService.expand;

    // These items should be ignored in the menu display.
    var ignoredModels = ['role', 'user', 'route', 'passport', 'upload', 'email'];
    angular.forEach(configService.getConfig().models, function (model, key) {
      if (ignoredModels.indexOf(key) === -1) {
        vm.menuLinks.models.push({
          model: key
        });
      }
    });
  }
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core.interceptors', []);
})();

/**
 * Interceptor for $http requests to handle possible errors and show
 * that error to user automatically. Message is shown by application 'Message' service
 * which uses `toastr` library.
 */
(function () {
  'use strict';

  angular.module('frontend.core.interceptors')
    .factory('ErrorInterceptor', ErrorInterceptor);

  ErrorInterceptor.$inject = ['$q', '$injector', '_'];

  function ErrorInterceptor($q, $injector, _) {
    var service = {
      response: responseInterceptor,
      responseError: responseError
    };

    return service;

    /**
     * Interceptor method which is triggered whenever response occurs on $http queries.
     *
     * @param   {*} response
     *
     * @returns {*|Promise}
     */
    function responseInterceptor(response) {
      if (response.data.error &&
        response.data.status &&
        response.data.status !== 200
      ) {
        return $q.reject(response);
      } else {
        return response || $q.when(response);
      }
    }

    /**
     * Interceptor method that is triggered whenever response error occurs on $http requests.
     *
     * @param   {*} response
     *
     * @returns {*|Promise}
     */
    function responseError(response) {
      var message = '';

      // Ignored URLs.
      var ignoredUrlErrors = ['config'];
      var isIgnoredUrl = false;
      angular.forEach(ignoredUrlErrors, function (ignoredUrl) {
        if (_.includes(response.config.url, ignoredUrl)) {
          isIgnoredUrl = true;
        }
      });

      if (isIgnoredUrl || response.config.data.cancelable) {
        return $q.reject(response);
      }

      if (!message && response.data && response.data.invalidAttributes) {
        var invalidFields = [];

        angular.forEach(response.data.invalidAttributes, function (invalidField, key) {
          invalidFields.push(key);
        });

        message = invalidFields.length > 1 ? 'These fields are invalid : ' : 'This field is invalid : ';
        message += invalidFields.join(' ');

      } else if (!message && response.data && response.data.error) {
        message = response.data.error;
      } else if (!message && response.data && response.data.message) {
        message = response.data.message;
      } else if (!message) {
        if (typeof response.data === 'string') {
          message = response.data;
        } else if (response.statusText) {
          message = response.statusText;
        } else {
          message = $injector.get('httpStatusService').getStatusCodeText(response.status);
        }

        message = message || ' <span class="text-small">(HTTP status ' + response.status + ')</span>';
      }

      if (message) {
        $injector.get('messageService').error(message);
      }

      return $q.reject(response);
    }
  }
})();

/**
 * Auth interceptor for HTTP and Socket request. This interceptor will add required
 * JWT (Json Web Token) token to each requests. That token is validated in server side
 * application.
 */
(function () {
  'use strict';

  angular.module('frontend.core.interceptors')
    .factory('AuthInterceptor', AuthInterceptor);

  AuthInterceptor.$inject = ['$q', '$injector', '$localStorage'];

  function AuthInterceptor($q, $injector, $localStorage) {
    var service = {
      request: request,
      responseError: responseError
    };

    return service;

    /**
     * Interceptor method for $http requests. Main purpose of this method is to add JWT token
     * to every request that application does.
     *
     * @param   {*} config  HTTP request configuration
     *
     * @returns {*}
     */
    function request(config) {
      var token;

      // Yeah we have some user data on local storage.
      if ($localStorage.credentials) {
        token = $localStorage.credentials.jwt || $localStorage.credentials.token;
      }

      // Yeah we have a token.
      if (token) {
        if (!config.data) {
          config.data = {};
        }

        /**
         * Set token to actual data and headers. Note that we need both ways because of socket cannot modify
         * headers anyway. These values are cleaned up in backend side policy (middleware).
         */
        config.data.token = token;
        config.headers.authorization = 'Bearer ' + token;
      }

      return config;
    }

    /**
     * Interceptor method that is triggered whenever response error occurs on $http requests.
     *
     * @param   {*} response
     *
     * @returns {*|Promise}
     */
    function responseError(response) {
      if (response.status === 401) {
        $localStorage.$reset();

        if ($injector.get('configService').getConfig().isNewApp) {
          $injector.get('$state').go('auth.register');
        } else {
          $injector.get('$state').go('auth.login');
        }
      }

      return $q.reject(response);
    }
  }
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core.filters', []);
})();

(function () {
  'use strict';

  /**
   * Capitalize filter using `plural` function from `pluralize` library.
   */
  angular.module('frontend.core.filters')
    .filter('pluralize', pluralize);

  pluralize.$inject = ['_', 'pluralizeFactory'];

  function pluralize(_, pluralizeFactory) {
    return function (input) {
      return pluralizeFactory.plural(input);
    };
  }
})();

(function () {
  'use strict';

  /**
   * Humanize text (eg. camelized string to separated words).
   */
  angular.module('frontend.core.filters')
    .filter('humanize', humanize);

  humanize.$inject = ['_'];

  function humanize(_) {
    return function (input) {
      if (typeof input !== 'string') {
        return input;
      }

      return _.capitalize(_.trim(underscored(input).replace(/_id$/, '').replace(/_/g, ' ')));

      // Underscore string mixin
      function underscored(str) {
        return _.trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
      }
    };
  }
})();

(function () {
  'use strict';

  /**
   * Capitalize filter using `lodash` function.
   */
  angular.module('frontend.core.filters')
    .filter('capitalize', capitalize);

  capitalize.$inject = ['_'];

  function capitalize(_) {
    return function (input) {
      if (typeof input !== 'string') {
        return input;
      }
      return _.capitalize(input);
    };
  }
})();

(function () {
  'use strict';

  /**
   * Filter `an`, used to format singular indefinite article.
   */
  angular.module('frontend.core.filters')
    .filter('an', an);

  an.$inject = ['_'];

  function an(_) {
    return function (nextWord) {
      if (typeof nextWord !== 'string') {
        return nextWord;
      }
      if (!nextWord) {
        return 'a';
      }
      var vowels = ['a', 'e', 'i', 'o'];
      nextWord = _.trim(nextWord);
      return _.contains(vowels, nextWord[0]) ? 'an' : 'a';
    };
  }
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core.error', []);
})();

(function () {
  'use strict';

  // Module configuration.
  angular.module('frontend.core.error')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          .state('error', {
            parent: 'frontend',
            url: '/error',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/core/error/partials/error.html',
                controller: 'ErrorController as ErrorCtrl',
                resolve: {
                  _error: function resolve() {
                    return this.self.error;
                  }
                }
              }
            }
          });
      }
    ]);
})();

(function () {
  'use strict';

  /**
   * Controller for generic error handling.
   */
  angular.module('frontend.core.error')
    .controller('ErrorController', ErrorController);

  ErrorController.$inject = ['$state', '_', '_error'];

  function ErrorController($state, _, _error) {
    if (_.isUndefined(_error)) {
      return $state.go('auth.login');
    }

    var vm = this;

    vm.error = _error;
    vm.error.message = angular.copy(_error.error.message);

    vm.goToPrevious = goToPrevious;

    // Helper function to change current state to previous one
    function goToPrevious() {
      $state.go(vm.error.fromState.name, vm.error.fromParams);
    }
  }
})();

(function () {
  'use strict';

  /**
   * Generic models angular module initialize. This module contains all 3rd party dependencies that application needs to
   * actually work.
   *
   * Also note that this module have to be loaded before any other application modules that have dependencies to these
   * "core" modules.
   */
  angular.module('frontend.core.dependencies', [
    'angular-loading-bar',
    'angularMoment',
    'as.sortable',
    'formly',
    'formlyBootstrap',
    'ngAnimate',
    'ngBootbox',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngStorage',
    'toastr',
    'ui.bootstrap',
    'ui.bootstrap.showErrors',
    'ui.grid',
    'ui.grid.resizeColumns',
    'ui.grid.moveColumns',
    'ui.grid.autoResize',
    'ui.grid.pagination',
    'ui.router',
    'ui.select',
    'ui.utils'
  ]);
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core.auth', [
    'frontend.core.auth.login',
    'frontend.core.auth.register',
    'frontend.core.auth.forgotPassword',
    'frontend.core.auth.changePassword',
    'frontend.core.auth.services'
  ]);
})();

(function () {
  'use strict';

  // Module configuration.
  angular.module('frontend.core.auth')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          .state('auth', {
            parent: 'frontend',
            data: {
              access: 1
            },
            views: {
              'content@': {
                template: ''
              }
            }
          });
      }
    ]);
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend', [
    'frontend-templates',
    'frontend.core',
    'frontend.strapi'
  ]);
})();

/**
 * Frontend application access level constant definitions. These are used to to restrict access to certain routes in
 * application.
 *
 * Note that actual access check is done by currently signed in user.
 */
(function () {
  'use strict';

  angular.module('frontend')
    .constant('AccessLevels', {
      anon: 0,
      user: 1,
      admin: 2
    });
})();

(function () {
  'use strict';

  /**
   * Frontend application backend constant definitions. This is something that you must define in your application.
   *
   * Note that 'Config.backendUrl' is configured in /frontend/config/config.json file and you must change it to match
   * your backend API url.
   */
  angular.module('frontend')
    .constant('Config', {
      backendUrl: window.backendUrl || window.location.origin,
      frontendUrl: window.frontendUrl
    });
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.strapi', [
    'frontend.strapi.dashboard',
    'frontend.strapi.explorer',
    'frontend.strapi.users'
  ]);
})();

(function () {
  'use strict';

  // Module configuration.
  angular.module('frontend.strapi')
    .config([
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('strapi', {
            parent: 'frontend',
            abstract: true,
            views: {
              'header@': {
                templateUrl: '/frontend/core/layout/partials/header.html',
                controller: 'HeaderController as HeaderCtrl'
              },
              'sidebar@': {
                templateUrl: '/frontend/core/layout/partials/menu.html'
              },
              'content@': {
                template: '<div></div>',
                controller: [
                  '$state',
                  function ($state) {
                    $state.go('strapi.dashboard');
                  }
                ]
              }
            },
            resolve: {
              _config: ['configService', '$q', function (configService, $q) {
                var deferred = $q.defer();

                configService.getApp()
                  .then(function () {
                    deferred.resolve();
                  })
                  .catch(function (err) {
                    deferred.reject(err);
                  });

                return deferred.promise;
              }]
            }
          });
      }
    ]);
})();

(function () {
  'use strict';

  // Init module.
  angular.module('frontend.core', [
    'frontend.core.dependencies', // Note that this must be loaded first
    'frontend.core.auth',
    'frontend.core.directives',
    'frontend.core.error',
    'frontend.core.filters',
    'frontend.core.interceptors',
    'frontend.core.layout',
    'frontend.core.libraries',
    'frontend.core.models',
    'frontend.core.services',
    'frontend.core.templates'
  ]);
})();

(function () {
  'use strict';

  /**
   * Frontend application run hook configuration.
   */
  angular.module('frontend')
    .run(run);

  run.$inject = ['$rootScope',
    '$state',
    '$injector',
    'authService',
    'configService',
    '_',
    '$stateParams',
    'formlyConfig',
    'formlyValidationMessages',
    'Config',
    'initService',
    'userService',
    'layoutService'];

  function run($rootScope,
               $state,
               $injector,
               authService,
               configService,
               _,
               $stateParams,
               formlyConfig,
               formlyValidationMessages,
               Config,
               initService,
               userService,
               layoutService) {

    // Set global variable
    $rootScope.auth = authService;
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.configService = configService;
    $rootScope.Config = Config;
    $rootScope.authService = authService;
    $rootScope.user = userService.user;
    $rootScope._ = _;

    // Get app config.
    configService.getApp()
      .then(function () {
        initService.deferred.resolve();
      });

    /**
     * Route state change start event, this is needed for following:
     *  1) Check if user is authenticated to access page, and if not redirect user back to login page
     */
    $rootScope.$on('$stateChangeStart', function stateChangeStart(event, toState) {
      if (!authService.authorize(toState.data.access)) {
        event.preventDefault();

        if (configService.getConfig() && configService.getConfig().isNewApp) {
          $state.go('auth.register');
        } else {
          $state.go('auth.login');
        }
      }
    });

    // Check for state change errors.
    $rootScope.$on('$stateChangeError', function stateChangeError(event, toState, toParams, fromState, fromParams, error) {
      event.preventDefault();

      $injector.get('messageService')
        .error('Error loading the page');

      $state.get('error').error = {
        event: event,
        toState: toState,
        toParams: toParams,
        fromState: fromState,
        fromParams: fromParams,
        error: error
      };

      return $state.go('error');
    });

    /**
     * Route state change success event.
     */
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
      // Logic for collapsed menu.
      var expandedGroup = toState.data && toState.data.menuGroup;

      // Specific for users models.
      var userModels = ['user', 'role'];
      if ($state.includes('strapi.explorer.list') && _.includes(userModels, toParams.model)) {
        expandedGroup = 'users';
      }

      // Change the expanded item in the menu.
      layoutService.expand(expandedGroup, true);
    });

    // Formly config.
    formlyConfig.setType({
      name: 'array',
      wrapper: 'bootstrapLabel',
      template: '<textarea class="form-control" ng-model="model[options.key]" array-input></textarea>'
    });

    formlyConfig.setType({
      name: 'json',
      wrapper: 'bootstrapLabel',
      template: '<textarea class="form-control" ng-model="model[options.key]" json-input></textarea>'
    });

    var ngModelAttrs = {
      'dateDisabled': {'attribute': 'date-disabled'},
      'customClass': {'attribute': 'custom-class'},
      'showWeeks': {'attribute': 'show-weeks'},
      'startingDay': {'attribute': 'starting-day'},
      'initDate': {'attribute': 'init-date'},
      'minMode': {'attribute': 'min-mode'},
      'maxMode': {'attribute': 'max-mode'},
      'formatDay': {'attribute': 'format-day'},
      'formatMonth': {'attribute': 'format-month'},
      'formatYear': {'attribute': 'format-year'},
      'formatDayHeader': {'attribute': 'format-day-header'},
      'formatDayTitle': {'attribute': 'format-day-title'},
      'formatMonthTitle': {'attribute': 'format-month-title'},
      'yearRange': {'attribute': 'year-range'},
      'shortcutPropagation': {'attribute': 'shortcut-propagation'},
      'datepickerPopup': {'attribute': 'uib-datepicker-popup'},
      'showButtonBar': {'attribute': 'show-button-bar'},
      'currentText': {'attribute': 'current-text'},
      'clearText': {'attribute': 'clear-text'},
      'closeText': {'attribute': 'close-text'},
      'closeOnDateSelection': {'attribute': 'close-on-date-selection'},
      'datepickerAppendToBody': {'attribute': 'datepicker-append-to-body'},
      'datepickerMode': {'bound': 'datepicker-mode'},
      'minDate': {'bound': 'min-date'},
      'maxDate': {'bound': 'max-date'}
    };

    formlyConfig.setType({
      name: 'datepicker',
      template: '<input class="form-control" ng-model="model[options.key]" is-open="to.isOpen" datepicker-options="to.datepickerOptions" />',
      wrapper: [],
      defaultOptions: {
        ngModelAttrs: ngModelAttrs,
        templateOptions: {
          addonRight: {
            class: 'fa fa-calendar',
            onClick: function (options) {
              options.templateOptions.isOpen = !options.templateOptions.isOpen;
            }
          },
          onFocus: function ($viewValue, $modelValue, scope) {
            scope.to.isOpen = !scope.to.isOpen;
          },
          datepickerOptions: {}
        }
      }
    });
    formlyConfig.extras.errorExistsAndShouldBeVisibleExpression = 'fc.$touched || form.$submitted';
    formlyConfig.extras.ngModelAttrsManipulatorPreferBound = true;
    formlyValidationMessages.addStringMessage('maxlength', 'Your input is too long!');
    formlyValidationMessages.messages.pattern = function (viewValue) {
      return viewValue + ' is invalid';
    };
    formlyValidationMessages.addTemplateOptionValueMessage('minlength', 'minlength', 'Please insert at least', 'characters', 'Too short');
    formlyValidationMessages.addTemplateOptionValueMessage('maxlength', 'maxlength', 'Please insert less than', 'characters', 'Too long');
    formlyValidationMessages.addTemplateOptionValueMessage('min', 'min', 'Please insert a value higher than', '', 'Too small');
    formlyValidationMessages.addTemplateOptionValueMessage('max', 'max', 'Please insert a value lower than', '', 'Too big');
    formlyValidationMessages.addTemplateOptionValueMessage('required', '', '', 'This field is required', 'This field is required');
    formlyValidationMessages.addTemplateOptionValueMessage('email', 'email', 'The provided e-mail looks invalid', '', 'The provided e-mail looks invalid');

    formlyConfig.setType([
      {
        name: 'input',
        templateUrl: 'templates/angular-formly/input-template.html',
        wrapper: ['bootstrapLabel'],
        overwriteOk: true
      }, {
        name: 'textarea',
        templateUrl: 'templates/angular-formly/textarea-template.html',
        wrapper: ['bootstrapLabel'],
        overwriteOk: true
      }, {
        name: 'checkbox',
        templateUrl: 'templates/angular-formly/input-checkbox.html',
        wrapper: ['bootstrapLabel'],
        overwriteOk: true
      }
    ]);

    formlyConfig.setWrapper([
      {
        template: [
          '<div class="formly-template-wrapper form-group"',
          'ng-class="{\'has-error\': options.validation.errorExistsAndShouldBeVisible}">',
          '<formly-transclude></formly-transclude>',
          '<div class="form-validation"',
          'ng-if="options.validation.errorExistsAndShouldBeVisible"',
          'ng-messages="options.formControl.$error">',
          '<div ng-message="{{::name}}" ng-repeat="(name, message) in ::options.validation.messages">',
          '{{message(options.formControl.$viewValue, options.formControl.$modelValue, this)}}',
          '</div>',
          '</div>',
          '</div>'
        ].join(' ')
      }, {
        template: [
          '<div class="checkbox formly-template-wrapper-for-checkboxes form-group">',
          '<label for="{{::id}}">',
          '<formly-transclude></formly-transclude>',
          '</label>',
          '</div>'
        ].join(' '),
        types: 'checkbox'
      }
    ]);
  }
})();

(function () {
  'use strict';

  /**
   * Configuration for frontend application.
   */
  angular.module('frontend')
    .config(config);

  config.$inject = ['$stateProvider',
    '$locationProvider',
    '$urlRouterProvider',
    '$httpProvider',
    '$uibTooltipProvider',
    'cfpLoadingBarProvider',
    'toastrConfig',
    '$urlMatcherFactoryProvider'];

  function config($stateProvider,
                  $locationProvider,
                  $urlRouterProvider,
                  $httpProvider,
                  $uibTooltipProvider,
                  cfpLoadingBarProvider,
                  toastrConfig,
                  $urlMatcherFactoryProvider) {

    // $http config.
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // Add interceptors for $httpProvider.
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('ErrorInterceptor');

    // Set tooltip options.
    $uibTooltipProvider.options({
      appendToBody: true
    });

    // Disable spinner from cfpLoadingBar.
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.latencyThreshold = 200;

    // Extend default toastr configuration with application specified configuration.
    angular.extend(
      toastrConfig, {
        allowHtml: true,
        closeButton: true,
        extendedTimeOut: 3000
      }
    );

    // HTML5 urls are disabled.
    $locationProvider
      .html5Mode({
        enabled: false,
        requireBase: false
      })
      .hashPrefix('!');

    // Main state provider for frontend application.
    $stateProvider
      .state('frontend', {
        views: {},
        resolve: {
          _config: ['initService', function (initService) {
            return initService.promise;
          }]
        }
      });

    // For any unmatched url, redirect to /
    $urlRouterProvider.otherwise('/');

    // Strict Mode.
    $urlMatcherFactoryProvider.strictMode(false);
  }
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/strapi/dashboard/dashboard.html',
    '<div class="row"><div class="col-sm-12"><h1 class="page-header">Dashboard</h1><div class="panel panel-default"><div class="panel-heading">Welcome to your admin panel</div><div class="panel-body"><p>The admin panel allows you to easily manage your data. The UI is auto-generated depending on the models of your application. So, in just a few seconds, you are able to create, search, view, edit and delete your data.</p></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/strapi/explorer/explorer-edit.html',
    '<form novalidate data-ng-submit="ExplorerEditCtrl.onSubmit(ExplorerEditCtrl.model)" autocomplete="off"><div class="row"><div class="col-sm-6"><h1 class="page-header" data-ng-if="!ExplorerEditCtrl.model.id">Create {{$stateParams.model}}</h1><h1 class="page-header" data-ng-if="ExplorerEditCtrl.model.id">Edit {{$stateParams.model}}</h1></div><div class="col-sm-6"><div class="action-btn-container pull-right"><button class="btn btn-default" type="button" data-ng-click="ExplorerEditCtrl.resetModel(ExplorerEditCtrl.model)">Reset</button> <button class="btn" ng-class="{\'btn-default\': ExplorerEditCtrl.model.id, \'btn-warning\': !ExplorerEditCtrl.model.id}" type="button" data-ng-click="$state.go(\'strapi.explorer.list\', {model: $stateParams.model})">Cancel</button> <button class="btn btn-warning" data-ng-if="ExplorerEditCtrl.model.id && ($stateParams.model !== \'user\' || user().id !== ExplorerEditCtrl.model.id)" type="button" data-ng-click="ExplorerEditCtrl.deleteEntry(ExplorerEditCtrl.model)">Delete</button> <button data-ng-disabled="ExplorerEditCtrl.submitting" data-ng-if="!ExplorerEditCtrl.model.id" type="submit" class="btn btn-success">Create</button> <button data-ng-disabled="ExplorerEditCtrl.submitting" data-ng-if="ExplorerEditCtrl.model.id" type="submit" class="btn btn-success">Update</button></div></div></div><div class="row"><div class="col-sm-8"><formly-form model="ExplorerEditCtrl.model" fields="ExplorerEditCtrl.fields"></formly-form><div ng-if="$stateParams.model === \'user\'"><button type="button" ng-if="!ExplorerEditCtrl.displayUserPasswordField" ng-click="ExplorerEditCtrl.toggleUserPasswordDisplayField()" class="btn btn-xs btn-default">Display password field</button><div class="panel panel-default" ng-if="ExplorerEditCtrl.displayUserPasswordField"><div class="panel-body"><div class="form-group"><label for="userPassword">PASSWORD</label><span class="pull-right cursor-pointer" ng-click="ExplorerEditCtrl.toggleUserPasswordDisplayField()">Hide field</span><div class="input-group"><input type="{{ExplorerEditCtrl.userPasswordInput.type}}" id="userPassword" name="userPassword" autocomplete="off" class="form-control" placeholder="Password" ng-model="ExplorerEditCtrl.model.password"> <span class="input-group-addon cursor-pointer" ng-click="ExplorerEditCtrl.generateRandomPassword()">Generate</span></div><div class="form-validation display-password-action cursor-pointer" ng-click="ExplorerEditCtrl.changeUserPasswordType()" ng-show="ExplorerEditCtrl.model.password">{{ExplorerEditCtrl.userPasswordInput.action || \'Display\'}} password</div></div></div></div></div><div ng-if="!ExplorerEditCtrl.fields.length"><p>No field to display.</p><p>In order to add fields, edit your <code>api/{apiName}/models/{apiName}.json</code> file following the <a target="_blank" href="http://strapi.io/documentation/models">models documentation</a>.</p></div></div><div class="col-sm-4"><p class="bold uppercase">Manage your publication</p><ng-form><div class="panel panel-default no-padding explorer-manage"><div class="panel-body"><formly-form model="ExplorerEditCtrl.model" fields="ExplorerEditCtrl.createdUpdatedFields"></formly-form><div class="form-group" ng-if="ExplorerEditCtrl.configModel.attributes.lang"><label for="lang" class="uppercase">Lang</label><select class="form-control" name="lang" id="lang" data-ng-model="ExplorerEditCtrl.model.lang" data-ng-options="value for value in configService.getConfig().settings.i18n.locales"></select></div><div class="form-group" ng-if="ExplorerEditCtrl.configModel.templates"><label for="template" class="uppercase">Template</label><select class="form-control" name="template" id="template" data-ng-change="ExplorerEditCtrl.templateChanged(ExplorerEditCtrl.selectedTemplate)" data-ng-model="ExplorerEditCtrl.model.template" data-ng-options="key as key for (key , value) in ExplorerEditCtrl.configModel.templates"></select></div></div></div><p class="bold uppercase" ng-if="ExplorerEditCtrl.relations.length">Manage your relations</p><div class="panel panel-default explorer-relations" ng-if="ExplorerEditCtrl.relations.length"><div class="panel-body"><div class="form-group" ng-repeat="relation in ExplorerEditCtrl.relations"><label class="uppercase">{{relation.key | humanize}}</label><div class="pull-right"><a ng-show="ExplorerEditCtrl.model[relation.key].id" class="no-border text-success explorer-see-link" data-ui-sref="strapi.explorer.list.edit({model:relation.model, entryId:ExplorerEditCtrl.model[relation.key].id})" target="_blank">SEE</a> <a ng-show="relation.collection && ExplorerEditCtrl.model[relation.key]" class="no-border text-success explorer-see-link cursor-pointer" data-go-to-collection ng-click="goToCollection(ExplorerEditCtrl.model[relation.key], $stateParams.model, relation.collection, true)" target="_blank">SEE</a></div><div ng-if="relation.model"><ui-select ng-model="ExplorerEditCtrl.model[relation.key]" theme="select2"><ui-select-match placeholder="Select {{relation.model|an}} {{relation.model}} in the list...">{{$select.selected[getDisplayedAttribute(relation, $select.selected.template)] || \'Id: \' + $select.selected.id}}</ui-select-match><ui-select-choices repeat="item as item in relation.suggestions" refresh-delay="0" refresh="ExplorerEditCtrl.refreshSuggestions(relation, $select.search, ExplorerEditCtrl.model[relation.formattedName])" infinite-scroll-loading="relation.loading" infinite-scroll-immediate-check="true" infinite-scroll="ExplorerEditCtrl.refreshSuggestions(relation, $select.search, ExplorerEditCtrl.model[relation.formattedName])" infinite-scroll-distance="2"><div>{{item[getDisplayedAttribute(relation, item.template)] || \'Id: \' + item.id}}</div></ui-select-choices></ui-select></div><div ng-if="!relation.model && relation.collection"><ui-select multiple ng-model="ExplorerEditCtrl.model[relation.key]" ng-change="ExplorerEditCtrl.refreshSuggestions(relation, $select.search, ExplorerEditCtrl.model[relation.key], true)" theme="bootstrap"><ui-select-match ng-model="ExplorerEditCtrl.relation.search" placeholder="Select {{relation.name|an}} {{relation.name}}..."><a class="no-border text-muted" data-ui-sref="strapi.explorer.list.edit({model:relation.collection, id:$item.id})" target="_blank">{{$item[getDisplayedAttribute(relation, $item.template)] || \'Id: \' + $item.id}}</a></ui-select-match><ui-select-choices repeat="item as item in relation.suggestions" refresh-delay="0" refresh="ExplorerEditCtrl.refreshSuggestions(relation, $select.search, ExplorerEditCtrl.model[relation.key])" infinite-scroll-loading="ExplorerEditCtrl.relation.loading" infinite-scroll-immediate-check="true" infinite-scroll="refreshSuggestions(relation, $select.search, ExplorerEditCtrl.model[relation.formattedName])" infinite-scroll-distance="2"><div ng-if="!item.createLink">{{item[getDisplayedAttribute(relation, item.template)] || \'Id: \' + item.id}}</div><a class="text-white no-border" ng-if="item.createLink" target="_blank" data-ui-sref="strapi.explorer.list.create({model: relation.name})">No {{relation.name}} yet. Create</a></ui-select-choices></ui-select></div></div></div></div></ng-form></div></div></form>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/strapi/explorer/explorer-list.html',
    '<div class="row"><div class="col-sm-4"><h1 class="page-header">{{ExplorerListCtrl.configModel.identity | pluralize | capitalize}}</h1></div><div class="col-sm-8"><div class="action-btn-container pull-right"><button class="btn btn-default" ng-click="ExplorerListCtrl.emptyFilters()">Empty filters</button> <button class="btn btn-default" ng-click="ExplorerListCtrl.getPage()">Refresh</button> <button class="btn btn-success" data-ui-sref="strapi.explorer.list.create({model:ExplorerListCtrl.configModel.identity})">Create {{ExplorerListCtrl.configModel.identity|an}} {{ExplorerListCtrl.configModel.identity}}</button></div></div></div><div class="row" ng-show="ExplorerListCtrl.gridOptions.data.length && ExplorerListCtrl.loading === false || ExplorerListCtrl.search || ExplorerListCtrl.loading && !ExplorerListCtrl.firstLoad"><div class="col-sm-12"><div class="form-group"><label for="search">Search</label><input name="search" id="search" class="form-control" ng-change="ExplorerListCtrl.searchChanged()" ng-model="ExplorerListCtrl.search" placeholder="Search by {{ExplorerListCtrl.displayedAttributes.length ? ExplorerListCtrl.displayedAttributes.join(\' or \') + \' or \' : \'\'}}id"></div></div></div><div class="row"><div class="col-sm-12"><p ng-if="ExplorerListCtrl.loading && ExplorerListCtrl.firstLoad">Loading...</p><p ng-if="!ExplorerListCtrl.gridOptions.data.length && ExplorerListCtrl.loading === false && !ExplorerListCtrl.search">No {{ExplorerListCtrl.configModel.identity ? ExplorerListCtrl.configModel.identity : \'entry\'}} yet. <a data-ui-sref="strapi.explorer.list.create({model:$stateParams.model})">Create a new one.</a></p><p ng-if="!ExplorerListCtrl.gridOptions.data.length && ExplorerListCtrl.loading === false && ExplorerListCtrl.search">No results.</p><div id="explorer-grid-container" class="explorer-grid-container" ng-show="ExplorerListCtrl.gridOptions.data.length || (ExplorerListCtrl.loading !== true && ExplorerListCtrl.loading !== false)" ng-class="{\'loading\': ExplorerListCtrl.loading}"><div ui-grid="ExplorerListCtrl.gridOptions" ui-grid-pagination ui-grid-resize-columns ui-grid-move-columns ui-grid-auto-resize ng-style="ExplorerListCtrl.getTableStyle()" class="grid"></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/strapi/explorer/explorer.html',
    '<div class="row explorer-tutorial"><div class="col-sm-12"><h1 class="page-header">Data Explorer</h1><div class="panel panel-default"><div class="panel-heading">Generate your first API</div><div class="panel-body"><p>It looks like you don\'t have any API yet.</p><p>The Strapi ecosystem offers you two possibilities to create a complete RESTful API.</p><ul class="list-unstyled"><li><p class="bold explorer-tutorial-title">Via the CLI</p><code class="block">$ strapi generate api</code><p>For example, you can create a `car` API with a name (`name`), year (`year`) and the license plate (`license`) with:</p><code class="block">$ strapi generate api car name:string year:integer license:string</code></li><li><p class="bold explorer-tutorial-title">Via the Strapi Studio</p><p>The Strapi Studio allows you to easily build and manage your application environment thanks to a powerful User Interface.</p><p>Log into the Strapi Studio with your user account <a href="http://studio.strapi.io" target="_blank">http://studio.strapi.io</a> and follow the instructions to start the experience.</p></li></ul></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/strapi/users/users.html',
    '<div class="row"><div class="col-sm-12"><h1 class="page-header">Users</h1><div class="panel panel-default"><div class="panel-heading">Welcome to your {{configService.getConfig().isNewApp ? \'new \' : \'\'}}<a href="http://www.strapi.io" target="_blank">Strapi.io</a> app.</div><div class="panel-body"><p>If you have any question, see our <a href="http://www.strapi.io/documentation" target="_blank">documentation</a> for more information. Or contact the community on Stackoverflow, Github...</p><p>Check our GitHub to follow the improvements on <a href="http://www.strapi.io" target="_blank">Strapi.io</a></p></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/core/auth/change-password/change-password.html',
    '<div class="row margin-top"><div class="col-sm-4 col-sm-offset-4"><div class="login-panel panel panel-success"><div class="panel-heading bg-success"><div class="center-block logo-container"><h3 class="panel-title"><img class="img-responsive center-block" ng-src="{{Config.frontendUrl}}/assets/images/logo.png" alt="Logo"></h3></div></div><div class="panel-body"><h1 class="h3">Change password</h1><p>Please choose a password with a minimum of 8 characters.</p><form name="ChangePasswordCtrl.changePasswordForm" novalidate><formly-form model="ChangePasswordCtrl.form" fields="ChangePasswordCtrl.fields"></formly-form><button class="btn btn-default btn-block" type="submit" data-ng-click="ChangePasswordCtrl.action()">Submit</button></form></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/core/auth/forgot-password/forgot-password.html',
    '<div class="row margin-top"><div class="col-sm-4 col-sm-offset-4"><div class="login-panel panel panel-success"><div class="panel-heading bg-success"><div class="center-block logo-container"><h3 class="panel-title"><img class="img-responsive center-block" ng-src="{{Config.frontendUrl}}/assets/images/logo.png" alt="Logo"></h3></div></div><div class="panel-body"><h1 class="h3">Forgot password</h1><p>We will send you an email with a link to get<br>your new password. <a href="#" data-ui-sref="auth.register">Not registered?</a></p><form name="ForgotPasswordCtrl.forgotPasswordForm" novalidate><formly-form model="ForgotPasswordCtrl.form" fields="ForgotPasswordCtrl.fields"></formly-form><button class="btn btn-default btn-block" type="submit" data-ng-click="ForgotPasswordCtrl.action()">Send request</button></form></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/core/auth/login/login.html',
    '<div class="row margin-top login"><div class="col-sm-4 col-sm-offset-4"><div class="login-panel panel panel-success"><div class="panel-heading bg-success"><div class="center-block logo-container"><h3 class="panel-title"><img class="img-responsive center-block" ng-src="{{Config.frontendUrl}}/assets/images/logo.png" alt="Logo"></h3></div></div><div class="panel-body"><h1 class="h3">Login</h1><form name="LoginCtrl.loginForm" novalidate><formly-form model="LoginCtrl.credentials" fields="LoginCtrl.fields"></formly-form><p class="auth-forgot"><a href="#" data-ui-sref="auth.forgotPassword">Forgot Password?</a></p><button class="btn btn-default btn-block" type="submit" data-ng-click="LoginCtrl.action()" data-ng-disabled="LoginCtrl.loading">Login</button></form></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/core/auth/register/confirm.html',
    '<div class="row"><div class="col-sm-4 col-sm-offset-4"><div class="login-panel panel panel-success"><div class="panel-heading bg-success"><h3 class="panel-title">Registration succeeded</h3></div><div class="panel-body"><p>We send you an email with a link to confirm your account.</p><p><a href="#" data-ui-sref="auth.login">Go to login page</a>.</p></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/core/auth/register/register.html',
    '<div class="row margin-top register"><div class="col-sm-4 col-sm-offset-4"><div class="login-panel panel panel-success"><div class="panel-heading bg-success"><div class="center-block logo-container"><h3 class="panel-title"><img class="img-responsive center-block" ng-src="{{Config.frontendUrl}}/assets/images/logo.png" alt="Logo"></h3></div></div><div class="panel-body"><div class="text-center"><h1 class="h3">Welcome</h1><p>Please fill out this form to create your first user. This user will have the root permissions (full-access) to the application.</p></div><form name="RegisterCtrl.registrationForm" novalidate><formly-form model="RegisterCtrl.user" fields="RegisterCtrl.fields"></formly-form><button class="btn btn-default btn-block" type="submit" data-ng-click="RegisterCtrl.action()" data-ng-disabled="RegisterCtrl.loading">Register</button></form></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/core/error/partials/error.html',
    '<div class="container"><div class="col-md-4 col-md-offset-4 margin-top"><div class="panel panel-warning"><div class="panel-heading"><span class="text-center">An error occurred...</span></div><div class="panel-body"><p>{{ErrorCtrl.error.message}}</p><p data-ng-show="ErrorCtrl.error.fromState.name"><a href="#" data-ng-click="ErrorCtrl.goToPrevious()">Back to previous page</a></p><p data-ng-show="!ErrorCtrl.error.fromState.name && user()"><a data-ui-sref="strapi.dashboard">Go to Dashboard</a></p><p data-ng-show="!ErrorCtrl.error.fromState.name && !user().id"><a data-ui-sref="auth.login">Go to Login page</a></p></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/core/layout/partials/header.html',
    '<div class="navbar navbar-default navbar-static-top" role="navigation" style="margin-bottom: 0"><div class="navbar-header"><a class="navbar-brand no-border" data-ui-sref="strapi.dashboard"><img ng-src="{{Config.frontendUrl}}/assets/images/logo.png" class="img-responsive logo center-block" alt="Logo"></a></div><div class="navbar-links-container"><ul class="nav navbar-top-links navbar-right"><li class="dropdown navbar-user" uib-dropdown is-open="false"><a class="dropdown-toggle cursor-pointer no-border navbar-user-dropdown" uib-dropdown-toggle><img class="navbar-user-img" ng-src="{{Config.frontendUrl}}/assets/images/user-picture.png" alt="User profile"> {{user().username}} <i class="fa fa-angle-down"></i></a><ul class="dropdown-menu dropdown-user" role="menu"><li><a data-ui-sref="strapi.explorer.list.edit({model:\'user\',entryId:user().id})"><i class="fa fa-user fa-fw"></i> User Profile</a></li><li class="divider"></li><li class="cursor-pointer"><a data-ng-click="HeaderCtrl.logout()"><i class="fa fa-sign-out fa-fw"></i> Logout</a></li></ul></li></ul></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/core/layout/partials/menu.html',
    '<div class="navbar-default sidebar active" id="menu" role="navigation" ng-controller="MenuController as MenuCtrl"><div class="sidebar-nav navbar-collapse"><ul class="nav" id="side-menu"><li><a data-ui-sref-active="active" data-ui-sref="strapi.dashboard" ng-click="MenuCtrl.expand(\'dashboard\')"><i class="fa fa-dashboard"></i> <span class="title">Dashboard</span></a></li><li><a class="parent-link cursor-pointer" ng-class="{active: !MenuCtrl.collapsedBooleans[\'explorer\']}" ng-click="MenuCtrl.expand(\'explorer\')"><i class="fa fa-cubes"></i> <span class="title">Models</span> <span class="fa arrow"></span></a><ul class="nav nav-second-level" ng-class="{open: !MenuCtrl.collapsedBooleans[\'explorer\']}" uib-collapse="MenuCtrl.collapsedBooleans[\'explorer\']"><li data-ng-repeat="link in MenuCtrl.menuLinks.models"><a data-ui-sref="strapi.explorer.list({model:link.model})" data-ui-sref-opts="{inherit: false}" data-ui-sref-active="active">{{ link.model | pluralize | humanize | capitalize }}</a></li><li data-ng-if="!MenuCtrl.menuLinks.models.length"><a data-ui-sref-active="active" data-ui-sref="strapi.explorer.home">No model yet</a></li></ul></li><li><a class="parent-link cursor-pointer" ng-class="{active: !MenuCtrl.collapsedBooleans[\'users\']}" ng-click="MenuCtrl.expand(\'users\')"><i class="fa fa-users"></i> <span class="title">Users</span> <span class="fa arrow"></span></a><ul class="nav nav-second-level" ng-class="{open: !MenuCtrl.collapsedBooleans[\'users\']}" uib-collapse="MenuCtrl.collapsedBooleans[\'users\']"><li><a data-ui-sref-active="active" data-ui-sref="strapi.explorer.list({model:\'user\'})">List of users</a></li><li><a data-ui-sref-active="active" data-ui-sref="strapi.explorer.list({model:\'role\'})">Roles</a></li><li><a data-ui-sref-active="active" data-ui-sref="strapi.users.permissions">Permissions</a></li></ul></li></ul></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/core/services/partials/confirmation-modal.html',
    '<div class="modal-header"><h3 class="modal-title">{{options.title}}</h3></div><div class="modal-body"><p>{{options.content}}</p></div><div class="modal-footer"><button class="btn btn-default" type="button" ng-click="cancel()">Cancel</button> <button class="btn btn-warning" type="button" ng-click="ok()">Yes</button></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('frontend-templates');
} catch (e) {
  module = angular.module('frontend-templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/frontend/strapi/users/permissions/permissions.html',
    '<form novalidate class="permissions"><div class="row"><div class="col-sm-8"><h1 class="page-header">Permissions</h1></div><div class="col-sm-4"><div class="pull-right action-btn-container"><button class="btn btn-default" type="button" data-ng-click="UsersPermissionsCtrl.cancel()">Cancel</button> <button class="btn btn-success" type="button" data-ng-click="UsersPermissionsCtrl.update()">Update</button></div></div></div><div class="row"><div class="col-sm-8 col-sm-offset-4"><ul class="list-inline"><li ng-style="{width: UsersPermissionsCtrl.colWidth}" class="text-center"><strong>Public</strong></li><li ng-style="{width: UsersPermissionsCtrl.colWidth}" class="text-center"><strong>Is Contributor</strong></li><li ng-style="{width: UsersPermissionsCtrl.colWidth}" class="text-center"><strong>Registered</strong></li><li ng-repeat="role in UsersPermissionsCtrl.roles" ng-style="{width: UsersPermissionsCtrl.colWidth}" class="text-center"><strong>{{role.name | capitalize}}</strong></li></ul></div></div><div class="panel-group" role="tablist"><div class="panel" ng-repeat="(key, routes) in UsersPermissionsCtrl.routes | orderBy:route.verb"><div class="panel-heading cursor-pointer" role="tab" ng-click="UsersPermissionsCtrl.collapse(key)"><h4 class="panel-title"><a class="no-border">{{key|capitalize}}</a></h4></div><ul class="list-group" uib-collapse="UsersPermissionsCtrl.collapsedBooleans[key]"><li class="list-group-item" ng-repeat="route in routes"><div class="row"><div class="col-sm-4"><kbd class="{{UsersPermissionsCtrl.getRouteClass(route.verb)}}">{{route.verb | uppercase}}</kbd> <code>{{route.path}}</code></div><div class="col-sm-8"><div class="row"><div ng-style="{width: UsersPermissionsCtrl.colWidth}" class="float-left text-center checkbox-container"><strapi-switch id="isPublic" name="isPublic" ng-model="route.isPublic" class="green"></strapi-switch></div><div ng-style="{width: UsersPermissionsCtrl.colWidth}" class="float-left text-center checkbox-container clearfix"><strapi-switch id="contributorsAuthorized" name="contributorsAuthorized" ng-model="route.contributorsAuthorized" ng-show="!route.isPublic && _.includes(route.policies, \'isAuthorized\')" class="green"></strapi-switch></div><div ng-style="{width: UsersPermissionsCtrl.colWidth}" class="float-left text-center checkbox-container"><strapi-switch ng-model="route.registeredAuthorized" ng-show="!route.isPublic && (!route.contributorsAuthorized || !_.includes(route.policies, \'isAuthorized\')) && (_.includes(route.policies, \'isAuthorized\') || _.includes(route.policies, \'authenticated\'))">class="green"></strapi-switch></div><div ng-style="{width: UsersPermissionsCtrl.colWidth}" class="float-left text-center checkbox-container" ng-repeat="role in UsersPermissionsCtrl.roles"><strapi-switch ng-disabled="UsersPermissionsCtrl.roles.length - 1 === $index" ng-model="route.roles[$index].enabled" class="green"></strapi-switch></div></div></div></div></li></ul></div></div></form>');
}]);
})();
