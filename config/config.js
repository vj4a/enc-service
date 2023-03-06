var fs = require('fs');

const config = {
  "development": {
    "username": process.env.DB_USER || "username",
    "password": process.env.DB_PASSWORD || "password",
    "database": process.env.DB_NAME ||"dbname",
    "host":  process.env.DB_HOST|| "localhost",
    "dialect": process.env.DB_DIALECT || "postgres",
    "dialectOptions": {
      "ssl": {
        "rejectUnauthorized": false, // Explicitly disabling the ssl by this flag
      }
    },    
    "benchmark":true,
    "pool":{
      max:300
    },
    "scheme":"PKCS1",
    "version":"1.0.0",
    "hashAlgorithm": "sha256",
    "logging": false
  },
  "prod": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port" : process.env.DB_PORT || 9999,
    "dialect": process.env.DB_DIALECT || "postgres",
    "dialectOptions": {
      "ssl": {
        "rejectUnauthorized": false, // Explicitly disabling the ssl by this flag
      }
    },        
    "pool":{
      max:300
    },
    "scheme":"PKCS1",
    "version":"1.0.0",
    "hashAlgorithm": "sha256",
    "logging": false
  }
}


module.exports = config;
