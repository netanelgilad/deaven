"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sleep = sleep;

async function sleep(timeout) {
  await new Promise(resolve => setTimeout(resolve, timeout));
}