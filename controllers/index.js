const nodeFetch = require("node-fetch");
const { foodSchema, alertSchema } = require("../models/foodSchema");

let isServerOpen = false;


// Locals
exports.locals = async (req, res, next) => {
	res.locals.isOpen = isServerOpen
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


// Post here to change the status of the website
exports.businessStatus = async (req, res, next) => {
	isServerOpen = !isServerOpen
	nodeFetch("http://smokinbsbbq.tk/open-status")
	nodeFetch(`https://maker.ifttt.com/trigger/isSmokinOpen/with/key/${process.env.IFTTT}?value1=Business Status Changed&value2=Set status to: ${isServerOpen}`, { method: "POST" })

	res.redirect("/dashboard")
}


// Admin Dashboard
exports.renderDashboard = async (req, res, next) => {
	foodSchema.find({}, (err, foodItem) => {
		alertSchema.find({}, (err1, alertItem) => {
			!err && !err1 ? res.render("dashboard", { food: foodItem, alerts: alertItem }) : console.log(`Error[find]: ${err}`);
		})
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


// Creation of a new Alert
exports.renderAlertCreation = async (req, res, next) => {
	res.render("editing/newAlert")
}
exports.createAlert = async (req, res, next) => {
	let alertItem = new alertSchema({
		title: req.body.title,
		content: req.body.content
	});

	await alertItem.save(err => {
		if (!err) {
			req.flash("success", "Successfully Created A New Food Item.")
			return res.redirect("/dashboard")
		}
		req.flash("error", "Error Creating A New Food Item.")
		return res.redirect("/dashboard")
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


// Editing Alerts
exports.renderEditAlert = async (req, res, next) => {
	const alertItem = await alertSchema.findById(req.params.id)
	res.render("editing/editAlert", { alertItem })
}
exports.updateAlert = async (req, res, next) => {
	const alertItem = await alertSchema.findByIdAndUpdate(req.params.id, {
		title: req.body.title,
		content: req.body.content
	});

	await alertItem.save(err => {
		if (!err) {
			req.flash("success", "Successfully Updated An Alert.")
			return res.redirect("/dashboard")
		}
		req.flash("error", "Error Updating An Alert.")
		return res.redirect("/dashboard")
	})
}


// Destroy Foods and Alerts
exports.destroyFood = async (req, res, next) => {
	await foodSchema.findByIdAndDelete(req.params.id);
	req.flash("success", "Successfully Deleted A Food Item.")
	res.redirect("/dashboard");
}
exports.destroyAlert = async (req, res, next) => {
	await alertSchema.findByIdAndDelete(req.params.id);
	req.flash("success", "Successfully Deleted An Alert.")
	res.redirect("/dashboard");
}


// 404
exports.render404 = async (req, res, next) => {
	res.status(404).render(("404"))
}
