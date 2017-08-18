(function () {
    'use strict';
    angular.module('ModAPI', ['ngResource', 'angularUtils.directives.dirPagination', 'ngFileUpload'])
           .factory('RoleDetails', RoleDetails);

    function RoleDetails($http, MED_API, $timeout, Upload) {
        var apiEndPoint = MED_API.BASE_URL,
            roleBaseURL,
            roleService = {};
        roleService.getMetaData = function (cot, role) {
            var config = {
                params: {
                    cot: cot,
                    id: id
                }
            };
            roleBaseURL = apiEndPoint + 'meta/' + role;
            return $http.get(roleBaseURL, config);
        }
        roleService.getData = function (role, cot, limit, offset, aParams, includeFilters) {
            if (limit === undefined) limit = 4;
            if (offset === undefined) offset = 0;
            if (aParams === undefined) aParams = {};
            var config,
                params = {
                    cot: cot,
                    limit: limit,
                    offset: offset,
                    role: role
                };
            //To display the filters
            if(includeFilters){
                if(includeFilters.length === 0) params.include_filter = true;
            }
            config = {
                params: angular.merge(params, aParams)
            }
            roleBaseURL = apiEndPoint + role;
            if (config.params.from && config.params.dateFrom) delete config.params.from;
            if (config.params.to && config.params.dateTo) delete config.params.to;
            return $http.get(roleBaseURL, config);
        }
        roleService.getSearchData = function (role, cot, offset, aParams) {
            if (offset === undefined) offset = 0;
            if (aParams === undefined) aParams = {};
            var config,
                params = {
                    cot: cot,
                    offset: offset,
                    role: role
                };
            //To display the filters
            if(Object.getOwnPropertyNames(aParams).length === 0){
                params.include_filter = true;
            }
            config = {
                params: angular.merge(params, aParams)
            }
            roleBaseURL = apiEndPoint + role;
            return $http.get(roleBaseURL, config);
        }
        roleService.metaData = function (cot, role, id, sub_type) {
            var config = {
                params: {
                    cot: cot,
                    id: id,
                    sub_type: sub_type
                }
            }
            roleBaseURL = apiEndPoint + 'meta/' + role;
            return $http.get(roleBaseURL, config);
        }

        var sizeUploaded;
        var tmpUid;
        var progressPercentage;
        roleService.uploadDoc = function (params, success, error) {
            if (!params.file)
                return;
            if (tmpUid !== params.uid) {
                tmpUid = params.uid;
                sizeUploaded = 0;
            }
            var file = params.file;

            roleBaseURL = apiEndPoint + 'chunkupload?uid=' + params.uid;
            Upload.upload({
                url: roleBaseURL,
                data: {
                    file: file
                },
                resumeSize: function() {return new Promise(function(resolve, reject){
                    if(params.file === file)
                        resolve(sizeUploaded || 0);
                    else
                        resolve(0);
                });},
                resumeChunkSize: '4MB'
            }).then(function (resp) {
                sizeUploaded = 0;
                $timeout(function(){
                    success(resp);
                });
            }, function (resp) {
                if(progressPercentage === 100)
                    sizeUploaded = 0;
                error(resp);
            }, function (evt) {
                sizeUploaded = evt.loaded;
                progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            });
        };

        roleService.deleteDoc = function (params, success, error) {
            var config = {
                data: params
            };
            roleBaseURL = apiEndPoint + 'file' + '/' + params.name
            $http.delete(roleBaseURL, config).then(function (response){
                success(response);
            }, function (response) {
                error(response);
            });
        }

        roleService.putData = function (type, params, success, error) {
            var config = {
                data: params
            };
            roleBaseURL = apiEndPoint + type + '/' + params.id
            $http.put(roleBaseURL, config).then(function (response){
                success(response);
            }, function (response) {
                error(response);
            });
        };

        roleService.putApprovingProxyData = function (type, id, params, success, error) {
            var config = {
                data: params
            };
            roleBaseURL = apiEndPoint + type + '/' + id
            $http.put(roleBaseURL, config).then(function (response){
                success(response);
            }, function (response) {
                error(response);
            });
        };

        roleService.putPendingData = function (type, params, success, error) {
            var config = {
                data: params
            };
            roleBaseURL = apiEndPoint + type + '/' + params.id + '?token=' + params.token
            $http.put(roleBaseURL, config).then(function (response){
                success(response);
            }, function (response) {
                error(response);
            });
        };
        roleService.putDefaultTrainerData = function (endPoint, cot, params, success, error) {
            var config = {
                data: params
            };
            roleBaseURL = apiEndPoint + endPoint + '?cot=' + cot;
            $http.put(roleBaseURL, config).then(function (response){
                success(response);
            }, function (response) {
                error(response);
            });
        };
        roleService.putRoleData = function (endPoint, params, success, error) {
            var config = {
                data: params
            };
            roleBaseURL = apiEndPoint + endPoint
            $http.put(roleBaseURL, config).then(function (response){
                success(response);
            }, function (response) {
                error(response);
            });
        };
        roleService.putExtensionData = function (endPoint, cot, params, success, error) {
            var config = {
                data: params
            };
            roleBaseURL = apiEndPoint + endPoint + '?cot=' + cot;
            $http.put(roleBaseURL, config).then(function (response){
                success(response);
            }, function (response) {
                error(response);
            });
        };
        roleService.putEmbargoRoleData = function (endPoint, cot, params, success, error) {
            var config = {
                data: params
            };
            roleBaseURL = apiEndPoint + endPoint + '?cot=' + cot;
            $http.put(roleBaseURL, config).then(function (response){
                success(response);
            }, function (response) {
                error(response);
            });
        };
        roleService.postPackageData = function (endPoint, params, cot, success, error) {
            var config = {
                data: params
            };
            roleBaseURL = apiEndPoint + endPoint + '?cot=' + cot
            $http.post(roleBaseURL, config).then(function (response){
                success(response);
            }, function (response) {
                error(response);
            });
        };
        roleService.postData = function (type, params, success, error) {
            var config = {
                params: {data: params},
                success: success,
                error: error,
                method: 'POST',
                url: apiEndPoint + type
            }
            sendData(config);
        };
        roleService.getTypeData = function (type, id, success, error) {
            var config = {
                success: success,
                error: error,
                method: 'GET',
                url: apiEndPoint + type + '/' + id
            }
            sendData(config);
        };
        roleService.getReportData = function (reportEndPoint, params, success, error) {
            var config = {
                params: params
            };
            $http.get(apiEndPoint + reportEndPoint, config).then(function (response){
                success(response);
            }, function (response) {
                error(response);
            });
        };
        function sendData(reqData) {
            var config = {
                url: reqData.url,
                data: reqData.params,
                method: reqData.method
            };
            $http(config).then(function (response){
                reqData.success(response);
            }, function (response) {
                reqData.error(response);
            });
        }
        roleService.getRoleData = function (endPoint, cot, role, id) {
            var config = {
                params: {
                    cot: cot,
                    role: role,
                    id: id
                }
            };
            roleBaseURL = apiEndPoint + endPoint;
            return $http.get(roleBaseURL, config);
        };
        roleService.getTabPageData = function (endPoint, role, cot, limit, offset, aParams, firstTime) {
            if (limit === undefined)
                limit = 4;
            if (offset === undefined)
                offset = 0;
            if (aParams === undefined)
                aParams = {};
            var config,
                    params = {
                        cot: cot,
                        limit: limit,
                        offset: offset,
                        role: role
                    };
            //To display the filters
            if(firstTime){
                params.include_filter = true;
            }
            config = {
                params: angular.merge(params, aParams)
            }
            roleBaseURL = apiEndPoint + endPoint;
            return $http.get(roleBaseURL, config);
        };
        roleService.getTabData = function (endPoint, cot, role, id) {
            var config = {
                params: {
                    cot: cot,
                    role: role,
                    id: id
                }
            };
            roleBaseURL = apiEndPoint + endPoint;
            return $http.get(roleBaseURL, config);
        };
        roleService.customAction = function (type, role, action, success, error) {
            var config = {
                success: success,
                error: error,
                method: 'PUT',
                url: apiEndPoint + type + '/' + action + '?id=' + role.id + '&cot=' + role.cotId
            }
            if(type =='mdtapprovemgr'){
                config.method = 'DELETE';
                config.url = apiEndPoint + type + '/' + role.cotId + '/' + role.id;
            }
            if(type =='customer'){
                config.method = 'DELETE';
                config.url = apiEndPoint + type + 's/' + role.id;
            }
            if(type =='clientsoftware'){
                config.method = 'DELETE';
                config.url = apiEndPoint + type + '/' + role.id;
            }
            sendData(config);
        };

        roleService.deleteItem = function(endPoint, role, cot, success, error){
            var config = {
                success: success,
                error: error,
                method: 'DELETE',
                url: apiEndPoint + endPoint + '/' + role.id + '?cot=' + cot
            }
            sendData(config);
        };

        roleService.loadRequestDetails = function(tokenStr, token){
            var url = apiEndPoint + 'pending_registration/' + tokenStr + '?token=' + token;
            return $http.get(url);
        };

        roleService.agentDownloadData = function(){
            var url = apiEndPoint + 'clientapps';
            return $http.get(url);
        }

        roleService.approveOrDeny = function(tokenStr, token, decision, success, error){
            var config = {
                success: success,
                error: error,
                data : {"decision": decision}
            }
            roleBaseURL = apiEndPoint + 'pending_registration/' + tokenStr + '?token=' + token;
            $http.post(roleBaseURL, config).then(function (response){
                success(response);
            }, function (response) {
                error(response);
            });
        };
        return roleService;
    }
}
)()