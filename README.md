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

* Creating key type enum

      CREATE TYPE "enum_Keys_type" AS ENUM ('MASTER','OTHER');

* Creating DB Table

      CREATE TABLE "Keys" (
        id SERIAL PRIMARY KEY,
        public text NOT NULL,
        private text NOT NULL,
        type "enum_Keys_type" NOT NULL,
        active boolean DEFAULT true NOT NULL,
        "createdAt" timestamp with time zone NOT NULL,
        "updatedAt" timestamp with time zone NOT NULL
      );

### Generating keys

1. Edit the DB credentials in the config/config.js file
2. Run the key generation script
      ```
      node scripts/master.js
      ```

 * This will add the following
     * Encrypted RSA keys to the DB
     * Encrypted RSA keys in a file(./keys/keys.json)
     * Protected zip of unencrypted keys (./keys/keys.zip)


### Running the service

```
node app.js
```

 This will start the encryption service on port 8013


## Apis
### Encrypt
    ```
    curl -X POST -H "Content-Type: application/json" -d '{
      "value":"sunbird"
    }' "http://localhost:8013/encrypt"
    ```
    
    ```
    curl -X POST -H "Content-Type: application/json" -d '{
        "value": { "name": "Ramesh Kumar", "phone": "9901990101" }
    }' "http://localhost:8013/encrypt/obj"

### Decrypt

    ```
    curl -X POST -H "Content-Type: application/json" -d '{
      "value":"v1|62|DL6oW2QemDz/qmPcqP+mjD5x6Y6d2GGYkfeUHqyk9qazJ5O7Ep4bH06VX0D3iqQjckESFMXlE9nBDcy93JFVNw=="
    }' "http://localhost:8013/decrypt"
    ```

    ```
    curl -X POST -H "Content-Type: application/json" -d '{
      "value": { "name": "v1|62|DL6oW2QemDz/qmPcqP+mjD5x6Y6d2GGYkfeUHqyk9qazJ5O7Ep4bH06VX0D3iqQjckESFMXlE9nBDcy93JFVNw==",
                 "phone": "v1|77|DL6oW2QemDz/qmPcqP+mjD5x6Y6d2GGYkfeUHqyk9qazJ5O7Ep4bH06VX0D3iqQjckESFMXlE9nBDcy93JFVNw=="}
    }' "http://localhost:8013/decrypt/obj"
 
