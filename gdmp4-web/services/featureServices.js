/* Feature Service*/

(function () {
    'use strict';
    angular.module('ModAuth')
        .factory('FeatureService', FeatureService);

    FeatureService.$inject = ['$http', 'MED_API'];

    function FeatureService($http, MED_API) {
        var featureService = {},
            featureEntitlementApiEndPoint = MED_API.BASE_URL + 'featureEntitlement',
            featureHistoryApiEndPoint = MED_API.BASE_URL + 'deviceFeatureHistory';            
        featureService.queryFeatureEntitlement = function (cot, deviceSerialNumber, callback) {
            $http.get(featureEntitlementApiEndPoint, {
                cot,
                deviceSerialNumber
            }).then(function (response) {
                callback(response);
            }, function (response) {
                response.message = 'Server error: please try again.';
                callback(response);
            });

        };

        featureService.createFeatureEntitlement = function (featureEntitlement, featureIds, callback) {
            $http.post(featureEntitlementApiEndPoint, {
                featureEntitlement,
                featureIds
            }).then(function (response) {
                callback(response);
            }, function (response) {
                response.message = 'Server error: please try again.';
                callback(response);
            });

        };

        featureService.modifyFeatureEntitlement = function (featureEntitlement, featureIds, callback) {
            $http.put(featureEntitlementApiEndPoint + '/' + featureEntitlement.id, {
                featureEntitlement,
                featureIds
            }).then(function (response) {
                callback(response);
            }, function (response) {
                response.message = 'Server error: please try again.';
                callback(response);
            });

        };

        featureService.queryFeatureHistory = function (cot, deviceSerialNumber, callback) {
            $http.get(featureHistoryApiEndPoint, {
                cot,
                deviceSerialNumber
            }).then(function (response) {
                callback(response);
            }, function (response) {
                response.message = 'Server error: please try again.';
                callback(response);
            });

        };

        return featureService;
    };

})();