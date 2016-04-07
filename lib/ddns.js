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

class DDNS extends EventEmitter {
    constructor(cfg) {
        super();

        if(!(cfg instanceof ConfigSchema) || !cfg.check()) {
            throw new Error("Broken config schema.");
        }

        this.cfg = cfg;
        this.token = cfg.token;
        this.domainId = null;
        this.subdomains = cfg.subdomains;
        this.ipGetter = cfg.ipGetter;

        this.started = false;
    }

    initialize(callback) {
        // 获取域名 ID
        spidex.post(`${BASE_URI}/Domain.List`, {
            timeout: 60000,
            charset: "utf8",
            data: {
                "login_token": this.token,
                format: "json",
                lang: this.cfg.remoteLang,
                "error_on_empty": "no",

                type: "mine",
                keyword: this.cfg.domain
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

    start() {
        if(this.started) return;
        this.started = true;
        process.nextTick(this.interval.bind(this));
    }

    interval() {
        this.emit("round");

        const self = this;
        const getIP = this.ipGetter;
        async.waterfall([
            callback => {
                self.emit("detecting");
                getIP((err, ip) => {
                    if(err) return callback(err);
                    self.emit("detected", ip);
                    return callback(undefined, ip);
                });
            },

            (ip, callback) => this.fetchSpecifiedRecord(this.subdomains, (err, records) => {
                callback(err, records, ip);
            }),

            (records, ip, callback) => {
                if(!records.length) {
                    self.emit("warn", new Error("No available subdomains."));
                    return callback();
                }

                const scarlet = new Scarlet(10);

                let processor = function(TO) {
                    const record = TO.task;
                    if(record.ip === ip) {
                        self.emit("equal", record, ip);
                        return scarlet.taskDone(TO);
                    }

                    self.emit("changing", record, ip);
                    record.ip = ip;
                    record.save(err => {
                        if(err) {
                            self.emit("saveError", err, record);
                        }

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
                self.emit("error", err);
            }

            self.emit("roundEnd");
            setTimeout(self.interval.bind(self), self.cfg.interval);
        });
    }
}

module.exports = DDNS;
