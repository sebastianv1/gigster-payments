var app = angular.module("payments1", []);

app.controller("PaymentsController", function PaymentsController($scope, $http) {
	this.userTableHeaders = ["First Name", "Last Name", "Billed Amount", "Charged"];
	this.enterUserHeader = "New User Information";
	this.allUsersHeader = "All Users";
	$scope.users = []
	$scope.addUsersButtonText = "Add Users";
	$scope.addUsersEnabled = "true";
	$scope.chargeUsersButtonText = "Charge Users";
	$scope.chargeUsersEnabled = "true";

	var insertUsers = function(users) {
		for (u of users) {
			$scope.users.push(JSON.parse(u));
		}
	}

	var getAndDisplayUsers = function() {
		$scope.users = []
		$http({method: 'GET', url:'/data'})
		.success(function(data, status, headers, config) {
			insertUsers(data);
		})
		.error(function(data, status, headers, config) {
			console.log(data);
		});
	}

	this.addUsers = function(body) {
		$scope.addUsersButtonText = "Adding...";
		$scope.addUsersEnabled = "false";

		$http.post('/addUsers', body)
		.success(function(data) {
			$scope.addUsersButtonText = "Add Users";
			$scope.addUsersEnabled = "true";
			insertUsers(data);
		})
		.error(function(data) {
			$scope.addUsersButtonText = "Add Users";
			$scope.addUsersEnabled = "true";
			alert("Failed to add users");
		});
	};

	this.chargeAllUsers = function(body) {
		$scope.chargeUsersButtonText = "Charging...";
		$scope.chargeUsersEnabled = "false";
		$http.post('/chargeUsers', body)
		.success(function(data) {
			$scope.chargeUsersButtonText = "Charge Users";
			$scope.chargeUsersEnabled = "true";

			if (data == "FAILED") {
				alert("Failed to charge users");
			} else {
				// Maps across all users to update charge status
				$scope.users.map(function(u) {
					if (data.indexOf(u["stripeId"]) >= 0) {
						u["charged"] = true;
					}
					return u;
				});
			}
		})
		.error(function(data) {
			$scope.chargeUsersButtonText = "Charge Users";
			$scope.chargeUsersEnabled = "true";
			alert("Failed to charge users");
		});
	}

	getAndDisplayUsers();
	
});
