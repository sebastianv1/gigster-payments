var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	firstName: String,
	lastName: String,
	email: String,
	amount: Number,
	charged: Boolean,
	stripeId: String
});
var User = mongoose.model('User', userSchema);

module.exports = {User}