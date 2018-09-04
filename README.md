# Encryption Service
HTTP based Encryption Service.

## Getting Started

### System Requirements

* Nodejs
* Npm
* Relational Database(Postgres/Mysql)

### Installing

`npm i`

### DB Setup
The following are instructions that works as-is in Postgres. For Mysql, there are some
changes needed, as noted in each step.

* Creating key type enum
    `CREATE TYPE "enum_Keys_type" AS ENUM ('MASTER','OTHER');`
Not required in Mysql

* Creating DB Table

      `CREATE TABLE "Keys" (
        id SERIAL PRIMARY KEY,
        public text NOT NULL,
        private text NOT NULL,
        type "enum_Keys_type" NOT NULL,
        active boolean DEFAULT true NOT NULL,
        "createdAt" timestamp with time zone NOT NULL,
        "updatedAt" timestamp with time zone NOT NULL
      );`
The type would have to be supplied as "type enum('MASTER', 'OTHER')" in Mysql.

### Generating keys

1. Edit the DB credentials by exporting the following environment variables
    1. DB_HOST
    1. DB_USER
    1. DB_PASSWORD
    1. DB_NAME
    1. DB_DIALECT - "postgres"|"mysql"|"sqlite"
1. Set the environment by exporting the `NODE_ENV` environment variable as `development` or `prod`
    1. DB_PORT defaults to 9999 in prod. If the DB server is listening on a different port, DB_PORT must be set.
1. Run the key generation script

      `node scripts/master.js`
 * This will ask you for encryption password twice and then add the following
     * Encrypted RSA keys to the DB
 * The encryption password will be asked twice again -- same as above
     * Encrypted RSA keys in a file(./keys/keys.json)
 * The zip encryption password will be asked twice, this can be a different password
     * Protected zip of unencrypted keys (./keys/keys.zip)


### Running the service

    node app.js < passwd &

 This will start the encryption service in the background on port 8013 by reading the master password from `passwd` file.


## APIs
### Encrypt
    curl -X POST -H "Content-Type: application/json" -d '{
      "value":"sunbird"
    }' "http://localhost:8013/encrypt"
    
    curl -X POST -H "Content-Type: application/json" -d '{
        "value": { "name": "Ramesh Kumar", "phone": "9901990101" }
    }' "http://localhost:8013/encrypt/obj"

### Decrypt

    curl -X POST -H "Content-Type: application/json" -d '{
      "value":"v1|62|DL6oW2QemDz/qmPcqP+mjD5x6Y6d2GGYkfeUHqyk9qazJ5O7Ep4bH06VX0D3iqQjckESFMXlE9nBDcy93JFVNw=="
    }' "http://localhost:8013/decrypt"

    curl -X POST -H "Content-Type: application/json" -d '{
      "value": { "name": "v1|62|DL6oW2QemDz/qmPcqP+mjD5x6Y6d2GGYkfeUHqyk9qazJ5O7Ep4bH06VX0D3iqQjckESFMXlE9nBDcy93JFVNw==",
                 "phone": "v1|77|DL6oW2QemDz/qmPcqP+mjD5x6Y6d2GGYkfeUHqyk9qazJ5O7Ep4bH06VX0D3iqQjckESFMXlE9nBDcy93JFVNw=="}
    }' "http://localhost:8013/decrypt/obj"
 
### Sign
    Sign a single attribute
    `curl -X POST -H "Content-Type: application/json" -d '{
      "value":"sunbird"
    }' "http://localhost:8013/sign"
    Sample response:
    {
        "signatureValue": "v1|2|PKCS1|vJUolu7lKXa2Jwba0VS8xPDbRUnPdyaIFe9fhPd8+fAybY3dJmiupMcI2VHlOhOWCT5+347PgPix8nn5hrs3Aw==",
        "keyId": 2
    }
    `
    
    Sign multiple attributes at one go
    `curl -X POST -H "Content-Type: application/json" -d '{
        "value": ["Ramesh Kumar", "9901990101"]
       }
    }' "http://localhost:8013/sign"
    Sample response:
    [{
        "signatureValue": "v1|2|PKCS1|Zof/AJu/ALQtD0OjuBFvs8dsZ/OfD08mC30ex5g1P1jV0IJYIHPscF0jGdGec/KkHmyvKkLU/hHiQ0czzr6Cvg==",
        "keyId": 2
    },
    {
        "signatureValue": "v1|3|PKCS1|tV0EHm0wKclS6v/gOhhaP51QcV39wUYPxYZCoA+4cGM2NicFGtjdMnV23HxZUR0CVxpVo91qBKeHbgpAD3/7pQ==",
        "keyId": 3
    }]`

    Sign a single entity
    `curl -X POST -H "Content-Type: application/json" -d '{
       "entity": {
           "name": "Kevin", "phone": "9901990103" 
        } 
    }' "http://localhost:8013/sign"
    Sample response:
    {
        "signatureValue": "v1|2|PKCS1|iv07RbttVQZeOpGF8SCJitPnV/sEWW0LN8hc2U2MDMcIw3INsp5c8mjJiyiKvO31lS7LEflj20EOVvRmI3cRyw==",
        "keyId": 2
    }`

    Sign multiple entities
    `curl -X POST -H "Content-Type: application/json" -d '{
       "entity": [  
                {"name": "Ram", "phone": "9901990101" }, 
                {"name": "John", "phone": "9901990102" }
        ]
    }' "http://localhost:8013/sign"
    Sample response:
    [{
        "signatureValue": "v1|3|PKCS1|YzlNSN++9wFO7hBEXLgM3wBqWnCOi/euSyrbFSigrQe+t+ZwB0VNLfWGWdjwY8v28JTmns7T5cEArOcXeuqDbQ==",
        "keyId": 3
    },
    {
        "signatureValue": "v1|3|PKCS1|oVYESGSI3C2Bc/gt+PjddJmmAPd7Eo+sPJ6FUzUw6FBlylAaShOYrpXqQbbsSLx3IkPwVYdfIgo5Y/ZatU8WyA==",
        "keyId": 3
    }]`

### Verify
    Verify a single attribute
    `curl -X POST -H "Content-Type: application/json" -d '{
      "value":{ 
            "claim": "sunbird",
            "signatureValue": "v1|2|PKCS1|vJUolu7lKXa2Jwba0VS8xPDbRUnPdyaIFe9fhPd8+fAybY3dJmiupMcI2VHlOhOWCT5+347PgPix8nn5hrs3Aw=="
      }
    }' "http://localhost:8013/verify"
    Sample response:
    true
    `
    
    Verify multiple attributes at one go
    `curl -X POST -H "Content-Type: application/json" -d '{
        "value": [{
                "claim": "Ramesh Kumar",
                "signatureValue": "v1|2|PKCS1|Zof/AJu/ALQtD0OjuBFvs8dsZ/OfD08mC30ex5g1P1jV0IJYIHPscF0jGdGec/KkHmyvKkLU/hHiQ0czzr6Cvg=="
            }, {
                "claim": "9901990101",
                "signatureValue": "v1|3|PKCS1|tV0EHm0wKclS6v/gOhhaP51QcV39wUYPxYZCoA+4cGM2NicFGtjdMnV23HxZUR0CVxpVo91qBKeHbgpAD3/7pQ=="
        ]
    }' "http://localhost:8013/verify"
    Sample response:
    [
        true,
        true
    ]`

    Verify a single entity
    `curl -X POST -H "Content-Type: application/json" -d '{
       "entity": {
           "claim": {"name": "fruit", "color": "red"},
	        "signatureValue": "v1|3|PKCS1|qsBPIU0EN1+I+5LkjhPbxjQuWPKQIfkhCrP9mwchqdufhnnteOHOL0ZZfsbg8AgTVqTHNuvY7RYMfN2+d0wtvw==" 
        } 
    }' "http://localhost:8013/verify"
    Sample response:
    true`

    Verify multiple entities
    `curl -X POST -H "Content-Type: application/json" -d '{
       "entity":[{
	        "claim": {"name": "fruit", "color": "red"},
	        "signatureValue": "v1|3|PKCS1|qsAPIU0EN1+I+5LkjhPbxjQuWPKQIfkhCrP9mwchqdufhnnteOHOL0ZZfsbg8AgTVqTHNuvY7RYMfN2+d0wtvw=="
        },{
	        "claim":{"name": "apple", "shape": "round"},
	        "signatureValue": "v1|2|PKCS1|X87ErciD6X6bFBYUjZ0gd88BtuOWBbGe6iS1Rx2dVuKkYpkVXU/OaGXJv68AaZaTNsDPVbKVbBQx5t6oLlq+Uw=="
        }]
    }' "http://localhost:8013/verify"
    Sample response:
    [
        false,
        true
    ]`

# Get keys
    Get an active public key associated with the given identifier
     `curl -X GET -H "Content-Type: application/json" "http://localhost:8013/keys/3"
    Sample response:
    -----BEGIN PUBLIC KEY-----MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANNCNWC5K484XsQEvSL8rkVtJlAV9nTsusuHbxiU5xKp7R5Pw2ueEteqwfgRri0sVzJrrI394Tn/FjyXDtW+dhsCAwEAAQ==-----END PUBLIC KEY-----
    `
