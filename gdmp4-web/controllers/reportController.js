(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('ReportController', function ($scope, $rootScope, $http, $stateParams, $log, $controller, RoleDetails, ERROR_MSGS, MED_API, ctrlName, $uibModal, $state) {
        angular.extend(this, $controller('RoleController', {$scope: $scope}));
        var cot = $stateParams.cot || '',
            sortParams = {}, 
            defaultSort = "asc", 
            reverseSort = "desc";
        $scope.alertType = {show: false};
        $scope.base_url = MED_API.BASE_URL;
        $scope.selectedReport = null;
        $scope.hideReportCategories = false;
        $scope.wait = false;
        $scope.popup1 = { opened: false };
        $scope.popup2 = { opened: false };
        $scope.format = 'MM/dd/yyyy';
        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: new Date(1800, 1, 1),
            startingDay: 1
        };
        if($stateParams.myParam){
            $scope.reportName = $stateParams.myParam.reportName;
            $scope.reportDetails = $stateParams.myParam.reportDetails;
            $scope.partName = [{name:'System Configurations'}, {name:'Hardware Configurations'}, {name:'Software Configurations'}, {name:'Feature Configurations'}];
            $scope.printHeader = true;
        }
        $scope.$watch('repData.from', function(newVal){
            if($scope.repData){
                if($scope.repData.from)
                    $scope.dateOptions.minDate = new Date(newVal);
                else{
                    $scope.dateOptions.minDate = new Date(1800, 1, 1);
                    if($scope.repData.dateFrom) delete $scope.repData.dateFrom;
                }
            }
        });
        $scope.$watch('repData.to', function(newVal){
            if($scope.repData){
                if($scope.repData.to)
                    $scope.dateOptions.maxDate = new Date(newVal);
                else{
                    $scope.dateOptions.maxDate = new Date();
                    if($scope.repData.dateTo) delete $scope.repData.dateTo;
                }
            }
        });
        $scope.open1 = function() {
            $scope.popup1.opened = true;
            $scope.dateOptions.minDate = new Date(1800, 1, 1);
        };
        $scope.open2 = function() {
            $scope.popup2.opened = true;
            $scope.dateOptions.maxDate = new Date();
        };
        $scope.toggleRHeader = function () {
            $scope.hideReportCategories = !$scope.hideReportCategories;
        }
        $scope.showReport = function (reportName) {
            $state.transitionTo('home.reports', {report: reportName}, {notify: false});
            $scope.selectedReport = reportName;
            $scope.showPrint = false;
            $scope.repData = {};
            $scope.reportDetails = {};
            $scope.showReportData = false;
            $scope.showLoader = true;
            if(reportName) $scope.hideReportCategories = true;
            var getData = RoleDetails.getTabData('meta/' + $scope.selectedReport + 'Report', $scope.cotId, $scope.role);
            getData.then(function (response) {
                if (!angular.isObject(response.data) || !Object.keys(response.data).length){
                    $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                    return;
                }
                $scope.metaRepData = response.data;
                if($scope.metaRepData.country) $scope.metaRepData.countryList = $scope.metaRepData.country;
                if(reportName === 'softwareAudit'){
                    $scope.repData.searchType = $scope.metaRepData.searchType[1].displayName;
                    $scope.repData.searchTypeId = $scope.metaRepData.searchType[1].value;
                }
                $scope.showLoader = false;
                $scope.modalError = null;
            }, function (error) {
                $scope.showLoader = false;
                $scope.modalError = ERROR_MSGS.LOAD_ERROR;
            }); 
        };

        $scope.showList = function (dropList) {
            $scope.visibility = {};
            $scope.visibility[dropList] = true;
        };

        $scope.updateType = function (key, displayObj) { 
            $scope.repData[key] = displayObj.displayName;
            if(displayObj.displayName !== displayObj.value){
                $scope.repData[key + 'Id'] = displayObj.value;
            }
            $scope.visibility = {};
        };
        $scope.$watch('repData.medtronicEmployee', function(newVal, oldVal){
            if(newVal !== oldVal){
                switch(newVal){
                    case 'Yes':
                    delete $scope.repData.userRole;
                    $scope.isEmp = true;
                    break;
                    case 'No':
                    delete $scope.repData.userRole;
                    $scope.isEmp = false;
                    break;
                    case null:
                    default:
                    $scope.isEmp = null;
                    break;
                }
            }
        });
        $scope.clear = function(filterName){
            delete $scope.repData[filterName];
            delete $scope.repData[filterName+'Id'];
            $scope.visibility[filterName]=false;
        }
        $scope.$watch('repData.cloneEntityType', function(newVal, oldVal){
            if(newVal !== oldVal){
                delete $scope.repData.cloneName;
                delete $scope.metaRepData.cloneName;
            }
        });
        $scope.$watch('repData.country', function(val){
            if($scope.metaRepData){
                if(val){
                    $scope.metaRepData.countryList = [];
                    $scope.metaRepData.country.forEach(function(country){
                        if(country.displayName.toLowerCase().slice(0, val.length) === val.toLowerCase()) {
                            $scope.metaRepData.countryList.push(country);
                        }
                    })
                }else{
                    $scope.metaRepData.countryList = $scope.metaRepData.country.slice();
                }
            }
            $scope.selectedValidCountry = true;
            if($scope.metaRepData && $scope.repData){
                $scope.selectedValidCountry = false;
                if($scope.repData.country){
                    angular.forEach($scope.metaRepData.country, function(value, key){
                        if(value.displayName.toLowerCase() === $scope.repData.country.toLowerCase()){
                            $scope.repData.country = value.displayName
                            $scope.repData.countryId = value.value;
                            $scope.selectedValidCountry = true;
                        }
                    })
                }
            }
        });
        $scope.$watch('repData.deviceType', function(newVal, oldVal){
            if(newVal !== oldVal){
                switch($scope.selectedReport){
                    case 'training':
                    delete $scope.repData.traineeName;
                    delete $scope.metaRepData.traineeName;
                    delete $scope.repData.trainerName;
                    delete $scope.metaRepData.trainerName;
                    break;
                    case 'componentDiscrepancy':
                    delete $scope.repData.customerName;
                    delete $scope.metaRepData.customerName;
                    delete $scope.repData.deviceSerial;
                    delete $scope.metaRepData.deviceSerial;
                    break;
                    case 'clone':
                    delete $scope.repData.cloneName;
                    delete $scope.metaRepData.cloneName;
                    break;
                    case 'softwareUpdate':
                    delete $scope.repData.userName;
                    delete $scope.metaRepData.userName;
                    delete $scope.repData.customerName;
                    delete $scope.metaRepData.customerName;
                    break;
                    case 'softwareVersions':
                    delete $scope.repData.customerName;
                    delete $scope.metaRepData.customerName;
                    delete $scope.repData.deviceSerial;
                    delete $scope.metaRepData.deviceSerial;
                    delete $scope.repData.softwarePackage;
                    delete $scope.metaRepData.softwarePackage;
                    break;
                    case 'deviceCurrentConfiguration':
                    delete $scope.repData.deviceSerial;
                    delete $scope.metaRepData.deviceSerial;
                    delete $scope.repData.customerName;
                    delete $scope.metaRepData.customerName;
                    delete $scope.repData.hardwareItem;
                    delete $scope.metaRepData.hardwareItem;
                    delete $scope.repData.softwareItem;
                    delete $scope.metaRepData.softwareItem;
                    delete $scope.repData.featureItem;
                    delete $scope.metaRepData.featureItem;
                    break;
                    case 'serviceRecords':
                    delete $scope.repData.deviceSerial;
                    delete $scope.metaRepData.deviceSerial;
                    break;
                    case 'configurationWhereUsed':
                    delete $scope.repData.entityName;
                    delete $scope.metaRepData.entityName;
                    break;
                    case 'deviceHistoricalConfiguration':
                    delete $scope.repData.deviceSerial;
                    delete $scope.metaRepData.deviceSerial;
                    break;
                    case 'deviceCountryChange':
                    delete $scope.repData.userName;
                    delete $scope.metaRepData.userName;
                    break;
                    default:
                    break;
                }
            }
        });
        $scope.viewReport = function () {
            $scope.showReportData = true;
            $scope.showLoader = true;
            $scope.reportParams = {
                pageNo: 1,
                total_count: 0,
                itemsPerPage: MED_API.LIMIT.ROWS
            };
            if($scope.selectedReport === 'namedConfiguration'){
                $scope.reportParams.pageNo = {};
                $scope.reportParams.total_count = {};
                $scope.reportParams.itemsPerPage = 5;
                for (var i = 0; i < 4; i++){
                    $scope.reportParams.pageNo[i] = 1;
                    $scope.reportParams.total_count[i] = 0;
                }
            }
            angular.forEach($scope.repData, function(value, key){
                if(value === ""){
                    delete $scope.repData[key];
                }
            })
            if($scope.repData.from) {
                // $scope.repData.from.setHours($scope.repData.from.getHours()-$scope.repData.from.getTimezoneOffset()/60);
                $scope.repData.dateFrom = convertDate($scope.repData.from);
            };
            if($scope.repData.to) {
                // $scope.repData.to.setHours($scope.repData.to.getHours()-$scope.repData.to.getTimezoneOffset()/60);
                $scope.repData.dateTo = convertDate($scope.repData.to);
            };
            $scope.getRepData(1);
        };

        function convertDate(input){
            function pad(s){ return (s<10)? '0'+s : s; }
            var d = new Date(input);
            return [d.getFullYear(), pad(d.getMonth()+1), pad(d.getDate())].join('-');
        }

        $scope.getSorted = function(key){
            var order = true; 
            if ($scope.sortCol[key]){
                order = !$scope.sortCol[key].order;
            }
            $scope.sKey = key;
            $scope.sortCol = {};
            sortParams = {
                order: (order) ? defaultSort : reverseSort,
                sort_by: key 
            }
            $scope.sortCol[key] = {
                cssClass: (order) ? defaultSort : reverseSort,
                order: order
            };
            $scope.reportDetails.data.sort(function(a,b){
                if(!a.detail[key]) a.detail[key] = "";
                if(!b.detail[key]) b.detail[key] = "";
                if(order)
                    return (a.detail[key].toLowerCase() > b.detail[key].toLowerCase()) ? 1 : ((b.detail[key].toLowerCase() > a.detail[key].toLowerCase()) ? -1 : 0);
                else
                    return (a.detail[key].toLowerCase() < b.detail[key].toLowerCase()) ? 1 : ((b.detail[key].toLowerCase() < a.detail[key].toLowerCase()) ? -1 : 0);
            });
            $scope.turnPage($scope.reportParams.pageNo);
        }

        $scope.namedConfigGetSorted = function(key, i){
            var order = true;
            if($scope.sortCol[i]){ 
                if ($scope.sortCol[i][key]){
                    order = !$scope.sortCol[i][key].order;
                }
            }
            $scope.sKey = key;
            for (var j = 0; j < $scope.reportDetails.columns.length; j++){
                $scope.sortCol[j] = {};    
            }
            sortParams = {
                order: (order) ? defaultSort : reverseSort,
                sort_by: key
            }
            $scope.sortCol[i][key] = {
                cssClass: (order) ? defaultSort : reverseSort,
                order: order
            };
            $scope.reportDetails.data[i].sort(function(a,b){
                if(!a.detail[key]) a.detail[key] = "";
                if(!b.detail[key]) b.detail[key] = "";
                if(order)
                    return (a.detail[key].toLowerCase() > b.detail[key].toLowerCase()) ? 1 : ((b.detail[key].toLowerCase() > a.detail[key].toLowerCase()) ? -1 : 0);
                else
                    return (a.detail[key].toLowerCase() < b.detail[key].toLowerCase()) ? 1 : ((b.detail[key].toLowerCase() < a.detail[key].toLowerCase()) ? -1 : 0);
            });
            $scope.namedConfigTurnPage($scope.reportParams.pageNo[i], i);
        }

        $scope.getRepData = function (pageNo) {
            $scope.viewFlag = false;
            var data = {};
            $scope.showRepLoader = true;
            $scope.dataRepError = '';
            data = RoleDetails.getData($scope.selectedReport + 'Report', $scope.cotId, MED_API.LIMIT.ROWS, 0, $scope.repData);
            data.then(function (response) {
                $scope.showLoader = false;
                $scope.repDataError = ERROR_MSGS.LOAD_ERROR;
                $scope.reportDetails = response.data;
                $scope.viewFlag = true;
                $scope.reportName = ($scope.selectedReport[0].toUpperCase()+$scope.selectedReport.slice(1)).replace(/([A-Z])/g, ' $1').trim();
                if($scope.selectedReport === 'namedConfiguration'){
                    var n = 0;
                    $scope.reportDetails.currentPageData = {};
                    $scope.reportDetails.printPageData = {};
                    $scope.partName = [{name:'System Configurations'}, {name:'Hardware Configurations'}, {name:'Software Configurations'}, {name:'Feature Configurations'}];
                    for(var i = 0; i < Object.keys(response.data.data).length; i++){
                        if (!angular.isObject(response.data.data[i])){
                            $scope.showLoader = false;
                            $scope.dataRepError = ERROR_MSGS.LOAD_ERROR;
                            return;
                        }
                        if(response.data.total_count[i] > 0){
                            $scope.reportParams.total_count[i] = response.data.total_count[i];
                            $scope.reportParams.pageNo[i] = 1;
                            n = n + response.data.total_count[i];
                        }
                        $scope.reportDetails.currentPageData[i] = $scope.reportDetails.data[i].slice(0, $scope.reportParams.itemsPerPage);
                        $scope.reportDetails.printPageData[i] = $scope.reportDetails.data[i];
                        if (n === 0){
                            $scope.showLoader = false;
                            $scope.dataRepError = ERROR_MSGS.LOAD_ERROR;
                            return;
                        }
                    }
                }else{
                    if (!angular.isObject(response.data.data) || !Object.keys(response.data.data).length){
                        $scope.showLoader = false;
                        $scope.dataRepError = ERROR_MSGS.LOAD_ERROR;
                        return;
                    }
                    if (response.data.total_count > 0){
                        $scope.reportParams.total_count = response.data.total_count;
                        $scope.reportParams.pageNo = 1;
                    }else{
                        $scope.showLoader = false;
                        $scope.dataRepError = ERROR_MSGS.LOAD_ERROR;
                    }
                    $scope.reportDetails.currentPageData = $scope.reportDetails.data.slice(0, $scope.reportParams.itemsPerPage);
                    $scope.reportDetails.printPageData = $scope.reportDetails.data;
                }
                $scope.dataRepError = null;
            }, function (error) {
                if(error.status === 401) updatePostError();
                else{
                    $scope.showLoader = false;
                    $scope.reportDetails = {};
                    $scope.reportParams.total_count = 0;
                    $scope.dataRepError = ERROR_MSGS.LOAD_ERROR;
                }
            });
            function updatePostError() {
                $scope.alertType = {
                    show: true,
                    class: 'danger',
                    msg: 'You are no longer allowed to perform this action, and you will be logged out of the system.',
                    auth: true
                };
            }
        };

        $scope.getAutoCompleteData = function (endPoint, dataPoint) {
            if ($scope.repData[dataPoint].length < 3 && $scope.repData[dataPoint] !== '*'){   
                $scope.metaRepData[dataPoint] = null;
                return;
            }
            $scope.showList(dataPoint);
            $scope.wait = true;
            var params = {
                'cot': $scope.cotId,
                'deviceTypeId': $scope.repData.deviceTypeId,
                'cloneEntityTypeId': $scope.repData.cloneEntityTypeId,
                'entityTypeId': $scope.repData.entityTypeId,
                'queryString': $scope.repData[dataPoint].trim()
            }
            RoleDetails.getReportData('search/' + endPoint, params, function (response) {
                if (response.status!==200)
                    return;
                $scope.wait = false;
                $scope.metaRepData[dataPoint] = response.data;
                $scope.showList(dataPoint);
            }, function (error) {
                $scope.wait = false;
                $scope.metaRepData[dataPoint] = null;
                $scope.showList('hide');
            });
        };

        $scope.turnPage = function(pageNo){
            $scope.reportParams.pageNo = pageNo;
            var begin = (($scope.reportParams.pageNo - 1) * $scope.reportParams.itemsPerPage),
            end = begin + $scope.reportParams.itemsPerPage;
            $scope.reportDetails.currentPageData = $scope.reportDetails.data.slice(begin, end);
        }

        $scope.namedConfigTurnPage = function(pageNo, i){
            $scope.reportParams.pageNo[i] = pageNo;
            var begin = (($scope.reportParams.pageNo[i] - 1) * $scope.reportParams.itemsPerPage),
            end = begin + $scope.reportParams.itemsPerPage;
            $scope.reportDetails.currentPageData[i] = $scope.reportDetails.data[i].slice(begin, end);
        }

        $scope.isObject = function(val){
            return (typeof val === 'object');
        }

        $scope.isDate = function(key){
            return key.toLowerCase().indexOf("time") !== -1 || key.toLowerCase().indexOf("date") !== -1;
        }

        $scope.isDecimal = function(key){
            return key.indexOf("%") !== -1;
        }

        $scope.printPreview = function () {
            $scope.showPrint = true;
        }

        $scope.print = function () {
            window.print();
        }

        $scope.back = function () {
            $scope.showPrint = false;
        }

        $scope.$on('MED_COT_CHANGE', function (event, cotId) {
            cot = cotId;
            if($rootScope.globals.uData.role[$scope.cotSelected].access[$scope.roleSelected] && $rootScope.globals.uData.role[$scope.cotSelected].access[$scope.roleSelected].entitlement === 'A'){
                $scope.showReport($scope.selectedReport);
            }
        });
    });
})();
