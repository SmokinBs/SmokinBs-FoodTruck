const mongoose = require("mongoose");

const foodTruckFoodSchema = new mongoose.Schema({
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
	}
});

const foodTruckOrderSchema = new mongoose.Schema({
	orderContents: {
		type: Array,
		required: true
	},
	customer: {
		type: Object,
		required: true
	},
	totalPrice: {
		type: Number,
		required: true
	},
	orderDate: {
		type: Date,
		default: Date.now
	},
	isOrderOpen: {
		type: Boolean,
		required: true
	}
});

module.exports.foodSchema = mongoose.model("FoodTruckFood", foodTruckFoodSchema);
module.exports.orderSchema = mongoose.model("FoodTruckOrders", foodTruckOrderSchema);
