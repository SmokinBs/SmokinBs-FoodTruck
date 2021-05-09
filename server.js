require("dotenv").config();
const express = require('express');
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const nodeFetch = require("node-fetch");
const session = require("express-session");

const app = express();

// AXIGEN: S(]h\e$e[:k:3ug:

// Mongoose
mongoose.connect(process.env.MONGO_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }).catch(err => { console.log("Error[connect]: " + err) })
mongoose.connection.on('error', err => { console.log("Error[onErr]: " + err); });
const { foodSchema, alertSchema } = require("./models/foodSchema");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.set("views", "./views")
app.set('view engine', 'ejs');
app.use(session({
	secret: "aklhsjkfhyauifydoifhsjkdvghiusddfa",
	cookie: { maxAge: 8640000000 },
	resave: false,
	saveUninitialized: false
}))

let isServerOpen = false;


// Routes

app.get("*", (req, res) => {
	res.render("noSee", { isOpen: isServerOpen })
})

app.route("/")
	.get((req, res) => {
		if (req.session.isAuth) {
			res.render("home", { isOpen: isServerOpen })
			console.log("Auth")
		} else {
			res.redirect("/sign-in")
		}
	})

app.route("/sign-in")
	.get((req, res) => {
		res.render("signIn", { isOpen: isServerOpen })
	})
	.post((req, res) => {
		if (req.body["site_key"] === process.env.SITE_KEY && req.body["site_password"] === process.env.SITE_PASS) {
			//nodeFetch(`https://maker.ifttt.com/trigger/isSmokinOpen/with/key/${process.env.IFTTT}?value1=Authenticated&value2=New Authentication at ip${req.ip}`, { method: "POST" })
			req.session.isAuth = true;
			res.redirect("/")
		} else {
			res.redirect("/sign-in")
		}
	})

app.get("/open-status", (req, res) => {
	isServerOpen = !isServerOpen
	nodeFetch("http://smokinbsbbq.tk/open-status")
	nodeFetch(`https://maker.ifttt.com/trigger/isSmokinOpen/with/key/${process.env.IFTTT}?value1=Business Status Changed&value2=Set status to: ${isServerOpen}`, { method: "POST" })

	res.redirect("/dashboard")
})

app.get("/dashboard", (req, res) => {
	if (req.session.isAuth) {
		foodSchema.find({}, (err, foodItem) => {
			alertSchema.find({}, (err1, alertItem) => {
				!err && !err1 ? res.render("dashboard", { isOpen: isServerOpen, food: foodItem, alerts: alertItem }) : console.log(`Error[find]: ${err}`);
			})
		})
	} else {
		res.redirect("/sign-in")
	}
});


app.route("/create-food")
	.get((req, res) => {
		if (req.session.isAuth) {
			res.render("editing/newFood", { isOpen: isServerOpen })
		} else {
			res.redirect("/sign-in")
		}
	})
	.post(async (req, res, next) => {
		if (req.session.isAuth) {
			let foodItem = new foodSchema({
				name: req.body.name,
				category: req.body.category,
				price: req.body.price,
				shortDescription: req.body.description
			});

			await foodItem.save(err => { !err ? res.redirect("/dashboard") : console.log(err) })
		} else {
			res.redirect("/sign-in")
		}
	})

app.route("/create-alert")
	.get((req, res) => {
		if (req.session.isAuth) {
			res.render("editing/newAlert", { isOpen: isServerOpen })
		} else {
			res.redirect("/sign-in")
		}
	})
	.post(async (req, res, next) => {
		if (req.session.isAuth) {
			let alertItem = new alertSchema({
				title: req.body.title,
				content: req.body.content
			});

			await alertItem.save(err => { !err ? res.redirect("/dashboard") : console.log(err) })
		} else {
			res.redirect("/sign-in")
		}
	})

app.route("/edit-food/:id")
	.get(async (req, res) => {
		if (req.session.isAuth) {
			const foodItem = await foodSchema.findById(req.params.id)
			res.render("editing/editFood", { isOpen: isServerOpen, foodItem: foodItem })
		} else {
			res.redirect("/sign-in")
		}
	})
	.post(async (req, res) => {
		if (req.session.isAuth) {
			const foodItem = await foodSchema.findByIdAndUpdate(req.params.id, {
				name: req.body.name,
				category: req.body.category,
				price: req.body.price,
				shortDescription: req.body.description
			});

			await foodItem.save(err => { !err ? res.redirect("/dashboard") : console.log(err) })
		} else {
			res.redirect("/sign-in")
		}
	})

app.route("/edit-alert/:id")
	.get(async (req, res) => {
		if (req.session.isAuth) {
			const alertItem = await alertSchema.findById(req.params.id)
			res.render("editing/editAlert", { isOpen: isServerOpen, alertItem: alertItem })
		} else {
			res.redirect("/sign-in")
		}
	})
	.post(async (req, res) => {
		if (req.session.isAuth) {
			const alertItem = await alertSchema.findByIdAndUpdate(req.params.id, {
				title: req.body.title,
				content: req.body.content
			});

			await alertItem.save(err => { !err ? res.redirect("/dashboard") : console.log(err) })
		} else {
			res.redirect("/sign-in")
		}
	})

app.get("/d/food/:id", async (req, res) => {
	if (req.session.isAuth) {
		await foodSchema.findByIdAndDelete(req.params.id);
		res.redirect("/dashboard");
	} else {
		res.redirect("/sign-in")
	}
})

app.get("/d/alert/:id", async (req, res) => {
	if (req.session.isAuth) {
		await alertSchema.findByIdAndDelete(req.params.id);
		res.redirect("/dashboard");
	} else {
		res.redirect("/sign-in")
	}
})


app.use(function (req, res, next) {
	res.status(404).render("404", { isOpen: isServerOpen })
})


app.listen(process.env.PORT || 9999, () => {
	console.log(`Listening on port ${process.env.PORT}`)
});
