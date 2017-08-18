(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('featureController', featureController);
    featureController.$inject = ['$scope', '$state', '$controller', 'RoleDetails', 'ERROR_MSGS', '$uibModalInstance', '$sce'];
    function featureController($scope, $state, $controller, RoleDetails, ERROR_MSGS, $uibModalInstance, $sce) {
        angular.extend(this, $controller('softwareController', {$scope: $scope, $uibModalInstance: $uibModalInstance}));
        $scope.help = $sce.trustAsHtml('Click &lsquo;Edit&rsquo; to change an existing item.<br/><br/>\
                        Fill in fields, upload a file (when applicable) and click Save to create/update an item.<br/><br/>\
                        All fields with asterisk (*) mark are required.<br/><br/>\
                        Check for fields in <span style="color: red">red border</span> if Save button is unavailable');
        $scope.addSku = function (sku) {
            if (!sku || typeof sku !== 'string') return;

            sku = sku.trim();
            if (sku.length === 0) return;

            if (!$scope.roleData.skuCodes) {
                $scope.roleData.skuCodes = [];
            }

            if ($scope.roleData.skuCodes.indexOf(sku) > -1) return;

            $scope.roleData.skuCodes.push(sku);
            $scope.inputedSku = '';
        };

        $scope.deleteSku = function (sku) {
            if (!$scope.roleData.skuCodes) {
                $scope.roleData.skuCodes = [];
            }
            var index = $scope.roleData.skuCodes.indexOf(sku);
            $scope.roleData.skuCodes.splice(index, 1);
        };

        var clearAssociation = function () {
            $scope.searchResult = {};
            $scope.roleData.clientAssociations = {};
        };

        $scope.updateType = function (key, displayObj) {
            if(key !== 'featureStatus' || $scope.createRecord) clearAssociation();
            $scope.roleData[key] = displayObj.displayName;
            $scope.roleData[key + 'Id'] = displayObj.value;
            $scope.visibility = {};
        };
    };
})();