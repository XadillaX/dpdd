/**
 * XadillaX created at 2016-04-06 23:43:51 With ♥
 *
 * Copyright (c) 2016 Souche.com, all rights
 * reserved.
 */
"use strict";

const EventEmitter = require("events").EventEmitter;

const async = require("async");
const Scarlet = require("scarlet-task");
const spidex = require("spidex");

const ConfigSchema = require("./config_schema");
const Record = require("./record");

const BASE_URI = "https://dnsapi.cn";

/** The DNSPod dynamic domain class. */
class DDNS extends EventEmitter {
    /**
     * Create a DDNS object.
     * @param {ConfigSchema} cfg the config schema object
     */
    constructor(cfg) {
        super();

        if(!(cfg instanceof ConfigSchema) || !cfg.check()) {
            throw new Error("Broken config schema.");
        }

        /** @member {ConfigSchema} - the config schema object. */
        this.cfg = cfg;
        /** @member {String} - the token string. */
        this.token = cfg.token;
        /** @member {String|NULL} - the domain id. */
        this.domainId = null;
        /** @member {String[]} - the subdomains to be run. */
        this.subdomains = cfg.subdomains;
        /** @member {Function} - the ip getter function. */
        this.ipGetter = cfg.ipGetter;

        /** @member {Boolean} - whether this DDNS is running or not. */
        this.started = false;
    }

    /**
     * Initialize the DDNS object.
     * @param {CommonCallback} callback the callback function
     */
    initialize(callback) {
        spidex.post(`${BASE_URI}/Domain.List`, {
            timeout: 60000,
            charset: "utf8",
            data: {
                "login_token": this.token,
                format: "json",
                lang: this.cfg.remoteLang,
                "error_on_empty": "no",

                type: "mine"
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
                return callback(new Error("No target domain: " + this.cfg.domain));
            }

            for(let i = 0; i < domains.length; i++) {
                if(domains[i].name === this.cfg.domain) {
                    this.domainId = domains[i].id;
                    return callback();
                }
            }

            callback(new Error("No fit domain."));
        }).on("error", callback);
    }

    /**
     * Fetch the specified record(s).
     * @param {String[]} subdomains the subdomains' name
     * @param {RecordCallback} callback the callback function
     */
    fetchSpecifiedRecord(subdomains, callback) {
        const token = this.token;
        const domainId = this.domainId;

        // 从 API 获取记录
        spidex.post(`${BASE_URI}/Record.List`, {
            timeout: 60000,
            charset: "utf8",
            data: {
                "login_token": this.token,
                format: "json",
                lang: this.cfg.remoteLang,
                "error_on_empty": "no",

                "domain_id": this.domainId
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

            const raw = json.records;
            const records = [];
            for(let i = 0; i < raw.length; i++) {
                if(raw[i].type === "A" && subdomains.indexOf(raw[i].name) > -1) {
                    let record = new Record(raw[i], domainId, token);
                    records.push(record);
                }
            }

            callback(undefined, records);
        });
    }

    /**
     * Start running DDNS work.
     */
    start() {
        if(this.started) return;
        this.started = true;
        process.nextTick(this._interval.bind(this));
    }

    /**
     * Each DDNS round processor.
     * @protected
     *
     * @fires DDNS#changed
     * @fires DDNS#changing
     * @fires DDNS#detected
     * @fires DDNS#detecting
     * @fires DDNS#equal
     * @fires DDNS#error
     * @fires DDNS#round
     * @fires DDNS#roundEnd
     * @fires DDNS#saveError
     * @fires DDNS#warn
     */
    _interval() {
        /**
         * Fired when a new round is started.
         * @event DDNS#round
         */
        this.emit("round");

        const self = this;
        const getIP = this.ipGetter;
        async.waterfall([
            callback => {
                /**
                 * Fired when DDNS is detecting current IP.
                 * @event DDNS#detecting
                 */
                self.emit("detecting");
                getIP((err, ip) => {
                    if(err) return callback(err);
                    /**
                     * Fired when current IP was detected.
                     * @event DDNS#detected
                     * @param {String} ip the IP detected
                     */
                    self.emit("detected", ip);
                    return callback(undefined, ip);
                });
            },

            (ip, callback) => this.fetchSpecifiedRecord(this.subdomains, (err, records) => {
                callback(err, records, ip);
            }),

            (records, ip, callback) => {
                if(!records.length) {
                    /**
                     * Warning occurred.
                     * @event DDNS#warn
                     * @param {Error} err the error object
                     */
                    self.emit("warn", new Error("No available subdomains."));
                    return callback();
                }

                const scarlet = new Scarlet(10);

                let processor = function(TO) {
                    const record = TO.task;
                    if(record.ip === ip) {
                        /**
                         * Fired when a record's IP equals to the IP just detected.
                         * @event DDNS#equal
                         * @param {Record} record the record object
                         * @param {String} ip current IP
                         */
                        self.emit("equal", record, ip);
                        return scarlet.taskDone(TO);
                    }

                    /**
                     * Fired when DDNS is to change record's IP.
                     * @event DDNS#changing
                     * @param {Record} record the record object
                     * @param {String} ip current ip
                     */
                    self.emit("changing", record, ip);
                    record.ip = ip;
                    record.save(err => {
                        if(err) {
                            /**
                             * Fired when an error occurred while saving a record
                             * @event DDNS#saveError
                             * @param {Error} err the error object
                             * @param {Record} record the record object
                             */
                            self.emit("saveError", err, record);
                        }

                        /**
                         * Fired when a record just saved
                         * @event DDNS#changed
                         * @param {Record} record the record object
                         */
                        self.emit("changed", record);
                        scarlet.taskDone(TO);
                    });
                };

                for(let i = 0; i < records.length; i++) {
                    scarlet.push(records[i], processor);
                }

                scarlet.afterFinish(records.length, function() {
                    callback();
                }, false);
            }
        ], (err) => {
            if(err) {
                /**
                 * onError
                 * @event DDNS#error
                 * @param {Error} err the error object
                 */
                self.emit("error", err);
            }

            /**
             * Fired when a round is ending.
             * @event DDNS#roundEnd
             */
            self.emit("roundEnd");
            setTimeout(self._interval.bind(self), self.cfg.interval);
        });
    }
}

module.exports = DDNS;
