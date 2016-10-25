var app = angular.module("payments1", []);

app.controller("PaymentsController", function PaymentsController($scope, $http) {
	this.userTableHeaders = ["First Name", "Last Name", "Billed Amount", "Charged"];
	$scope.users = []

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
		$http.post('/addUsers', body)
		.success(function(data) {
			insertUsers(data);
		});
	};

	this.chargeAllUsers = function(body) {
		$http.post('/chargeUsers', body)
		.success(function(data) {
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
		});
	}

	getAndDisplayUsers();
	
});
