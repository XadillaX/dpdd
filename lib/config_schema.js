/**
 * XadillaX created at 2016-04-06 23:15:51 With ♥
 *
 * Copyright (c) 2016 Souche.com, all rights
 * reserved.
 */
"use strict";

class ConfigSchema {
    constructor(token, domain, remoteLang, subdomains, ipGetter, interval) {
        this.token = token;
        this.domain = domain;
        this.subdomains = subdomains;
        this.interval = parseFloat(interval) || 30000;

        this.remoteLang = remoteLang === "en" ? "en" : "cn";
        this.ipGetter = ipGetter;
        if(typeof ipGetter !== "function") {
            ipGetter = require("./ip_getters").IP5;
        }
    }

    check() {
        if(!this.token || !this.domain) return false;
        if(!this.subdomains || !Array.isArray(this.subdomains)) return false;
        return true;
    }
}

module.exports = ConfigSchema;
