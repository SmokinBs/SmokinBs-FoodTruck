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
app.get("/", controllers.isAuth, controllers.index);
app.get("/open-status", controllers.isAuth, controllers.businessStatus);
app.get("/dashboard", controllers.isAuth, controllers.renderDashboard);


app.route("/sign-in")
	.get(controllers.renderSignIn)
	.post(controllers.authSignIn);

app.route("/create-food")
	.get(controllers.isAuth, controllers.renderFoodCreation)
	.post(controllers.isAuth, controllers.createFood)
app.route("/create-alert")
	.get(controllers.isAuth, controllers.renderAlertCreation)
	.post(controllers.isAuth, controllers.createAlert)

app.route("/edit-food/:id")
	.get(controllers.isAuth, controllers.renderEditFood)
	.post(controllers.isAuth, controllers.updateFoodItem)
app.route("/edit-alert/:id")
	.get(controllers.isAuth, controllers.renderEditAlert)
	.post(controllers.isAuth, controllers.updateAlert)

app.get("/d/food/:id", controllers.isAuth, controllers.destroyFood)
app.get("/d/alert/:id", controllers.isAuth, controllers.destroyAlert)


app.use(controllers.render404)


app.listen(process.env.PORT || 9999, () => {
	console.log(`Listening on port ${process.env.PORT}`)
});
