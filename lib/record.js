/**
 * XadillaX created at 2016-04-07 10:22:28 With ♥
 *
 * Copyright (c) 2016 Souche.com, all rights
 * reserved.
 */
"use strict";

const spidex = require("spidex");

const BASE_URI = "https://dnsapi.cn";

class Record {
    constructor(raw, domainId, token) {
        this.token = token;

        this.domainId = domainId;
        this.recordId = raw.id;
        this.name = raw.name;
        this.type = raw.type;
        this.ttl = raw.ttl;
        this.line = raw.line;
        this.mx = raw.mx;
        this.status = raw.status;

        this.ip = raw.value;
    }

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
