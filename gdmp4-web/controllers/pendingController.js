(function(){
	'use strict';
	var app = angular.module('MedApp')
	app.controller('pendingController', pendingController);
	pendingController.$inject = ['$scope', '$rootScope','$stateParams', '$state', '$window','RoleDetails','ERROR_MSGS'];
	function pendingController($scope, $rootScope, $stateParams, $state, $window, RoleDetails, ERROR_MSGS){
		var _this = this;
		this.RoleDetails = RoleDetails;
		var tokenStr = encodeURIComponent($stateParams.tokenStr);
		var token = encodeURIComponent($stateParams.token);
		$scope.visibility = {};
		$scope.showLoader = true;
		$scope.search = {};
		$scope.opened = [];
		$scope.expired = false;
 		$scope.dateOptions = {
			formatYear: 'yy',
			maxDate: new Date(),
			minDate: new Date(1800, 1, 1),
			startingDay: 1
		};
		if (typeof Object.assign != 'function') {
			(function () {
				Object.assign = function (target) {
					'use strict';
					if (target === undefined || target === null) {
						throw new TypeError('Cannot convert undefined or null to object');
					}
					var output = Object(target);
					for (var index = 1; index < arguments.length; index++) {
						var source = arguments[index];
						if (source !== undefined && source !== null) {
							for (var nextKey in source) {
								if (source.hasOwnProperty(nextKey)) {
									output[nextKey] = source[nextKey];
								}
							}
						}
					}
					return output;
				};
			})();
		}
		$scope.open = function($event, index){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.opened[index] = true;
		}

		function readOnly(flag) {
			if (flag === undefined) flag = true;
			$scope.readOnlyFlag = flag;
		}

		$scope.showList = function (dropList) {
			var tmpVisibility = ($scope.visibility[dropList]) ? !$scope.visibility[dropList] : true;
			$scope.visibility = {};
			$scope.visibility[dropList] = ($scope.readOnlyFlag) ? false : tmpVisibility;
		};

		$scope.cancel = function () {
			loadRequestDetails(tokenStr, token);
			readOnly();
		};

		$scope.readOnly = function (flag) {
			readOnly(flag);
		};

		$scope.$watch('data', function(){
			if($scope.data){
				if($scope.data.isMedtronicEmployee === true) $scope.formValid = true;
				else if(!$scope.data.customers){
					$scope.formValid = false;
				} else if ($scope.data.customers.length === 0) {
					$scope.formValid = false;
				} else {
					$scope.formValid = true
				}
			}
		}, true);


		function loadRequestDetails(tokenStr, token){
			if(tokenStr != null){
				_this.RoleDetails.loadRequestDetails(tokenStr, token).success(function(response){
					if (!angular.isObject(response) || !Object.keys(response).length) {
						$scope.modalError = ERROR_MSGS.LOAD_ERROR;
						return;
					}
					if(response != null){
						$scope.data = response;
						if($scope.data.decision_time != null){
							var dateString = new Date($scope.data.decision_time).toUTCString();
							$scope.data.decisionTime = dateString.split(' ').slice(0, 4).join(' ');
						}
						$scope.data.trainingMaterial = {};
						angular.forEach($scope.data.additional.roles, function(roleName, cotName) {
							$scope.data.trainingMaterial[cotName] = !!roleName;
						});
					}
					$scope.showLoader = false;
					$scope.modalError = null;
				})
				.error(function (error) {
					if (error.code === 406){
						updatePostError({data: {msg: 'The link has expired.'}});
						$scope.expired = true;
					}else{
						var c = confirm("There is some error while retreving details of this request. Do you want to try once again to retreive the details.");
						if(c){
							loadRequestDetails(tokenStr, token);	
						}
						else if(!c){
							$state.go('login');
						}
					}
				});
			}
		};

		$scope.toggleTrainingRecord = function (deviceType) {
			if (!$scope.data.additional.trainingRecords) {
				$scope.data.additional.trainingRecords = {};
			}
			var record = $scope.data.additional.trainingRecords[deviceType.name];

			if (record) {
				delete $scope.data.additional.trainingRecords[deviceType.name];
			}
			else {
				$scope.data.additional.trainingRecords[deviceType.name] = {
					deviceTypeId: deviceType.id
				};

				if (deviceType.trainerSet) {
					deviceType.trainerSet.forEach(function (trainer) {
						if (trainer.isDefault) {
							$scope.setTrainer(deviceType, trainer);
						}
					});
				}
			}
		}

		$scope.setTrainer = function (deviceType, trainer) {
			if (!$scope.data.additional.trainingRecords || !$scope.data.additional.trainingRecords[deviceType.name]) {
				return;
			}
			$scope.data.additional.trainingRecords[deviceType.name].trainerUuid = trainer.uuid;
			$scope.data.additional.trainingRecords[deviceType.name].trainerName = trainer.mail;
		}

		if ($scope.data) {
			angular.forEach($scope.data.additional.trainingRecords, function(trainingRecord) {
				trainingRecord.trainingDate = new Date(trainingRecord.trainingDate);
			});
		}

		function validate() {
			if (!Object.keys($scope.data.additional.trainingRecords).length) {
				updatePostError({data: {msg: 'You must select at least one or more device before register.'}});
				return false;
			}

			var deviceTypeNames = Object.keys($scope.data.additional.trainingRecords);
			var trainingRecordsValid = deviceTypeNames.reduce(function(lastValid, deviceTypeName) {
				if(!lastValid) return false;

				var record = $scope.data.additional.trainingRecords[deviceTypeName];
				var cotName = findCotName(deviceTypeName);
				var materialTraining = $scope.data.roles[cotName].materialTraining;

				if (materialTraining && !$scope.data.trainingMaterial[cotName]) {
					updatePostError({data: {msg: 'Please acknowledge training for selected devices.'}});
					return false;
				}

				if(!$scope.data.roles[cotName] || (!materialTraining && !(record.trainerUuid && record.trainerName && record.trainingDate))) {
					updatePostError({data: {msg: 'One or more required training records are not specified.'}});
					return false;
				}

				return true;
			}, true);

			if(!trainingRecordsValid) return false;

			var registeredCots = Object.keys($scope.data.additional.roles);
			var rolesValid = registeredCots.reduce(function(lastValid, cotName) {
				if(!lastValid) return false;
				var deviceTypes = $scope.data.roles[cotName].deviceTypes;
				var oneOrMoreDeviceSelected = deviceTypes.reduce(function(lastSelected, deviceType) {
					if(lastSelected) return true;
					return !!$scope.data.additional.trainingRecords[deviceType.name];
				}, false);

				if(!oneOrMoreDeviceSelected) {
					updatePostError({data: {msg: 'You must select at least one or more device before register.'}});
					return false;
				}

				return true;
			}, true);
			if(!rolesValid) return false;

			return true;
		}

		function updatePostError(response) {
			$scope.saveSuccess = false;
			$scope.alertType = {
				show: true,
				class: 'danger',
				msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR
			};
		}

		$scope.closeUpdateLoader = function () {
			if ($scope.expired){
				$state.go('login');
				return;
			}
			if ($scope.saveSuccess){
				$scope.alertType = {show: false};
				$scope.cancel();
				return;
			}
			$scope.alertType = {show: false};
			$scope.showLoader = false;
		};

		$scope.decide = function (action) {
			$scope.roleData = Object.assign({}, $scope.data.detail, $scope.data.basic, $scope.data.additional);
			$scope.roleData.id = tokenStr;
			$scope.showLoader = true;
			RoleDetails.approveOrDeny(tokenStr, token, action, function (response) {
				if (response.status >= 200 && response.status < 300) {
					$scope.alertType = {
						show: true,
						class: 'success',
						msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
					};
					$scope.saveSuccess = true;
				} else if (response.status === 406){
					updatePostError({data: {msg: 'The link has expired.'}});
					$scope.expired = true;
				} else {
					updatePostError(response);
				}
			}, function (response) {
				updatePostError(response);
			});
		};

		$scope.save = function () {
			$scope.roleData = Object.assign({}, $scope.data.detail, $scope.data.basic, $scope.data.additional);
			$scope.roleData.id = tokenStr;
			$scope.roleData.token = token;
			$scope.showLoader = true;
			if(!validate()) return;
			RoleDetails.putPendingData('pending_registration', $scope.roleData, function (response) {
				if (response.status >= 200 && response.status < 300) {
					$scope.alertType = {
						show: true,
						class: 'success',
						msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
					};
					$scope.saveSuccess = true;
				} else if (response.status === 406){
					updatePostError({data: {msg: 'The link has expired.'}});
					$scope.expired = true;
				} else {
					updatePostError(response);
				}
			}, function (response) {
				updatePostError(response);
			});
		};

		function findCotName(deviceTypeName) {
			var cotNameFound;
			angular.forEach($scope.data.roles, function(cotData, cotName) {
				cotData.deviceTypes.forEach(function(deviceType) {
					if(deviceType.name == deviceTypeName) {
						cotNameFound = cotName;
					}
				})
			});
			return cotNameFound;
		}

		$scope.deleteCustomer = function(cust) {
			var newCollection = [];
			if ($scope.data.additional.customers) {
				$scope.data.additional.customers.forEach(function (customer) {
					if (customer != cust) {
						newCollection.push(customer);
					}
				});
			}
			$scope.data.additional.customers = newCollection;
		};

		$scope.deleteRole = function (cotName) {
			if (!$scope.data.additional.roles) {
				$scope.data.additional.roles = {};
			}
			delete $scope.data.additional.roles[cotName];
			if ($scope.data.roles[cotName].deviceTypes) {
				$scope.data.roles[cotName].deviceTypes.forEach(function(deviceType) {
					delete $scope.data.additional.trainingRecords[deviceType.name];
				});
			}
		};

		$scope.loginPage = function(){
			$state.go('login');
		};

		if($stateParams != null && (tokenStr != null)){
			loadRequestDetails(tokenStr, token);
		};

		readOnly();
	};

})();