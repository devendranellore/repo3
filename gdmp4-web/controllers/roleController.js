(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('RoleController', RoleController);
    RoleController.$inject = ['$scope', '$rootScope', '$sce', '$stateParams', 'MED_API', 'ERROR_MSGS', '$uibModal', 'RoleDetails', 'ctrlName'];
    function RoleController($scope, $rootScope, $sce, $stateParams, MED_API, ERROR_MSGS, $uibModal, RoleDetails, ctrlName) {
        var cot = $stateParams.cot || '',
            sortParams = {},
            firstTime = true,
            defaultSort = "asc", 
            reverseSort = "desc";
        $scope.role = $stateParams.role;
        $scope.users = [];
        $scope.sortCol = {};
        $scope.sKey = '';
        $scope.visibility = {};
        $scope.filter = {};
        $scope.mFilters = false;
        //for pagination
        $scope.url = MED_API.BASE_URL;
        $scope.roleTableParams = {
            pageNo: 1, 
            totalCount: 0, 
            itemsPerPage: MED_API.LIMIT.ROWS
        };
        $scope.sort = '';
        $scope.roleTableParams.primaryFilter = {};
        $scope.selectedFilters = {};
        $scope.search = {};
        $scope.roleTableParams.filters = {};
        $scope.searchFilters = {};
        //Create modal instance based on role
        var getModalInstance = function () {
            var ctrlName = $scope.roleSelected + 'Controller';
            if (!isController(ctrlName)){
                return false;
            }
            return $uibModal.open({
                animation: true,
                templateUrl: 'partials/edit.html',
                controller: ctrlName,
                size: 'lg',
                scope: $scope,
                backdrop: 'static'
            });
        };
        $scope.stopPropagation = function($event){
            $event.stopPropagation();
        }

        $scope.isCreate = function () {
            var tmpRole = $scope.role;
            if (tmpRole && tmpRole.toLowerCase() !== 'devices'){
                return true;    
            }
            return false;
        }
        function isController(cntrl) {
            return ctrlName.exists(cntrl);
        }
        $scope.showList = function (dropList) {
            var tmpVisibility = ($scope.visibility[dropList]) ? !$scope.visibility[dropList] : true;
            $scope.visibility = {};
            $scope.visibility[dropList] = ($scope.readOnlyFlag) ? false : tmpVisibility;
        };

        $scope.trustSrc = function(href){
            return $sce.trustAsResourceUrl(href);
        };

        $scope.viewPDF = function(href){
            $scope.href = href;
            $uibModal.open({
                animation: true,
                templateUrl: 'partials/pdfView.html',
                controller: function($uibModalInstance){
                    $scope.cancel = function(){
                        $uibModalInstance.dismiss();
                    }
                },
                size: 'lg',
                scope: $scope,
                backdrop: 'true'
            });
        }

        $scope.$watch('moreFilters.country', function(val){
            if($scope.country){
                if(val){
                    $scope.countryList = [];
                    $scope.country.forEach(function(country){
                        if(country.name.toLowerCase().slice(0, val.length) === val.toLowerCase()) {
                            $scope.countryList.push(country);
                        }
                    })
                }else{
                    $scope.countryList = $scope.country.slice();
                }   
            }
            if($scope.moreFilters){
                if($scope.moreFilters.country){
                    angular.forEach($scope.country, function(value, key){
                        if(value.name.toLowerCase() === $scope.moreFilters.country.toLowerCase()){
                            $scope.moreFilters.country = value.name;
                        }
                    })
                }
            }
        });

        //To fetch the data from server
        $scope.getData = function (pageNo) {
            if (!$scope.role || $scope.role === 'reports') return;
            if (!$scope.includeFilters || firstTime) $scope.includeFilters = [];
            var iCount = $scope.roleTableParams.itemsPerPage,
                offset, 
                searchParams = {},
                data = {};
            $scope.roleTableParams.total_count = 0;
            $scope.showLoader = true;
            $scope.dataError = '';
            offset = (pageNo > 1) ? (iCount * pageNo - iCount) : 0; //offset Calculation
            //Merging search filters & Sort params
            if($scope.includeFilters.length !== 0){
                searchParams = (Object.keys($scope.searchFilters).length) ? angular.merge(getSearchParams($scope.searchFilters, $scope.includeFilters), sortParams) : sortParams;
            } else if(sortParams) {
                searchParams = sortParams;
            } else {
                searchParams.include_filter = true;
            }
            if ($scope.search.name) searchParams.name = $scope.search.name;
            else delete searchParams.name;
            data = RoleDetails.getData($scope.role, cot, MED_API.LIMIT.ROWS, offset, searchParams, $scope.includeFilters);
            data.then(function (response) {
                $scope.showLoader = false;
                $scope.roleDetails = {};
                $scope.roleTableParams.total_count = 0;
                $scope.dataError = ERROR_MSGS.LOAD_ERROR;
                $scope.showMoreFilters = true;
                $scope.roleDetails = response.data;
                for(var i in $scope.roleDetails.filters){
                    if($scope.roleDetails.filters[i].display_name === 'Country') {
                        $scope.country = $scope.roleDetails.filters[i].entries;
                        $scope.countryList = $scope.country;
                    }
                }
                if ($scope.role === 'devices' && Object.keys(searchParams).length === 0 && response.data.total_count === 0)
                    $scope.dataError = $scope.dataError + ' If you are associated to multiple customers, please select one customer from customer filter to show devices.'
                if ((response.data.filters) && response.data.filters.length > 0){
                    $scope.showMoreFilters = (response.data.filters.length === 1) ? false : true;
                    $scope.roleTableParams.primaryFilter = response.data.filters.splice(0, 1)[0];
                    $scope.roleTableParams.filters = response.data.filters;
                    if(firstTime){
                        $scope.moreFilters = {};
                        $scope.searchFilters[$scope.roleTableParams.primaryFilter.name] = {};
                        $scope.roleTableParams.primaryFilter.entries.forEach(function(filter){
                            $scope.searchFilters[$scope.roleTableParams.primaryFilter.name][filter.value] = filter.selected;
                        })
                        $scope.roleTableParams.filters.forEach(function(group){
                            $scope.searchFilters[group.name] = {};
                            group.entries.forEach(function(filter){
                                $scope.searchFilters[group.name][filter.value] = filter.selected;
                            })
                        })
                        firstTime = false;
                    }
                }
                if (!angular.isObject(response.data.data) || !Object.keys(response.data.data).length)
                    return;
                if (response.data.total_count){
                    $scope.roleTableParams.total_count = response.data.total_count;
                    $scope.roleTableParams.pageNo = (offset > $scope.roleTableParams.total_count) ? 1 : pageNo;
                }
                if(!($scope.role=='facility' || $scope.role=='customer' || $scope.role=='role' || $scope.role=='mdtapprovemgr' || $scope.role=='clientsoftware')){
                    if (!$scope.roleTableParams.primaryFilter.entries || !$scope.roleTableParams.primaryFilter.entries.length){
                        $scope.dataError = ERROR_MSGS.SERVER_ERROR;
                        return;
                    }
                }
                $scope.dataError = null;
            }, function (error) {
                $scope.showLoader = false;
                $scope.roleDetails = {};
                $scope.roleTableParams.total_count = 0;
                $scope.dataError = ERROR_MSGS.LOAD_ERROR;
            });
        };
        
        $scope.searchRoles = function (entry) {
            if(entry && $scope.includeFilters.indexOf(entry)===-1) $scope.includeFilters.push(entry);
            if(entry !== 'status' && entry !== 'country' && entry !== 'customer_name' && entry !== 'customer_account' && entry !=='warning_status'){
                var allSelected = true;
                for(var i in $scope.searchFilters[entry]){
                    if($scope.searchFilters[entry][i] === false) allSelected = false;
                }
                if(allSelected === true){
                    var index = $scope.includeFilters.indexOf(entry);
                    if(index !== -1){
                        $scope.includeFilters.splice(index, 1);
                    }
                }
            } else {
                if(Object.keys($scope.searchFilters[entry]).length == 0){
                    var index = $scope.includeFilters.indexOf(entry);
                    if(index !== -1){
                        $scope.includeFilters.splice(index, 1);
                    }
                }
            }
            $scope.enableFilterError = true;
            $scope.getData(1); //Fetching the first page
        };

        $scope.clearFilter = function(name){
            $scope.moreFilters[name] = null;
            $scope.searchFilters[name] = {};
            $scope.filter[name] = null;
            $scope.searchRoles(name);
            $scope.showList('hide');
        }

        $scope.addFilter = function(name, item){
            if(name === 'customer_name' || name === 'customer_account') $scope.filter[name] = item.value;
            $scope.searchFilters[name] = {};
            if(name === 'country'){                
                $scope.searchFilters[name][item.value] = true;
            }else{
                if(!$scope.searchFilters[name][item.value]) $scope.searchFilters[name][item.value] = true;
                else $scope.searchFilters[name][item.value] = false;
            }
            if(!$scope.moreFilters) $scope.moreFilters = {};
            else $scope.moreFilters[name] = item.name;
            $scope.searchRoles(name);
            $scope.showList('hide');
        }

        $scope.getAutoCompleteData = function (endPoint, dataPoint) {
            if ($scope.filter[dataPoint].length < 3 && $scope.filter[dataPoint] !== '*'){   
                if($scope.metaData) $scope.metaData[dataPoint] = null;
                return;
            }
            $scope.showList(dataPoint);
            var params = {
                'cot': $scope.cotId,
                'queryString': $scope.filter[dataPoint]
            }
            RoleDetails.getReportData('search/' + endPoint, params, function (response) {
                if (!angular.isObject(response.data) || !Object.keys(response.data).length)
                    return;
                if(!$scope.metaData) $scope.metaData = {};
                $scope.metaData[dataPoint] = response.data;
                $scope.showList(dataPoint);
            }, function (error) {
                $scope.metaData[dataPoint] = null;
                $scope.showList('hide');
            });
        };

        //Sorting
        $scope.getSorted = function (key) {
            var order = true; //Default Sort order
            if ($scope.sortCol[key]){
                order = !$scope.sortCol[key].order;
            }
            $scope.sKey = key;
            $scope.sortCol = {};
            sortParams = {
                order: (order) ? defaultSort : reverseSort, 
                sort_by: key //Keys should match the API param
            }
            $scope.sortCol[key] = {
                cssClass: (order) ? defaultSort : reverseSort, 
                order: order
            };
            $scope.getData($scope.roleTableParams.pageNo);
        };

        //Popup for Editing
        $scope.open = function (recordIndex, roleData) {
            var tmpRoleData = {}, 
                modalInstance;
            delete $scope.status;
            if (recordIndex === 'NEW') {
                //TODO Remove after implementation of other types
                var tmpDone = ['configuration', 'document', 'feature', 'user', 'software', 'hardware', 'customer', 'facility'];
                if (tmpDone.indexOf($scope.role) < 0)
                    return;
                //TODO Remove after implementation of other types
                $scope.roleData = {"root": true};
                $scope.roleData.tooltip = {};
                $scope.createRecord = true;
                $scope.cloneRecord = false;
            }
            else if (recordIndex === 'CLONE'){
                $scope.createRecord = true;
                $scope.cloneRecord = true;
                $scope.roleData = roleData;
                $scope.roleData.cloneFrom = roleData.id;
            }
            else {
                $scope.createRecord = false;
                tmpRoleData = $scope.roleDetails.data[recordIndex];
                //merging all the columns to a single object
                $scope.roleData = angular.merge({}, tmpRoleData.basic, tmpRoleData.detail, tmpRoleData.additional);
                if($scope.roleData.status){
                    $scope.status = $scope.roleData.status;
                }
                if($scope.roleData.formerlyInProduction && ($scope.roleData.status === 'Limited Release')){
                    $scope.status = 'In Production';
                }
                $scope.roleData.tooltip = ($scope.roleDetails.data[recordIndex]['tooltip']) ? $scope.roleDetails.data[recordIndex]['tooltip'] : {};
            }
            modalInstance = getModalInstance();
        };

        //Initial fetch to display the landing page
        $scope.getData($scope.roleTableParams.pageNo);

        $scope.$on('MED_COT_CHANGE', function (event, cotId) {
            cot = cotId;
            firstTime = true;
            $scope.getData(1);
            $scope.searchFilters = {};
        });
    }
    //Private Functions
    //To generate the search param from filters
    var getSearchParams = function (filterObj, selectedName) {
        var sParams = {};
        angular.forEach(filterObj, function (selections, paramName) {
            if(selectedName.indexOf(paramName) > -1 || paramName === 'status'){
                angular.forEach(selections, function (value, entry) {
                    if (value){
                        (sParams[paramName]) ? sParams[paramName].push(entry) : sParams[paramName] = [entry];
                    }
                })
            }
        });
        return (sParams);
    }
    var cleanInputValue;
    app.directive('noSpecialChar', function() {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function(inputValue) {
                    if (inputValue == null)
                        return ''
                    cleanInputValue = inputValue.replace(/[^\w\s.]/gi, '');
                    if (cleanInputValue != inputValue) {
                        modelCtrl.$setViewValue(cleanInputValue);
                        modelCtrl.$render();
                    }
                    return cleanInputValue;
                });
            }
        }
    });
})();