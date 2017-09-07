const config = {
  "development": {
    "username": process.env.DB_USER || "username",
    "password": process.env.DB_PASSWORD || "password",
    "database": process.env.DB_NAME||"dbname",
    "host":  process.env.DB_HOST|| "localhost",
    "dialect": "postgres",
    "benchmark":true,
    "pool":{
      max:300
    },
    "scheme":"PKCS1",
    "version":"v1"
  },
  "uat": {
    "username": process.env.DB_USER || "username",
    "password": process.env.DB_PASSWORD || "password",
    "database": process.env.DB_NAME||"dbname",
    "host":  process.env.DB_HOST|| "localhost",
    "dialect": "postgres",
    "benchmark":true,
    "pool":{
      max:300
    },
    "scheme":"PKCS1",
    "version":"v1"
  },
  "prod": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port" : process.env.DB_PORT || 9999,
    "dialect": "postgres",
    "pool":{
      max:300
    },
    "scheme":"PKCS1",
    "version":"v1"
  }
}


module.exports = config;
