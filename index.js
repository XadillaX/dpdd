/**
 * XadillaX created at 2016-04-07 13:26:14 With ♥
 *
 * Copyright (c) 2016 Souche.com, all rights
 * reserved.
 */
/**
 * dpdd module.
 * @module ddns
 */
"use strict";

/**
 * @member {Class} - The ConfigSchema class.
 * @see ConfigSchema
 */
exports.ConfigSchema = require("./lib/config_schema");

/**
 * @member {Class} - the DDNS class.
 * @see DDNS
 */
exports.DDNS = require("./lib/ddns");

/**
 * @member {Object.<Function>} - the IP getters.
 * @see module:IpGetter
 */
exports.IpGetter = require("./lib/ip_getters");

/**
 * @member {Class} - the Record class.
 * @see Record
 */
exports.Record = require("./lib/record");
