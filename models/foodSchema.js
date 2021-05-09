const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: true
	},
	price: {
		type: String,
		required: true
	},
	shortDescription: {
		type: String,
		required: true
	}
});

const alertSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	timePosted: {
		type: Date,
		default: Date.now
	}
})

module.exports.foodSchema = mongoose.model("BBQFood", foodSchema);
module.exports.alertSchema = mongoose.model("BBQAlerts", alertSchema);
