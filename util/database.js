/* const mysql = require('mysql2'); //

const pool = mysql.createPool({ // Creates a connection pool using the createPool method from the mysql2 library. The pool allows for more efficient management of MySQL connections.
    host: 'localhost',
    user: 'root', //of mysql
    database: 'node-complete',
    password: 'Tuktuk123@'

});

module.exports = pool.promise(); 

/* note:-Exports the created pool as a promise-based pool. This allows you to use promises instead of callbacks when interacting with 
the MySQL database.

 */ 

//importing sequelize
/* 
require('dotenv').config();

const Sequelize = require('sequelize')
const sequelize = new Sequelize(process.env.DBASE_NAME,process.env.DBASE_USERNAME, process.env.DBASE_PASSWORD ,{dialect : 'mysql', host :process.env.DBASE_HOST}) // instance of Sequelize

module.exports= sequelize;
 */

require('dotenv').config();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db;

const mongoConnect = (callBack) =>{
    MongoClient.connect(
        process.env.MONGODB_LINK
    )
        .then(client =>{
            _db=client.db();
            callBack();
            console.log('connected');
        })
        .catch(err =>{
            console.log(err);
            throw err;
        })

};

const getDb= function(){
    if(_db){
        return _db;
    }
    throw "No database found";
}



module.exports = mongoConnect;
exports.getDb=getDb;
