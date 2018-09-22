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
const signatureUtils = require("./utils/signatureUtils");
const signatureResponse = require("./classes/signResponse");
const buffer = require("buffer").Buffer;
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

  // Get public key specified by id
  app.get("/keys/:id", (req, res) => {
    return res.send(getPublicKey(req.params.id));
  });
  
  // Encryption, Decryption
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

  // Signature, Verification
  app.post("/sign", (req, res) => {
    if (Array.isArray(req.body.value)) {
      return res.send(signMultipleValues(req.body.value));
    } else if (req.body.value) {
      return res.send(signValue(req.body.value));
    } else if (Array.isArray(req.body.entity)) {
      return res.send(signMultipleEntities(req.body.entity))
    } else if (req.body.entity) { 
      return res.send(signEntity(req.body.entity));
    }
  })
  app.post("/verify", (req, res) => {
    if (Array.isArray(req.body.value)) {
      return res.send(verifyMultipleValues(req.body.value));
    } else if (req.body.value) {
      return res.send(verifyValue(req.body.value))
    } else if (Array.isArray(req.body.entity)) {
      return res.send(verifyMultipleEntities(req.body.entity));
    } else if (req.body.entity) {
      return res.send(verifyEntity(req.body.entity))
    }
  })
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

/** 
 * Returns only active public keys 
 * @param {number} keyId 
 * */
const getPublicKey = (keyId) => {
  let key = getKeyById(keyId);
  let publicKey = "";
  if (key && key.active) {
    publicKey = '-----BEGIN PUBLIC KEY-----\n' + key.public + '\n' + '-----END PUBLIC KEY-----';
  }
  return publicKey;
}

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

const signValue = (value) => {
  let key = getKey();
  let signedVal = signatureUtils.rsaHashAndSign(value,config.hashAlgorithm,key.private);
  let result = new signatureResponse(signedVal, key.id, config.version);
  return result;
};

const signMultipleValues = (value) => {
  return R.map(signValue, value);
};

/**
 * At the time of signing or verifying, the payloads could be ordered different
 * The hash of the message is generated based on the order in they which appear
 * and so lets order it alphabetically.
 * This function sorts keys and values and does it recursively.
 * @param {*} jsonObjToSort 
 */
const getSortedJson = (jsonObjToSort) => {
  var sorted = {}
  Object.keys(jsonObjToSort).sort().forEach(function(key) {
    if (Array.isArray(sorted[key])) {
      var typeName = typeof(sorted[key][0])
      if (typeName === "object") {
        // The first element within the array is a Json object. Sort that
        sorted[key] = getSortedJson(sorted[key][0])
      } else {
        // The array contains simple values, sort it ascending
        var arr
        if (typeName === "number") {
          // This is required, otherwise 20 will appear before 3.
          arr = sorted[key].sort(function(a, b){return a-b});
        } else {
          arr = sorted[key].sort();
        }
        sorted[key] = arr.slice()
      }
    } else if (typeof(sorted[key]) === "object") {
      sorted[key] = getSortedJson(sorted[key])
    } else {
      sorted[key] = jsonObjToSort[key];
    }
  })
  return sorted;
}

const signEntity = (entity) => {
  var ordered = getSortedJson(entity);
  return signValue(JSON.stringify(ordered).trim())
}

const signMultipleEntities = (value) => {
  return R.map(signEntity, value);
};

const verifyValue = (obj) => {
  let keyId = obj['keyId']
  let signatureValue = obj['signatureValue']
  let claim = obj['claim']
  if (typeof(claim) === 'object') {
    claim = JSON.stringify(claim)
  }
  
  let key = getKeyById(keyId);
  return signatureUtils.rsaHashAndVerify(signatureValue, new buffer(claim.trim()).toString("base64"), config.hashAlgorithm, key.public);
};

const verifyMultipleValues = (values) => {
  return R.map(verifyValue, values);
}

const verifyEntity = (entity) => {
  var ordered = getSortedJson(entity);
  return verifyValue(ordered)
}

const verifyMultipleEntities = (values) => {
  return R.map(verifyEntity, values);
}


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
  password = process.env.ENTRY_PASS;
  resolve(password);
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
