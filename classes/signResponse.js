/**
 * Response to signature generation APIs
 */
class SignatureResponse {
    constructor(signedValue, key, version) {
        this.signatureValue = signedValue
        this.keyId = key
        this.version = version
    }
}

module.exports = SignatureResponse