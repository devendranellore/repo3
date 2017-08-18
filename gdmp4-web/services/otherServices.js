(function () {
    'use strict';
    angular.module('MedApp')
    .filter('titleCase', titleCase)
    .filter('yesNo', yesNo)
    .filter('isEmpty', isEmpty)
    .filter('receipants', receipants)
    .filter('orderObjectBy', orderObjectBy)
    .filter('startsWithLetter', startsWithLetter)
    .service('ctrlName', ctrlName)
    .directive('itemAssociations', itemAssociations)
    .directive('associations', associations)
    .directive('compatibleItems', compatibleItems)
    .directive('deviceItems', deviceItems)
    .directive('yesNoAttr', yesNoAttr)
    .directive('facilityItems',facilityItems)
    .config(provide);
    
    function provide($provide) {

        $provide.decorator("$exceptionHandler", function ($delegate, $injector) {
            return function (exception, cause) {
                var $rootScope = $injector.get("$rootScope"),
                $location = $injector.get("$location");
                $rootScope.medErr = "Server Error : Please try later"
                //TODO send the error log to BE server.
                console.log({
                    message: "Exception",
                    reason: exception
                });
                $location.path("/login");
                $delegate(exception, cause);
            };
        });
    }

    function yesNo() {
        return function (text) {
            if (text)
            {
                return 'Yes';
            }
            return 'No';
        };
    }

    function isEmpty() {
        return function(object) {
            return angular.equals({}, object);
        };
    }

    function receipants() {
        return function (text) {
            if (text){
                return 'Medtronic Only';
            }
            return 'All Users';
        };
    }

    function yesNoAttr() {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$formatters.push(yesNo());
            }
        };
    }

    function titleCase() {
        return function (input) {
            input = input + '' || '';
            return input.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        };
    }

    function orderObjectBy() {
        return function (input, attribute) {
            if (!angular.isObject(input))
                return input;

            var array = [];
            for (var objectKey in input) {
                array.push(input[objectKey]);
            }

            array.sort(function (a, b) {
                a = parseInt(a[attribute]);
                b = parseInt(b[attribute]);
                return a - b;
            });
            return array;
        }
    }

    function startsWithLetter() {
        return function (items, letter) {
            var filtered = [];
            if(items != undefined && items != null)
            {
                if(letter != undefined && letter != null)
                {
                    var letterMatch = new RegExp(letter, 'i');
                    var letterLenth = letterMatch.toString().length;
                    var d = letterLenth - 3;
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        if (letterMatch.test(item.displayName.substring(0, d))) {
                            filtered.push(item);
                        }
                    }
                }
            }
            return filtered;
        };
    }

    function ctrlName($controller) {
        return {
            exists: function (controllerName) {
                if (typeof window[controllerName] === 'function')
                {
                    return true;
                }
                try {
                    $controller(controllerName);
                    return true;
                } catch (error) {
                    return !(error instanceof TypeError);
                }
            }
        };
    };

    function associations() {
        return {
            restrict: 'E',
            scope: {
                roleConfig: "@role",
                configRoleType: "@",
                readOnlyFlag: "=readOnlyFlag",
                searchType: "&searchType",
                roleData: "=roleData",
                addAssociation: "&",
                removeAssociation: "&",
                isEmptyObj: "&",
                searchResult: "=searchResult"
            },
            templateUrl: 'partials/shared/associateTypes.html'
        };
    }

    function itemAssociations() {
        return {
            restrict: 'E',
            scope: {
                roleConfig: "@",
                readOnlyFlag: "=readOnlyFlag",
                searchType: "&searchType",
                roleData: "=roleData",
                addAssociation: "&",
                removeAssociation: "&",
                isEmptyObj: "&",
                warningType: "=",
                searchResult: "=searchResult"
            },
            templateUrl: 'partials/shared/associateItemTypes.html'
        };
    }
    function compatibleItems() {
        return {
            restrict: 'E',
            scope: {
                roleConfig: "@",
                readOnlyFlag: "=readOnlyFlag",
                searchType: "&searchType",
                roleData: "=roleData",
                addAssociation: "&",
                removeAssociation: "&",
                isEmptyObj: "&",
                docType: "=",
                searchResult: "=searchResult"
            },
            templateUrl: 'partials/shared/compatibleItems.html'
        };
    }
    function facilityItems() {
        return {
            restrict: 'E',
            scope: {
                roleConfig: "@",
                readOnlyFlag: "=readOnlyFlag",
                searchType: "&searchType",
                roleData: "=roleData",
                addAssociation: "&",
                removeAssociation: "&",
                isEmptyObj: "&",
                docType: "=",
                searchResult: "=searchResult"
            },
            templateUrl: 'partials/shared/facilityItems.html'
        };
    }
    function deviceItems() {
        return {
            restrict: 'E',
            scope: {
                roleType: "@",
                deviceData: "=deviceData",
                isEmptyObj: "&",
                displaySlNumber:"=displaySlNumber"
            },
            templateUrl: 'partials/shared/deviceItems.html'
        };
    }
})()