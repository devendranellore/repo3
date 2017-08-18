(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('configurationController', function ($scope, $log, $controller, $uibModalInstance, RoleDetails, ERROR_MSGS, $sce) {
        angular.extend(this, $controller('hardwareController', {$scope: $scope, $uibModalInstance: $uibModalInstance, $sce: $sce}));
        var tmpData = $scope.roleData;
        $scope.help = $sce.trustAsHtml('Select a type of named configuration first.<br/><br/>\
                    Fill all required fields with asterisk (*) mark, select warning config type and then add associated items.<br/><br/>\
                    Enter 3 spaces in text box to search for items available to associate with current configuration.<br/><br/>\
                    Available items to add into association may vary by selected device type, status and warning config type.<br/><br/>\
                    Check for fields in <span style="color: red">red border</span> if Save button is unavailable.<br\><br\>Click Help again to hide this message');
        $scope.checkReadiness = function () {
            if ($scope.createRecord){
                if ($scope.metaData && $scope.metaData.warning_type){
                    return true;
                }
                $log.debug("Error in MetaData");
                return false;
            }
            if ($scope.roleData && $scope.roleData.configType){
                var cTypes = ['system', 'feature', 'hardware', 'software'];
                if (cTypes.indexOf($scope.roleData.configType.toLowerCase()) < 0){
                    $log.debug("Error in ConfigType");
                    return false;
                }
            } else{
                $log.debug("Error in ConfigType");
                return false;
            }
            return true;
        };

        $scope.displayWarningList = false;

        var clearAssociation = function () {
            $scope.searchResult = {};
            $scope.roleData.clientAssociations = {};
        };

        $scope.remAssocNChgConfig = function () {
            clearAssociation();
            if ($scope.createRecord && !$scope.cloneRecord){
                $scope.makeWarning = {};
                return;
            }
            if ($scope.roleData.configType){
                if ($scope.roleData.configType.toLowerCase() === 'system'){
                    var configData = ['softwareConfiguration', 'featureConfiguration', 'hardwareConfiguration'];
                    $scope.roleData.clientAssociations = {};
                    angular.forEach(configData, function (value, key) {
                        if (tmpData && tmpData[value]){
                            $scope.roleData.clientAssociations[value] = tmpData[value];
                        }
                    });
                    $scope.makeWarning = {SYSConfig: true}; //This is make proper associations
                } else {
                    var tmpConfig = $scope.roleData.configType.toLowerCase();
                    switch (tmpConfig) { //This is make proper associations
                        case 'feature':
                            $scope.makeWarning = {FEConfig: true};
                            $scope.roleData.clientAssociations['features'] = tmpData['features'];
                            break;
                        case 'software':
                            $scope.makeWarning = {SWConfig: true};
                            $scope.roleData.clientAssociations['softwares'] = tmpData['softwares'];
                            break;
                        case 'hardware':
                            $scope.makeWarning = {HWConfig: true};
                            $scope.roleData.clientAssociations['hardwares'] = tmpData['hardwares'];
                            break;
                    }
                }
            }
        };
        $scope.remAssocNChgConfig();

        $scope.changeConfigType = function () {
            //$scope.roleData.isWarning = !$scope.roleData.isWarning;
            $scope.displayWarningList = $scope.roleData.warning;
            $scope.roleData.clientAssociations = {};
            $scope.roleData.warningType = null;
            $scope.roleData.warningTypeId = null;
        };
        $scope.checkMakeWarning = function () {
            if ($scope.roleData)
                $scope.displayWarningList = $scope.roleData.warning;
            var tmpWarning = $scope.makeWarning;
            if (!tmpWarning)
                return;
            return(tmpWarning.FEConfig || tmpWarning.SWConfig || tmpWarning.HWConfig || tmpWarning.SYSConfig);
        };
        //the associationKey & type will be same in most of the cases
        $scope.addAssociation = function (index, associationKey, searchObj, type, root) {
            if (type === undefined)
                type = associationKey;
            if (root == undefined)
                root = true;
            var tmpId = searchObj.basic.id,
                    tmpObj = $scope.roleData;
            $scope.roleData.root = root;
            if (!(tmpObj.clientAssociations)){
                tmpObj.clientAssociations = {};
                tmpObj.clientAssociations[associationKey] = {};
            } else {
                tmpObj.clientAssociations[associationKey] = (!tmpObj.clientAssociations[associationKey]) ? {} : tmpObj.clientAssociations[associationKey];
            }
            if(Object.keys($scope.makeWarning)[0]==='SYSConfig'){
                tmpObj.clientAssociations[associationKey] = {};
                tmpObj.clientAssociations[associationKey][tmpId] = $scope.searchResult[type][index].detail;
            } else if (!(tmpObj.clientAssociations[associationKey][tmpId])){
                tmpObj.clientAssociations[associationKey][tmpId] = $scope.searchResult[type][index].detail;
            }
            $scope.roleData.clientAssociations = tmpObj.clientAssociations;
        };

        $scope.removeAssociation = function (index, ObjKey) {
            delete $scope.roleData.clientAssociations[ObjKey][index];
            if(Object.keys($scope.roleData.clientAssociations[ObjKey]).length < 1){
                delete $scope.roleData.clientAssociations[ObjKey];
            }
        };

        $scope.$watch('makeWarning', function (Obj) {
            Obj = Obj || {};
            var configType;
            if (!$scope.createRecord){
                ($scope.roleData.configType) ? $scope.makeWarningTypes($scope.roleData.configType.toLowerCase()) : "";
                return;
            }else if(!$scope.cloneRecord){
                $scope.roleData.warningType = '';
                $scope.roleData.warningTypeId = '';
            }
            configType = 'system';
            if (Obj.HWConfig){
                configType = 'hardware';
            };
            if (Obj.SWConfig){
                configType = 'software';
            };
            if (Obj.FEConfig){
                configType = 'feature';
            };
            $scope.roleData.configType = configType;
            $scope.makeWarningTypes(configType);
        }, true);

        $scope.$watch('roleData', function(){
            $scope.validated = true;
            if($scope.roleData){
                if ($scope.roleData.configType === 'system' || $scope.roleData.configType === 'System'){
                    $scope.hasSWConfig = (!$scope.roleData.warning || ($scope.roleData.warningTypeId !== 1 && $scope.roleData.warningTypeId !== 3 && $scope.roleData.warningTypeId !== 6)) ? true : false;
                    $scope.hasHWConfig = (!$scope.roleData.warning || ($scope.roleData.warningTypeId !== 2 && $scope.roleData.warningTypeId !== 3 && $scope.roleData.warningTypeId !== 7)) ? true : false;
                    $scope.hasFeatureConfig = (!$scope.roleData.warning || ($scope.roleData.warningTypeId !== 1 && $scope.roleData.warningTypeId !== 2 && $scope.roleData.warningTypeId !== 4 && $scope.roleData.warningTypeId !== 5)) ? true : false;
                    if ($scope.hasSWConfig && !$scope.roleData.clientAssociations.softwareConfiguration) $scope.validated = false;  
                    if ($scope.hasHWConfig && !$scope.roleData.clientAssociations.hardwareConfiguration) $scope.validated = false;
                    if ($scope.roleData.warning && !$scope.roleData.warningType) $scope.validated = false;
                }
                else if (($scope.roleData.configType === 'software' || $scope.roleData.configType === 'Software') && !$scope.roleData.clientAssociations.softwares) $scope.validated = false;
                else if (($scope.roleData.configType === 'hardware' || $scope.roleData.configType === 'Hardware') && !$scope.roleData.clientAssociations.hardwares) $scope.validated = false;
                else if (($scope.roleData.configType === 'feature' || $scope.roleData.configType === 'Feature') && !$scope.roleData.clientAssociations.features) $scope.validated = false;
            }
        }, true);

        $scope.cancelConfirmation = function () {
            $scope.alertType = {show: false};
            $scope.showLoader = false;
        }

        $scope.save = function (confirmation) {
            $scope.showLoader = true;
            angular.merge($scope.roleData, $scope.roleData.clientAssociations);
            if($scope.roleData.clientAssociations.softwareConfiguration !== undefined ||
               $scope.roleData.clientAssociations.softwares !== undefined || 
               $scope.roleData.clientAssociations.hardwareConfiguration !== undefined ||
               $scope.roleData.clientAssociations.hardwares !== undefined || 
               $scope.roleData.clientAssociations.featureConfiguration !== undefined || 
               $scope.roleData.clientAssociations.features !== undefined
               ){
            } else {
                $scope.alertType = {
                    show : true,
                    class: 'danger',
                    msg: 'No associated Items'
                }
                return;
            }    
            $scope.roleData.userConfirmation = confirmation;
            if (confirmation===false) {
                $scope.showLoader = false;
                return;
            }
            var method = ($scope.createRecord) ? 'postData' : 'putData';
            RoleDetails[method]($scope.role, $scope.roleData, function (response) {
                if (response.status === 200){   
                    $scope.alertType = {
                        show: true,
                        confirmation: response.data.confirmation,
                        class: 'success',
                        msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                    };
                    $scope.saveSuccess = true;
                    $scope.getData(1);
                } else {
                    updatePostError(response);
                }
            }, function (response) {
                updatePostError(response);
            });
            function updatePostError(response) {
                $scope.saveSuccess = false;
                $scope.alertType = {
                    show: true,
                    class: 'danger',
                    msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR
                };
            }
        };
    })
})();
