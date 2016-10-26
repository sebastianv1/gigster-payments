var express = require('express');
var app = express();

var env = process.env.NODE_ENV || 'dev';

var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var db_url = process.env.MONGODB_URI;

var schema = require('./schema');

var async = require('async');

var stripe = require('stripe')(process.env.STRIPE_TEST_KEY);

if (env == 'dev') {
	var db_url = 'mongodb://localhost:27017/payments';

	var fs = require('fs');
	var secretsFile = fs.readFileSync("secrets.json");
	var secrets = JSON.parse(secretsFile);
	var stripe = require('stripe')(secrets.stripe_test_key);
}


app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(db_url, function(err) {
	if (err) throw err;
	console.log("MongoDB Connection established");
});


app.get('/', function(req, res) {
	res.sendFile('./index.html');
});

app.post('/addUsers', function(req, res) {
	var users = req.body.users.split("\n");
	var added_users = [];

	async.eachSeries(users, function(user, callback) {
		components = user.split(" ");
		
		user_data = { firstName: components[0], lastName: components[1], 
					email: components[2], amount: components[4], charged: false};
		// Mock data for exp_month and exp_year
		card_data = { object: "card", exp_month: "1", exp_year: "2018", number: components[3]};

		async.waterfall([
			function(callback) {
				stripe.customers.create({metadata: user_data, source: card_data}, function(err, customer) {
					user_data["stripeId"] = customer.id;
					callback(err, customer);
				});
			},
			function(customer, callback) {
				var newUser = new schema.User(user_data);
				newUser.save(function(err) {
					callback(err, JSON.stringify(user_data));
				});
			}
		], function(err, user_data) {
			if (!err) {
				added_users.push(user_data);
			}
			callback();
		});
	}, function(err) {
		res.setHeader('Content-Type', 'application/json');
		res.send(added_users);
	});
});

app.post('/chargeUsers', function(req, res) {

	var userStream = schema.User.find().stream();
	var updated_users = [];

	schema.User.find({}, function(err, users) {
		async.eachSeries(users, function(user, callback) {
			stripe.charges.create({
				amount: user["amount"] * 100,
				currency: "usd",
				customer: user["stripeId"]
			}, function(err, charge) {
				if (!err) {
					updated_users.push(user["stripeId"]);
					user["charged"] = true;
					user.save();
				} else {
					console.log("Stripe charge failed for user:" + user + "\nError:" + err);
				}
				callback();
			});
		}, function(err) {
			res.send(updated_users);
		});
	});
});

app.get('/data', function(req, res) {
	schema.User.find({}, function(err, users) {
		var added_users = [];
		for (u of users) {
			added_users.push(JSON.stringify(u));
		}
		res.send(added_users);
	});
});


var PORT_NUM = 3000;
app.listen(PORT_NUM);
console.log("Listening on port " + PORT_NUM);

