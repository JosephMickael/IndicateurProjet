var mysql = require('mysql');


const pool = mysql.createConnection({
  user: 'jouve',
  host: 'localhost',
  database: 'indicateur_projet',
  // password: 'xtr57ec',
  password: 'andriantsiferana',
  port: 3306,
});

// pool.connect(function(error){
//   if(!!error){
//     console.log(error);
//   }else{
//     console.log('Connected! Kanboard');
//   }
// });

module.exports = pool;