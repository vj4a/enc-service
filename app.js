const express = require("express");
const http = require('http');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const port = process.env.PORT || 8013;
const env = process.env.NODE_ENV || "development";
const morgan = require("morgan");
const config = require("./config/config.js")[env];
const fs = require("fs");
const models = require('./models');
const server = http.createServer(app);
const async = require("asyncawait/async");
const await = require("asyncawait/await");
const prompt = require("prompt");
const cryptoUtils = require("./utils/cryptoUtils");
const R = require("ramda");
var keyPairs = [];

var schema = {
  properties: {
    password: {
      description: 'Enter master password: ',
      hidden:true,
      replace: '*',
      required: true,
      type: 'string',
    }
  }
}

initMiddlewares = () => {
  if ("development" === env) {
    app.use(morgan("dev"));
  }
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(bodyParser.json({
    limit: "5mb"
  }));
};

initRoutes = () => {
  app.get("/", (req, res) => {
    return res.send("UP");
  });
  app.post("/encrypt", (req, res) => {
    return res.send(encryptValue(req.body.value));
  });
  app.post("/encrypt/obj", (req, res) => {
    return res.send(encryptObj(req.body.value));
  });
  app.post("/decrypt", (req, res) => {
    return res.send(decryptValue(req.body.value));
  });
  app.post("/decrypt/obj", (req, res) => {
    return res.send(decryptObj(req.body.value));
  });
};

startServer = () => {
  server.listen(port, function() {
    console.log("KeyService listening on port " + port + " in " + env + " mode");
  })
};

const getKey = () => {
  let activeKeys = R.filter(key=>key.active,keyPairs);
  let keyIndex = Math.floor(Math.random() * activeKeys.length);
  return activeKeys[keyIndex];
};

const getKeyById = (keyId) => {
  return R.filter(key=>key.id==keyId,keyPairs)[0];
};

const encryptObj = (obj) => {
  return R.map(encryptValue, obj);
};

const encryptValue = (value) => {
  let key = getKey();
  return config.version+"|"+key.id+"|"+config.scheme+"|"+cryptoUtils.rsaEncrypt(value,config.scheme,key.public);
};

const decryptObj = (obj) => {
  return R.map(decryptValue, obj);
};

const decryptValue = (value) => {
  let values = value.split("|");
  let key = getKeyById(values[1]);
  return cryptoUtils.rsaDecrypt(values[3],values[2],key.private);
};

loadKeys = async(() => {
  let password = await(getPassword());
  let keys = await(loadKeysFromDB());
  keys = R.map(key=>key.dataValues,keys);
  let masterKey = getMasterKey(password,keys);
  keyPairs = decryptKeys(masterKey,keys);
  startServer();
});

getMasterKey = (password,keys) => {
  return cryptoUtils.aesDecrypt(R.filter(key=>key.type=="MASTER",keys)[0].private,password);
};

const decryptKeys = (masterKey,keys) => {
  keys = R.map(key=>{
    if(key.type=="OTHER") {
      key.private = cryptoUtils.rsaDecrypt(key.private,config.scheme,masterKey);
    }
    return key;
  },keys);
  return R.filter(key=>{
    return key.type!="MASTER"
  },keys);
};

loadKeysFromDB = () => {
  return models.Keys.findAll({});
};

getMasterPassword = (resolve,reject) => {
  prompt.start()
  prompt.get(schema, function(err, result) {
    if (err) {
      return reject(err);
    }
    password = result.password;
    resolve(password);
  });
};

getPassword = () => {
  return new Promise((resolve, reject) => {
    getMasterPassword(resolve, reject);
  });
};


initMiddlewares();
initRoutes();
loadKeys()
  .catch(err=>{
    console.log("Error starting service ",err);
  })
