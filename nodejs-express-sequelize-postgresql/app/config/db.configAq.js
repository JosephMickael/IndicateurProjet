const { Pool, Client } = require("pg");

const pool_aq = new Pool({
  user: "postgres",
  host: "localhost",
  database: "indicateur_projet",
  password: "andriantsiferana",
  port: 5432,
});

// pool_aq.connect(function (error) {
//   if (!!error) {
//     console.log(error);
//   } else {
//     console.log("Connected! Aq");
//   }
// });

// pool_gpao.connect(function (error) {
//   if (!!error) {
//     console.log(error);
//   } else {
//     console.log("Connected! GPAO app");
//   }
// });

module.exports = pool_aq;
