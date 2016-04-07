/**
 * XadillaX created at 2016-04-07 10:22:28 With ♥
 *
 * Copyright (c) 2016 Souche.com, all rights
 * reserved.
 */
"use strict";

const spidex = require("spidex");

const BASE_URI = "https://dnsapi.cn";

/** The DNSPod record class. */
class Record {
    /**
     * Create a DDNS Record object.
     * @param {Object} raw the raw object from DNSPod remote server
     * @param {String} raw.id the record id
     * @param {String} raw.name the record name
     * @param {String} raw.type the record type
     * @param {String|Number} raw.ttl the record ttl
     * @param {String} raw.value the record IP
     * @param {String} raw.line the record line
     * @param {String} raw.mx the record MX value
     * @param {String} raw.status the record status
     * @param {Number|String} domainId the root domain ID
     * @param {String} token the token string, format as `"token_id,token"`
     */
    constructor(raw, domainId, token) {
        /** @member {String} */
        this.token = token;

        /** @member {String|Number} */
        this.domainId = domainId;
        /** @member {String} */
        this.recordId = raw.id;
        /** @member {String} */
        this.name = raw.name;
        /** @member {String} */
        this.type = raw.type;
        /** @member {String|Number} */
        this.ttl = raw.ttl;
        /** @member {String} */
        this.line = raw.line;
        /** @member {String} */
        this.mx = raw.mx;
        /** @member {String} */
        this.status = raw.status;

        /** @member {String} */
        this.ip = raw.value;
    }

    /**
     * Save this modified record
     * @param {CommonCallback} callback the callback function
     */
    save(callback) {
        spidex.post(`${BASE_URI}/Record.Modify`, {
            charset: "utf8",
            data: {
                "login_token": this.token,
                format: "json",
                lang: "en",
                "error_on_empty": "no",

                "domain_id": this.domainId,
                "record_id": this.recordId,

                "sub_domain": this.name,
                "record_type": this.type,
                "record_line": this.line,
                value: this.ip,
                mx: this.mx,
                ttl: this.ttl,
                status: this.status
            },
            timeout: 60000
        }, (content, status) => {
            if(status !== 200) {
                return callback(new Error(`Server returns a wrong status ${status}`));
            }

            let json;
            try {
                json = JSON.parse(content);
            } catch(e) {
                return callback(e);
            }

            if(!json.status) {
                return callback(new Error("Broken server content: " + content));
            }

            if(json.status.code !== "1") {
                return callback(new Error(json.status.message));
            }

            callback();
        }).on("error", callback);
    }
}

module.exports = Record;
