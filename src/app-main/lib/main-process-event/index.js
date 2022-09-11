"use strict"
/**
 * 主进程中的事件绑定
 */

const EventEmitter = require("events")

module.exports = { mainEvent: new EventEmitter() }
