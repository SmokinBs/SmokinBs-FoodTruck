require("dotenv").config();
const express = require('express');
const session = require("express-session");
const mongoose = require("mongoose");
const flash = require("connect-flash");

const app = express();
const controllers = require("./controllers");

// Mongoose
mongoose.connect(process.env.MONGO_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
mongoose.connection.on('error', err => { console.log("Error[onErr]: " + err); });

// Middleware
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(require("body-parser").json());
app.use(express.static("./public"));
app.set("views", "./views")
app.set('view engine', 'ejs');
app.use(session({
	secret: process.env.SESSION_SECRET,
	cookie: { maxAge: 8640000000 },
	resave: false,
	saveUninitialized: false
}))
app.use(flash());


app.use(controllers.locals)

app.route("/sign-in")
	.get(controllers.renderSignIn)
	.post(controllers.authSignIn);

app.get("/", controllers.isAuth, controllers.foodtruck);
app.get("/dashboard", controllers.isAuth, controllers.renderFoodsDashboard);

app.post("/place-order", controllers.isAuth, controllers.placeOrder);

app.route("/view-order/:id")
	.get(controllers.isAuth, controllers.renderViewOrder)
	.post(controllers.isAuth, controllers.updateOrder);


app.route("/create-food")
	.get(controllers.isAuth, controllers.renderFoodCreation)
	.post(controllers.isAuth, controllers.createFood)

app.route("/edit-food/:id")
	.get(controllers.isAuth, controllers.renderEditFood)
	.post(controllers.isAuth, controllers.updateFoodItem)

// FOOD TRUCK
app.get("/kitchen", controllers.isAuth, controllers.foodTruckBack)
app.get("/counter", controllers.isAuth, controllers.foodTruckFront)
app.get("/d/:id", controllers.isAuth, controllers.destroyFood)


app.use(controllers.render404)


app.listen(process.env.PORT || 9999, () => {
	console.log(`Listening on port ${process.env.PORT}`)
});
