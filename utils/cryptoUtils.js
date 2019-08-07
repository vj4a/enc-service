const crypto = require("crypto");
const ursa = require("ursa");
const R = require("ramda");

const schemeMap = {
	"OAEP":"RSA_PKCS1_OAEP_PADDING",
	"PKCS1":"RSA_PKCS1_PADDING"
};

const aesDecrypt = (message, password) => {
  var decipher = crypto.createDecipher("aes-128-cbc", password)
  var decrypted = decipher.update(message, 'hex', 'utf8')
  decrypted += decipher.final('utf8');
  return decrypted;
};

const rsaDecrypt = (message,scheme,privateKey) => {
  var crt = ursa.createPrivateKey('-----BEGIN RSA PRIVATE KEY-----\n' + privateKey + '\n' + '-----END RSA PRIVATE KEY-----')
  return crt.decrypt(message, 'base64', 'utf8', ursa[schemeMap[scheme]]);
};

const rsaDecryptUsingCert = (message,scheme,crt) => {
  return crt.decrypt(message, 'base64', 'utf8', ursa[schemeMap[scheme]]);
};

const rsaDecryptChunks = (chunkedStr, scheme, key) => {
  var arrChunks = chunkedStr.split("|")
  var crt = ursa.createPrivateKey('-----BEGIN RSA PRIVATE KEY-----\n' + key + '\n' + '-----END RSA PRIVATE KEY-----')
    
  let result = ""
  for (idx = 0; idx < arrChunks.length; idx++) {
    result += rsaDecryptUsingCert(arrChunks[idx],scheme,crt) 
  }

  return result
}

const rsaChunkedDecrypt = (message,scheme,privateKey) => {
  let decryptedMessage = rsaDecryptChunks(message, scheme, privateKey)
  return decryptedMessage;
};

const rsaEncrypt = (message,scheme,publicKey) => {
  var crt = ursa.createPublicKey('-----BEGIN PUBLIC KEY-----\n' + publicKey + '\n' + '-----END PUBLIC KEY-----')
  return crt.encrypt(message, 'utf8', 'base64', ursa[schemeMap[scheme]]);
}

exports.aesDecrypt = aesDecrypt;
exports.rsaDecrypt = rsaDecrypt;
exports.rsaEncrypt = rsaEncrypt;
exports.rsaChunkedDecrypt = rsaChunkedDecrypt;
