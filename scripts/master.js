const crypto = require('crypto')
const ursa = require('ursa')
const prompt = require('prompt')
const R = require("ramda");
const models = require("../models");
var fs = require('fs');
const child_process = require('child_process');

var schema = {
  properties: {
    password: {
      description: 'Enter master password',
      hidden:true,
      replace: '*',
      required: true,
      type: 'string',
    },
    repassword: {
      description: 'Re-Enter master password',
      hidden:true,
      replace: '*',
      required: true,
      type: 'string',
      conform: function(repassword) {
      var password = prompt.history('password').value;
      return (password == repassword);
      }
    },
    numKeys: {
      description: 'Number of keys to generate',
      required: true,
      type: 'number'
    },
  }
}


function getPassword() {
  prompt.start()
  prompt.get(schema, function(err, result) {
    if (err) {
      return console.log(err); } 
    password = result.password;
    var keys = getKeys(password,result.numKeys)
    if(writeToFile("./keys/keys.json", keys)){
      console.log("Keys created...")
    }
    models.Keys.bulkCreate(keys)
    .then(sc=>{
      console.log("Keys successfully written to DB");
      delete schema.properties.numKeys;
      prompt.get(schema, function(err, result) {
        if (err) {
          return console.log(err); } 
          password = result.password;
          if(verifyEncryption(keys, password)){
            console.log("Verification successful...")
          }
      });
    })
    .catch(err=>{
      console.log("Error adding keys to db",err);
    })
  });
 
}

const writeToFile = (fileName, keys) => {
  fs.writeFile(fileName, JSON.stringify(keys), function(err) {
    if(err) {
        return console.log(err);
    }
  });
  return true;
}

const createZip = (inputFile) => {
  var createKeyZip = child_process.spawn('zip', ['--encrypt','./keys/keys.zip', inputFile]);
  createKeyZip.stdout.on('data', function (data) {
      // console.log('stdout: ' + data);
   });
  createKeyZip.stderr.on('data', function (data) {
    if(data.includes('Enter')){
      console.log("Enter password for zip: ")
    } else if(data.includes('Verify')){
      console.log("Verify password for zip: ")
    }
  });

  createKeyZip.on('close', function (code) {
    var destroyKeyjson = child_process.spawn('rm', ['-rf','decryptedKeys.json']);
    console.log("keys.json and keys.zip has been saved in ./keys directory")
    console.log("REMEMBER MASTER AND ZIP PASSWORD")
    console.log('Warning: Nothing will work without master password');
  });
}

const verifyEncryption = (keys, password) => {
  let decryptedKeys = []
  let masterKey = getMasterKey(keys)
  if(masterKey!=null){
    decryptedKeys.push(masterKey)
    for(var i=0; i<keys.length; i++){
      if(keys[i]["type"] == "OTHER"){
        let key = {}
        key.public = keys[i]["public"]
        key.private = rsaDecryption(keys[i]["private"], masterKey.private)
        key.type = "OTHER"
        key.active = true
        decryptedKeys.push(key)
      }
    }
    if(writeToFile("decryptedKeys.json", decryptedKeys)){
      createZip("decryptedKeys.json")
      return true
    }
  }
  return false
}

const getMasterKey = (keys) => {
  for(var i=0; i<keys.length; i++){
    if(keys[i]["type"] == "MASTER"){
      let key = {}
      key.public = keys[i]["public"]
      key.private = decMasterKey(keys[i]["private"], password)
      key.type = "MASTER"
      key.active = true
      if(key.private == null) {return null}
      return key
    }
  }
}

const getKeys = (password,numKeys) => {
  let master = generateKey(password);
  let keys = [];
  keys.push(master);
  for (var i = 0; i < numKeys; i++) {
    var keypair = ursa.generatePrivateKey(512);
    let key = {};
    key.public = convertPemToString(keypair.toPublicPem().toString());
    key.private = rsaEncryption(convertPemToString(keypair.toPrivatePem().toString()), master.public);
    key.type = "OTHER";
    key.active = true;
    keys.push(key);
  }
  return keys;
};

const generateKey = (password) => {
  var keys = { "key": {} }
  var keypair = ursa.generatePrivateKey(4096);
  keys.key.public = convertPemToString(keypair.toPublicPem().toString())
  keys.key.private = encMasterKey(convertPemToString(keypair.toPrivatePem().toString()), password)
  keys.key.type = "MASTER";
  keys.key.active = true;
  return keys.key;
};

const encMasterKey = (key, password) => {
  var cipher = crypto.createCipher("aes-128-cbc", password)
  var crypted = cipher.update(key, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
};

const rsaEncryption = (message, publicKey) => {
  var crt = ursa.createPublicKey('-----BEGIN PUBLIC KEY-----\n' + publicKey + '\n' + '-----END PUBLIC KEY-----')
  return crt.encrypt(message, 'utf8', 'base64', ursa.RSA_PKCS1_PADDING)
}

const rsaDecryption = (message,privateKey) => {
  var crt = ursa.createPrivateKey('-----BEGIN RSA PRIVATE KEY-----\n' + privateKey + '\n' + '-----END RSA PRIVATE KEY-----')
  return crt.decrypt(message, 'base64', 'utf8', ursa.RSA_PKCS1_PADDING);
};

const convertPemToString = (pemKey) => {
  var pemKeyArray = pemKey.split('\n')
  var stringPemKey = "";
  for (var i = 1; i < pemKeyArray.length - 2; i++) {
    stringPemKey += pemKeyArray[i]
  }
  return stringPemKey
}

const decMasterKey = (key, password) => {
  try{
    var decipher = crypto.createDecipher("aes-128-cbc", password)
    var decrypted = decipher.update(key, 'hex', 'utf8')
    decrypted += decipher.final('utf8');
    return decrypted;  
  } catch(err){
    console.log("Could not decrypt master key, Verification unsuccessful")
    return null;
  }
}

getPassword()
