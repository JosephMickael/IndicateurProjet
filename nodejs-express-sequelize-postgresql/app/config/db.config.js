const { Pool, Client } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "indicateur_projet",
  password: "andriantsiferana",
  port: 5432,
});

pool.connect(function (error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log("Connected! Angular App");
  }
});

// pool_gpao.connect(function (error) {
//   if (!!error) {
//     console.log(error);
//   } else {
//     console.log("Connected! GPAO app");
//   }
// }); 

module.exports = pool;
