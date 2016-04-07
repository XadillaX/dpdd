/**
 * XadillaX created at 2016-04-06 23:15:51 With ♥
 *
 * Copyright (c) 2016 Souche.com, all rights
 * reserved.
 */
"use strict";

/** DDNS config schema class. */
class ConfigSchema {
    /**
     * Create a ConfigSchema object.
     * @param {String} token the token for DNSPod, format as `"token_id,token"`
     * @param {String} domain the domain to be used
     * @param {String} remoteLang the remote server language [cn|en]
     * @param {Array} subdomains the subdomains to be used
     * @param {Function} ipGetter the function to get current IP
     * @param {Number} interval the interval to run the round
     */
    constructor(token, domain, remoteLang, subdomains, ipGetter, interval) {
        /** @member {String} */
        this.token = token;
        /** @member {String} */
        this.domain = domain;
        /** @member {Array} */
        this.subdomains = subdomains;
        /** @member {Number} */
        this.interval = parseFloat(interval) || 30000;

        /** @member {String} */
        this.remoteLang = remoteLang === "en" ? "en" : "cn";
        /** @member {Function} */
        this.ipGetter = ipGetter;
        if(typeof ipGetter !== "function") {
            ipGetter = require("./ip_getters").IP5;
        }
    }

    /**
     * check the config schema.
     * @return {Boolean} whether the config is available
     */
    check() {
        if(!this.token || !this.domain) return false;
        if(!this.subdomains || !Array.isArray(this.subdomains)) return false;
        return true;
    }
}

module.exports = ConfigSchema;
