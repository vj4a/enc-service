const crypto = require("crypto");
const ursa = require("ursa");
const R = require("ramda");

/**
 * Adds a 16 bit length salt and creates a base64 encoded signature.
 * Increasing the salt length could potentially cause "data too large to sign 
 * message" as the data is variant. Test with typical payload before change
 * @param {string} message Message to be signed
 * @param {string} hashAlgo Any dgst algo, such as sha256, sha512, sha, sha1
 * @param {string} privateKey 
 * @returns {string} base64 encoded signature string
 */
const rsaHashAndSign = (message, hashAlgo, privateKey) => {
  var crt = ursa.createPrivateKey('-----BEGIN RSA PRIVATE KEY-----\n' + privateKey + '\n' + '-----END RSA PRIVATE KEY-----')
  return crt.hashAndSign(hashAlgo, message, 'utf8', 'base64', true, 16);  
}

/**
 * Verifies if the signed message is same as original.
 * @param {string} signature Signed message
 * @param {string} claim Original message
 * @param {string} hashAlgo Any dgst algo, such as sha256, sha512, sha, sha1
 * @param {string} publicKey 
 * @returns true if signature matches the original message, false otherwise
 */
const rsaHashAndVerify = (signature, claim, hashAlgo, publicKey) => {
  var crt = ursa.createPublicKey('-----BEGIN PUBLIC KEY-----\n' + publicKey + '\n' + '-----END PUBLIC KEY-----')
  return crt.hashAndVerify(hashAlgo, claim, signature, 'base64', true, 16); 
}

exports.rsaHashAndSign = rsaHashAndSign;
exports.rsaHashAndVerify = rsaHashAndVerify;
