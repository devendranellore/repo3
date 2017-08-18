(function () {
    'use strict';
    var app = angular.module('MedApp', ['ModAuth', 'ModAPI', 'ngRoute', 'ui.router', 'ui.bootstrap', 'ui.dateTimeInput', 'ui.bootstrap.datetimepicker', 'angular-toArrayFilter', 'ngFileUpload', 'ngSanitize'])
            .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];

    function config($stateProvider, $routeProvider, $httpProvider) {
        $routeProvider.otherwise("/");
        $stateProvider
            .state('login', {
                url: "^/login",
                controller: 'LoginController',
                templateUrl: 'partials/login.html'
            })
            .state('agentDownload', {
                url: '^/agent-download',
                // controller: 'AgentDownloadController',
                templateUrl: 'partials/agent-download.html'
            })
            .state('resetPassword', {
                url: '^/reset-password/:token',
                controller: 'PasswordController',
                templateUrl: 'partials/reset-password.html'
            })
            .state('selfRegistration', {
                url: '^/self-registration',
                controller: 'SelfRegistrationController',
                templateUrl: 'partials/self-registration.html'
            })
            .state('changePassword', {
                url: '^/change-password',
                templateUrl: 'partials/change-password.html',
                controller: 'PasswordController'
            })
            .state('home', {
                url: "/",
                controller: 'HomeController',
                templateUrl: 'partials/header.html'
            })
            .state('home.portal', {
                url: "^/home",
                templateUrl: 'partials/home.html',
                params: {
                    coT: null
                }
            })
            .state('home.user', {
                url: "^/role/user/:tab",
                controller: 'UserListController',
                templateUrl: 'partials/user/role.html',
                params: {
                    role: null,
                    tab: null,
                    cot: null,
                }
            })
            .state('home.feature', {
                url: "^/role/feature",
                controller: 'FeatureListController',
                templateUrl: 'partials/feature/role.html',
                params: {
                    role: null,
                    tab: null,
                    cot: null,
                }
            })
            .state('home.alerts', {
                url: "^/role/alerts",
                controller: 'AlertRoleController',
                templateUrl: 'partials/alerts/role.html',
                params: {
                    role: null,
                    cot: null
                }
            })
            .state('home.reports', {
                url: "^/reports/:report",
                controller: 'ReportController',
                templateUrl: 'partials/report.html',
                params: {
                    role: null,
                    cot: null,
                    report: null
                }
            })
            .state('home.softwareReport', {
                url: "^/softwareReport/:report",
                controller: 'SWReportController',
                templateUrl: 'partials/reports/deviceReports.html',
                params: {
                    report: null
                }
            })
            .state('home.admin', {
                url: "^/role/admin",
                controller: 'AdminTabController',
                templateUrl: 'partials/admin/main-tab.html',
                params: {
                    role: null,
                    cot: null,
                    rootState: 'home.admin',
                    tabs: [
                        {title: 'Role Entry', name: '.roleEntry'},
                        {title: 'Role Permissions', name: '.rolePermissions'},
                        {title: 'Customer', name: '.customerFacility'},
                        {title: 'Default Trainer', name: '.defaultTrainer'},
                        {title: 'Approving Manager', name: '.approvingManager'},
                        {title: 'Miscellaneous', name: '.miscellaneous'},
                        {title: 'Software Packages', name: '.softwarePackages'},
                        {title: 'Client Software', name: '.clientSoftware'}
                    ]
                }
            })
            .state('home.admin.roleEntry', {
                url: "^/role/admin/role-entry",
                templateUrl: 'partials/admin/search-general.html',
                controller: 'AdminRoleController',
                params: {
                    roleOverride: "role"
                }
            })
            .state('home.admin.rolePermissions', {
                url: "^/role/admin/role-permissions",
                templateUrl: 'partials/admin/role-permissions.html',
                controller: 'RolePermissionsController'
            })
            .state('home.admin.customerFacility', {
                url: "^/role/admin/customer-facility",
                templateUrl: 'partials/admin/search-general.html',
                controller: 'AdminRoleController',
                params: {
                    roleOverride: "customer"
                }
            })
            // .state('home.admin.customerFacility.customer', {
            //     url: "^/role/admin/customer-facility/customer",
            //     templateUrl: 'partials/admin/search-general.html',
            //     controller: 'AdminRoleController',
            //     params: {
            //         roleOverride: "customer"
            //     }
            // })
            // .state('home.admin.customerFacility.facility', {
            //     url: "^/role/admin/customer-facility/facility",
            //     templateUrl: 'partials/admin/search-general.html',
            //     controller: 'AdminRoleController',
            //     params: {
            //         roleOverride: "facility"
            //     }
            // })
            .state('home.admin.defaultTrainer', {
                url: "^/role/admin/default-trainer",
                templateUrl: 'partials/admin/default-trainer.html',
                controller: 'DefaultTrainerController'
            })
            .state('home.admin.approvingManager', {
                url: "^/role/admin/approving-Manager",
                templateUrl: 'partials/admin/search-general.html',
                controller: 'AdminRoleController',
                params: {
                    roleOverride: "mdtapprovemgr"
                }
            })
            .state('home.admin.miscellaneous', {
                url: "^/role/admin/misc",
                templateUrl: 'partials/admin/sub-tab.html',
                controller: 'SubTabController',
                params: {
                    rootSubState: 'home.admin.miscellaneous',
                    subTabs: [
                        {title: 'Trade Embargo', name: '.tradeEmbargo'},
                        {title: 'File Extension Whitelist', name: '.fileExtWhitelist'}
                    ]
                }
            })
            .state('home.admin.miscellaneous.tradeEmbargo', {
                url: "^/role/admin/misc/trade-embargo",
                templateUrl: 'partials/admin/trade-embargo.html',
                controller: 'TradeEmbargoController'
            })
            .state('home.admin.miscellaneous.fileExtWhitelist', {
                url: "^/role/admin/misc/file-ext",
                templateUrl: 'partials/admin/file-extension.html',
                controller: 'FileExtensionController'
            })
            .state('home.admin.softwarePackages', {
                url: "^/role/admin/software-packages",
                templateUrl: 'partials/admin/software-packages.html',
                controller: 'SoftwarePackagesController'
            })
            .state('home.admin.clientSoftware', {
                url: "^/role/admin/client-software",
                templateUrl: 'partials/admin/search-general.html',
                controller: 'AdminRoleController',
                params: {
                    roleOverride: "clientsoftware"
                }
            })
            .state('home.role', {
                url: "^/role/:role",
                controller: 'RoleController',
                templateUrl: 'partials/role.html',
                params: {
                    role: null,
                    cot: null
                }
            })               
            .state('home.download', {
                url: "^/agent/download",
                controller: 'AgentDownloadController',
                templateUrl: 'partials/agent-download.html'
            })
            .state('home.type', {
                url: "^/type/:role",
                controller: 'TypeController',
                templateUrl: 'partials/type.html',
                params: {
                    role: null
                }
            })
            .state('pendingRequest', {
                url: "^/pending_registration/:tokenStr?token",
                controller: 'pendingController',
                templateUrl: 'partials/pending.html',
                params: {
                    token: null
                }
            });

        $httpProvider.defaults.withCredentials = true;
        // $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';

    }


})();


