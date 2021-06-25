const { foodSchema, orderSchema } = require("../models/schemas");

// Locals
exports.locals = async (req, res, next) => {
	res.locals.success = req.flash("success")
	res.locals.error = req.flash("error")
	next()
}


// Util to make sure user is logged in
exports.isAuth = async (req, res, next) => {
	if (!req.session.isAuth) {
		req.session.isAuth = false;
		req.flash("error", "You are not signed in.")
		return res.redirect("/sign-in")
	}
	next()
}


// Render the homepage if authenticated
exports.index = async (req, res, next) => {
	res.render("home")
}


// Signing In
exports.renderSignIn = async (req, res, next) => {
	res.render("signIn")
}
exports.authSignIn = async (req, res, next) => {
	if (req.body["site_key"] === process.env.SITE_KEY && req.body["site_password"] === process.env.SITE_PASS) {
		req.session.isAuth = true;
		req.flash("success", "Authenticated!")
		return res.redirect("/")
	}
	req.flash("error", "You are not signed in.")
	return res.redirect("/sign-in")
}


// Admin Dashboards
exports.renderFoodsDashboard = async (req, res, next) => {
	foodSchema.find({}, (err, foodItem) => {
		!err ? res.render("dashboard", { food: foodItem }) : console.log(`Error[find]: ${err}`);
	})
}


exports.placeOrder = async (req, res) => {
	let checkoutCart = req.body;
	let totalPrice = 0;
	let customer = {};

	checkoutCart.forEach(order => {
		if (order.total) totalPrice += Number(order.total);
		customer.name = order?.customerName;
		customer.additionalComments = order?.additionalComments;
	})

	let newOrder = new orderSchema({
		orderContents: checkoutCart,
		customer,
		totalPrice,
		isOrderOpen: true,
	})
	await newOrder.save(err => {
		if (!err) {
			res.redirect("/counter")
			return req.flash("success", "Sent Order!")
		}
		res.redirect("/counter")
		return req.flash("error", "Error Sending Order.")
	})
}


// Creation of a new Food Item
exports.renderFoodCreation = async (req, res, next) => {
	res.render("editing/newFood")
}
exports.createFood = async (req, res, next) => {
	let foodItem = new foodSchema({
		name: req.body.name,
		category: req.body.category,
		price: req.body.price,
		shortDescription: req.body.description
	});

	await foodItem.save(err => {
		if (!err) {
			req.flash("success", "Successfully Created A New Food Item.")
			return res.redirect("/dashboard")
		}
		req.flash("error", "Error Creating A New Food Item.")
		return res.redirect("/dashboard")
	})
}

// Orders
exports.renderViewOrder = async (req, res, next) => {
	const order = await orderSchema.findById(req.params.id);

	res.render("foodtruck/viewOrder", { order })
}
// Orders
exports.updateOrder = async (req, res, next) => {
	const order = await orderSchema.findByIdAndUpdate(req.params.id, {
		isOrderOpen: req.body.openOrder === "on" ? true : false
	});

	await order.save(err => {
		if (!err) {
			req.flash("success", "Successfully Updated Order.")
			return res.redirect("/kitchen")
		}
		req.flash("error", "Error Updating Order.")
		return res.redirect("/kitchen")
	})
}


// Editing Food
exports.renderEditFood = async (req, res, next) => {
	const foodItem = await foodSchema.findById(req.params.id)
	res.render("editing/editFood", { foodItem })
}
exports.updateFoodItem = async (req, res, next) => {
	const foodItem = await foodSchema.findByIdAndUpdate(req.params.id, {
		name: req.body.name,
		category: req.body.category,
		price: req.body.price,
		shortDescription: req.body.description
	});

	await foodItem.save(err => {
		if (!err) {
			req.flash("success", "Successfully Updated A New Food Item.")
			return res.redirect("/dashboard")
		}
		req.flash("error", "Error Updating A New Food Item.")
		return res.redirect("/dashboard")
	})
}


// Destroy Foods
exports.destroyFood = async (req, res, next) => {
	await foodSchema.findByIdAndDelete(req.params.id);
	req.flash("success", "Successfully Deleted A Food Item.")
	res.redirect("/dashboard");
}


// Food Truck
exports.foodtruck = async (req, res) => {
	res.render("foodtruck/home");
}
exports.foodTruckBack = async (req, res) => {
	orderSchema.find({}, (err, orderI) => {
		!err ? res.render("foodtruck/kitchen", { orderI }) : console.log(`Error[find]: ${err}`);
	})
}
exports.foodTruckFront = async (req, res) => {
	foodSchema.find({}, (err, food) => {
		!err ? res.render("foodtruck/counter", { food }) : console.log(`Error[find]: ${err}`);
	})
}


// 404
exports.render404 = async (req, res, next) => {
	res.status(404).render(("404"))
}
