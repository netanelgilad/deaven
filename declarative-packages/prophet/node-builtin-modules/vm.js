"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vm = void 0;

var _ExecutionContext = require("../execution-context/ExecutionContext");

var _types = require("../types");

var _immer = _interopRequireDefault(require("immer"));

var _evaluate = require("../evaluate");

var _String = require("../string/String");

var _ESInitialGlobal = require("../execution-context/ESInitialGlobal");

var _Object = require("../Object");

var _tuple = require("@deaven/tuple");

var _SyntaxError = require("../error/SyntaxError");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const vm = {
  properties: {
    createContext: {
      parameters: [],
      function: {
        implementation: function* (_self, args, execContext) {
          return [args[0], execContext];
        }
      }
    },
    runInContext: {
      parameters: [],
      function: {
        implementation: function* (_self, args, execContext) {
          const evalExecContext = (0, _ExecutionContext.ExecutionContext)((0, _immer.default)(execContext.value, draft => {
            draft.global = (0, _Object.ESObject)({ ..._ESInitialGlobal.ESInitialGlobal.properties,
              ...args[1].properties
            });
          }));

          try {
            return (0, _evaluate.evaluateCode)(args[0].value, evalExecContext);
          } catch (err) {
            if (err instanceof SyntaxError) {
              const [syntaxError, afterErrorExecContext] = yield* (0, _Object.createNewObjectFromConstructor)(_SyntaxError.SyntaxErrorConstructor, [(0, _String.ESString)(err.stack)], evalExecContext);
              return (0, _tuple.tuple)((0, _types.ThrownValue)(syntaxError), afterErrorExecContext);
            }

            throw err;
          }
        }
      }
    }
  }
};
exports.vm = vm;