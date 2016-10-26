var app = angular.module("payments1", []);

app.controller("PaymentsController", function PaymentsController($scope, $http) {
	this.userTableHeaders = ["First Name", "Last Name", "Billed Amount", "Charged"];
	this.enterUserHeader = "New User Information";
	this.allUsersHeader = "All Users";
	this.users_list = []
	this.addUsersButtonText = "Add Users";
	this.addUsersEnabled = "true";
	this.chargeUsersButtonText = "Charge Users";
	this.chargeUsersEnabled = "true";

	// Set the scope
	var self = this;

	var startLoadingAddUsers = function() {
		self.addUsersButtonText = "Adding...";
		self.addUsersEnabled = "false";
	}

	var stopLoadingAddUsers = function() {
		self.addUsersButtonText = "Add Users";
		self.addUsersEnabled = "true";
	}

	var startLoadingChargeUsers = function() {
		self.chargeUsersButtonText = "Charging...";
		self.chargeUsersEnabled = "false";
	}

	var stopLoadingChargeUsers = function() {
		self.chargeUsersButtonText = "Charge Users";
		self.chargeUsersEnabled = "true";
	}

	var insertUsers = function(users) {
		for (u of users) {
			self.users_list.push(JSON.parse(u));
		}
	}

	var getAndDisplayUsers = function() {
		self.users_list = []
		$http({method: 'GET', url:'/data'})
		.success(function(data, status, headers, config) {
			insertUsers(data);
		})
		.error(function(data, status, headers, config) {
			console.log(data);
		});
	}

	this.addUsers = function(body) {
		startLoadingAddUsers();
		$http.post('/addUsers', body)
		.success(function(data) {
			stopLoadingAddUsers();
			insertUsers(data);
			self.users = null;
		})
		.error(function(data) {
			stopLoadingAddUsers();
			alert("Failed to add users");
		});
	};

	this.chargeAllUsers = function(body) {
		startLoadingChargeUsers();
		$http.post('/chargeUsers', body)
		.success(function(data) {
			stopLoadingChargeUsers();
			if (data == "FAILED") {
				alert("Failed to charge users");
			} else {
				// Maps across all users to update charge status
				self.users_list.map(function(u) {
					if (data.indexOf(u["stripeId"]) >= 0) {
						u["charged"] = true;
					}
					return u;
				});
			}
		})
		.error(function(data) {
			stopLoadingChargeUsers();
			alert("Failed to charge users");
		});
	}

	getAndDisplayUsers();
	
});
