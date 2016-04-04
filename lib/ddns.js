/**
 * XadillaX created at 2016-04-06 23:43:51 With ♥
 *
 * Copyright (c) 2016 Souche.com, all rights
 * reserved.
 */
"use strict";

const spidex = require("spidex");

const ConfigSchema = require("./config_schema");

const BASE_URI = "https://dnsapi.cn";

class DDNS {
    constructor(cfg) {
        if(!(cfg instanceof ConfigSchema) || !cfg.check()) {
            throw new Error("Broken config schema.");
        }

        this.cfg = cfg;
        this.token = cfg.token;
        this.domain = cfg.domain.toLowerCase();
        this.subdomains = cfg.subdomains;
    }

    initialize(callback) {
        // 获取域名 ID
        spidex.post(`${BASE_URI}/Domain.List`, {
            charset: "utf8",
            data: {
                "login_token": this.token,
                format: "json",
                lang: this.cfg.remoteLang,
                "error_on_empty": "no",

                type: "mine",
                length: 100,
                keyword: this.domain
            }
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

            let domains = json.domains;
            if(!domains.length) {
                return callback(new Error("No target domain: " + this.domain));
            }

            for(let i = 0; i < domains.length; i++) {
                if(domains[i].name === this.domain) {
                    this.domainId = domains[i].id;
                    return callback();
                }
            }
        }).on("error", callback);
    }

    fetchRecord() {
    }

    start() {
    }
}

module.exports = DDNS;
