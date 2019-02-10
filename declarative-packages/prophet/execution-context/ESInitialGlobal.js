"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ESInitialGlobal = void 0;

var _Function = require("../Function/Function");

var _Math = require("../math/Math");

var _eval = require("../eval/eval");

var _String = require("../string/String");

var _Number = require("../number/Number");

var _ESBoolean = require("../boolean/ESBoolean");

var _ObjectConstructor = require("../Object/ObjectConstructor");

const ESInitialGlobal = {
  properties: {
    Math: _Math.Math,
    Function: _Function.FunctionConstructor,
    eval: _eval.evalFn,
    String: _String.StringConstructor,
    Number: _Number.NumberConstructor,
    Boolean: _ESBoolean.ESBooleanConstructor,
    Object: _ObjectConstructor.ObjectConstructor
  }
};
exports.ESInitialGlobal = ESInitialGlobal;