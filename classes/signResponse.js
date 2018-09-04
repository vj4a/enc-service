/**
 * Response to signature generation APIs
 */
class SignatureResponse {
    constructor(signedValue, key) {
        this.signatureValue = signedValue
        this.keyId = key
    }
}

module.exports = SignatureResponse