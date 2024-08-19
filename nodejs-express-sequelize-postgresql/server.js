const express = require("express");
const cors = require("cors");
const routes = require("./app/routes/route"); // import the routes
const axios = require("axios");

const app = express();

var urlAPI = "http://localhost:4200";
var corsOptions = { origin: urlAPI };

var APIport = "3000";

app.use(cors(corsOptions));
app.use(express.json());
app.use("/indicateur_projet_api", routes);

const listener = app.listen(process.env.PORT || APIport, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
