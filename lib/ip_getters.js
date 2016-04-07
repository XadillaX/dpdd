/**
 * XadillaX created at 2016-04-07 10:42:31 With ♥
 *
 * Copyright (c) 2016 Souche.com, all rights
 * reserved.
 */
/**
 * IP getter module
 * @module IpGetter
 */
"use strict";

const fJSON = require("fbbk-json");
const spidex = require("spidex");

/**
 * IP getter: Aliyun.
 * @param {IpGetterCallback} callback the callback function
 */
exports.ALIYUN = callback => {
    const url = "http://ip.aliyun.com/service/getIpInfo.php?ip=myip";
    spidex.get(url, {
        charset: "utf8",
        timeout: 60000
    }, html => {
        html = html.trim();
        let json;

        try {
            json = JSON.parse(html);
            callback(undefined, json.data.ip);
        } catch(e) {
            return callback(e);
        }
    }).on("error", callback);
};

/**
 * IP getter: CHINAZ.
 * @param {IpGetterCallback} callback the callback function
 */
exports.CHINAZ = callback => {
    const url = "http://ip.chinaz.com/getip.aspx";
    spidex.get(url, {
        charset: "utf8",
        timeout: 60000
    }, html => {
        html = html.trim();
        let json;

        try {
            json = fJSON.parse(html);
            callback(undefined, json.ip);
        } catch(e) {
            return callback(e);
        }
    }).on("error", callback);
};

/**
 * IP getter: IP138.
 * @param {IpGetterCallback} callback the callback function
 */
exports.IP138 = callback => {
    const url = "http://1111.ip138.com/ic.asp";
    spidex.get(url, {
        charset: "gbk",
        timeout: 60000
    }, html => {
        html = html.trim();
        const regex = /\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/;
        const regexResult = regex.exec(html);
        if(regexResult.length < 2) {
            return callback(new Error("Not a normal ip address."));
        }

        callback(undefined, regexResult[1]);
    }).on("error", callback);
};

/**
 * IP getter: IP5.
 * @param {IpGetterCallback} callback the callback function
 */
exports.IP5 = callback => {
    const url = "http://www.ip5.me/";
    spidex.get(url, {
        charset: "gbk",
        timeout: 60000
    }, html => {
        html = html.trim();

        const regex = /<div id="ip_addr" style="color:#191970">(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})<\/div>/;
        const regexResult = regex.exec(html);

        if(regexResult.length < 2) {
            return callback(new Error("Not a normal IP address"));
        }

        callback(undefined, regexResult[1]);
    }).on("error", callback);
};

/**
 * IP getter: QQ.
 * @param {IpGetterCallback} callback the callback function
 */
exports.QQ = callback => {
    const url = "http://ip.qq.com/";
    spidex.get(url, {
        charset: "gbk",
        timeout: 60000
    }, html => {
        html = html.trim();
        const regex = /您当前的IP为：<span class="red">(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})<\/span>/;
        const regexResult = regex.exec(html);
        if(regexResult.length < 2) {
            return callback(new Error("Not a normal ip address."));
        }

        callback(undefined, regexResult[1]);
    }).on("error", callback);
};

/**
 * IP getter: SOHU.
 * @param {IpGetterCallback} callback the callback function
 */
exports.SOHU = callback => {
    const url = "http://txt.go.sohu.com/ip/soip";
    spidex.get(url, {
        charset: "utf8",
        timeout: 60000
    }, html => {
        html = html.trim();
        const regex = /window.sohu_user_ip="(\d{1,3}\.\d{1,3}\.\d{1,3}.\d{1,3})"/;
        const regexResult = regex.exec(html);
        if(regexResult.length < 2) {
            return callback(new Error("Not a normal ip address."));
        }

        callback(undefined, regexResult[1]);
    }).on("error", callback);
};

/**
 * IP getter: SZBENDIBAO.
 * @param {IpGetterCallback} callback the callback function
 */
exports.SZBENDIBAO = callback => {
    const url = "http://sz.bendibao.com/ip/ip.asp";
    spidex.get(url, {
        charset: "gbk",
        timeout: 60000
    }, function(html) {
        html = html.trim();
        const regex = /你的电脑的公网IP地址：(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
        const regexResult = regex.exec(html);
        if(regexResult.length < 2) {
            return callback(new Error("Not a normal ip address."));
        }

        callback(undefined, regexResult[1]);
    }).on("error", callback);
};

/**
 * IP getter: TELIZE.
 * @param {IpGetterCallback} callback the callback function
 */
exports.TELIZE = callback => {
    const url = "http://www.telize.com/ip";
    spidex.get(url, {
        charset: "utf8",
        timeout: 60000
    }, html => {
        html = html.trim();
        const regex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
        if(!regex.test(html)) {
            return callback(new Error("Not a normal ip address."));
        }

        callback(undefined, html);
    }).on("error", callback);
};

/**
 * IP getter: WHATISMYIP.
 * @param {IpGetterCallback} callback the callback function
 */
exports.WHATISMYIP = callback => {
    const url = "http://www.whatismyip.com.tw/";
    spidex.get(url, {
        charset: "utf8",
        timeout: 60000
    }, html => {
        html = html.trim();
        const regex = /<h2>(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})<\/h2>/;
        const regexResult = regex.exec(html);
        if(regexResult.length < 2) {
            return callback(new Error("Not a normal ip address."));
        }

        callback(undefined, regexResult[1]);
    }).on("error", callback);
};

/**
 * IP getter: WIN7SKY.
 * @param {IpGetterCallback} callback the callback function
 */
exports.WIN7SKY = callback => {
    const url = "http://win7sky.com/ip/";
    spidex.get(url, {
        charset: "gbk",
        timeout: 60000
    }, html => {
        html = html.trim();
        const regex = /您的IP地址是：\[<font color=#FF0000>(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})<\/font>\]/;
        const regexResult = regex.exec(html);
        if(regexResult.length < 2) {
            return callback(new Error("Not a normal ip address."));
        }

        callback(undefined, regexResult[1]);
    }).on("error", callback);
};
