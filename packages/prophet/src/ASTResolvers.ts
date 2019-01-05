import {
  Node,
  Identifier,
  StringLiteral,
  NumericLiteral,
  MemberExpression,
  CallExpression,
  BinaryExpression,
  File,
  Program,
  AssignmentExpression,
  BlockStatement,
  ReturnStatement,
  ThisExpression,
  ObjectExpression,
  ObjectMember,
  FunctionExpression,
  ObjectMethod,
  BooleanLiteral,
  Statement,
  FunctionDeclaration,
  IfStatement,
  EmptyStatement,
  ExpressionStatement,
  VariableDeclaration,
  NewExpression,
  LogicalExpression,
  TryStatement,
  ThrowStatement
} from "@babel/types";
import { ESString, TESString } from "./string/String";
import {
  WithProperties,
  isFunction,
  Any,
  Undefined,
  FunctionBinding,
  isThrownValue,
  ReturnValue,
  EvaluationResult,
  ControlFlowResult,
  ThrownValue,
  TESUndefined
} from "./types";
import { evaluate, evaluateThrowableIterator } from "./evaluate";
import { BinaryOperatorResolvers, LogicalOperatorResolvers } from "./operators";
import {
  TExecutionContext,
  setCurrentThisValue,
  setVariableInScope,
  ExecutionContext
} from "./execution-context/ExecutionContext";
import { createFunction } from "./Function/Function";
import { isNull } from "util";
import { unsafeCast } from "./unsafeGet";
import { TESObject, ESObject } from "./Object";
import { coerceToBoolean } from "./boolean/ESBoolean";
import { tuple } from "@deaven/tuple";
import assert = require("assert");

export type ASTResolver<TAST extends Node, T extends Any> = (
  ast: TAST,
  prevContext: TExecutionContext
) => Iterator<[T | ControlFlowResult, TExecutionContext]>;

export const noExecutionContextResolver = <TAST extends Node, T extends Any>(
  fn: (ast: TAST, execContext: TExecutionContext) => T
) =>
  function*(ast: TAST, execContext: TExecutionContext) {
    return tuple(fn(ast, execContext), execContext);
  };

export const statementResolver = <TStatement extends Statement>(
  fn: (
    ast: TStatement,
    execContext: TExecutionContext
  ) => IterableIterator<[EvaluationResult, TExecutionContext]>
) =>
  function*(ast: TStatement, execContext: TExecutionContext) {
    const resultIter = fn(ast, execContext);

    return evaluateThrowableIterator(resultIter);
  };

export const IdentifierResolver: ASTResolver<
  Identifier,
  Any
> = noExecutionContextResolver((ast, execContext) => {
  const resolvedFromScope = execContext.value.scope[ast.name];
  return (
    resolvedFromScope ||
    execContext.value.global.properties[ast.name] ||
    Undefined
  );
});

export const StringLiteralResolver: ASTResolver<
  StringLiteral,
  TESString
> = noExecutionContextResolver(ast => ESString(ast.value));

export const NumericLiteralResolver: ASTResolver<
  NumericLiteral,
  { number: number }
> = noExecutionContextResolver(ast => ({
  number: ast.value
}));

export const MemberExpressionResolver: ASTResolver<
  MemberExpression,
  Any
> = function*(ast, execContext) {
  const [objectType, newExecContext] = yield evaluate(ast.object, execContext);
  const propertyType = unsafeCast<WithProperties>(objectType).properties[
    ast.property.name
  ];
  if (isFunction(propertyType)) {
    return tuple(
      {
        self: objectType,
        function: propertyType
      },
      newExecContext
    );
  } else {
    return tuple(propertyType, newExecContext);
  }
};

export const CallExpressionResolver: ASTResolver<
  CallExpression,
  Any
> = function*(ast, execContext) {
  let [calleeType, newExecContext] = yield evaluate(ast.callee, execContext);

  let currExecContext = newExecContext;
  let argsTypes: Any[] = [];

  for (const argAST of ast.arguments) {
    const [argType, newExecContext] = yield evaluate(argAST, execContext);
    argsTypes = [...argsTypes, argType];
    currExecContext = newExecContext;
  }

  currExecContext = setCurrentThisValue(
    currExecContext,
    unsafeCast<FunctionBinding>(calleeType).self || currExecContext.value.global
  );

  return yield* unsafeCast<FunctionBinding>(calleeType).function.implementation(
    unsafeCast<FunctionBinding>(calleeType).self ||
      currExecContext.value.global,
    argsTypes,
    currExecContext
  );
};

export const BinaryExpressionResolver: ASTResolver<
  BinaryExpression,
  any | TESString
> = function*(ast, execContext) {
  const [leftType, leftExecContext] = yield evaluate(ast.left, execContext);
  const [rightType, rightExecContext] = yield evaluate(
    ast.right,
    leftExecContext
  );
  const binaryOperatorResolver = BinaryOperatorResolvers.get(ast.operator);
  assert(
    binaryOperatorResolver,
    `Binary operator resolver for ${ast.operator} hasn't been implemented yet`
  );
  return tuple(binaryOperatorResolver!(leftType, rightType), rightExecContext);
};

export const FileResolver: ASTResolver<File, Any> = (ast, execContext) => {
  return ProgramResolver(ast.program, execContext);
};

export const ProgramResolver: ASTResolver<Program, Any> = function*(
  ast,
  execContext
) {
  const programFunction = createFunction(ast.body, []);
  const programIter = programFunction.function.implementation(
    execContext.value.global,
    [],
    execContext
  );

  const currentEvaluationResult = evaluateThrowableIterator(programIter);

  if (isThrownValue(currentEvaluationResult[0])) {
    const [resultAsString, resultExecContext] = yield* unsafeCast<
      FunctionBinding
    >(
      unsafeCast<WithProperties>(currentEvaluationResult[0].value).properties[
        "toString"
      ]
    ).function.implementation(
      currentEvaluationResult[0].value,
      [],
      currentEvaluationResult[1]
    );
    return tuple(
      Undefined,
      ExecutionContext({
        ...resultExecContext.value,
        stdout: unsafeCast<TESString>(resultAsString).value
      })
    );
  }

  return tuple(Undefined, currentEvaluationResult[1]);
};

export const BlockStatementResolver = statementResolver<BlockStatement>(
  function*(ast, execContext) {
    let currExecContext = execContext;
    for (const statement of ast.body) {
      [, currExecContext] = yield evaluate(statement, currExecContext);
    }

    return tuple(Undefined, currExecContext);
  }
);

export const AssignmentExpressionResolver: ASTResolver<
  AssignmentExpression,
  Any
> = function*(ast, execContext) {
  if (ast.left.type === "MemberExpression") {
    const [objectType, afterLeftExecContext] = yield evaluate(
      ast.left.object,
      execContext
    );
    const [rightType, afterRightExecContext] = yield evaluate(
      ast.right,
      afterLeftExecContext
    );
    unsafeCast<WithProperties>(objectType).properties[
      ast.left.property.name
    ] = rightType;
    return tuple(rightType, afterRightExecContext);
  } else {
    const [rightType, afterRightExecContext] = yield evaluate(
      ast.right,
      execContext
    );
    return tuple(
      rightType,
      setVariableInScope(
        afterRightExecContext,
        unsafeCast<Identifier>(ast.left).name,
        rightType
      )
    );
  }
};

export const ReturnStatementResolver = statementResolver<ReturnStatement>(
  function*(statement, execContext) {
    if (isNull(statement.argument)) {
      return tuple(ReturnValue(Undefined), execContext);
    }
    const [argType, afterArgExecContext] = yield evaluate(
      statement.argument,
      execContext
    );
    return tuple(ReturnValue(argType), afterArgExecContext);
  }
);

export const ThisExpressionResolver: ASTResolver<
  ThisExpression,
  Any
> = function*(_ast, execContext) {
  return tuple(execContext.value.thisValue, execContext);
};

export const ObjectExpressionResolver: ASTResolver<
  ObjectExpression,
  Any
> = function*(ast, execContext) {
  let obj = {};
  let currExecContext = execContext;
  for (const property of ast.properties) {
    let propValueType;
    if (property.type === "ObjectProperty") {
      if (property.shorthand) {
        [propValueType, currExecContext] = yield evaluate(
          property.key,
          currExecContext
        );
      } else {
        [propValueType, currExecContext] = yield evaluate(
          property.value,
          currExecContext
        );
      }
    } else {
      propValueType = createFunction(
        unsafeCast<ObjectMethod>(property).body.body,
        unsafeCast<ObjectMethod>(property).params
      );
    }

    obj = {
      ...obj,
      [unsafeCast<ObjectMember>(property).key.name]: propValueType
    };
  }

  return tuple(ESObject(obj), currExecContext);
};

export const FunctionExpressionResolver: ASTResolver<
  FunctionExpression,
  FunctionBinding
> = function*(ast, execContext) {
  return tuple(createFunction(ast.body.body, ast.params), execContext);
};

export const BooleanLiteralResolver: ASTResolver<
  BooleanLiteral,
  typeof Undefined
> = function*(ast, execContext) {
  return tuple(Undefined, execContext);
};

export const ExpressionStatementResolver = statementResolver<
  ExpressionStatement
>(function*(statement, execContext) {
  const result = yield evaluate(statement.expression, execContext);
  return tuple(Undefined, result[1]);
});

export const VariableDeclarationResolver = statementResolver<
  VariableDeclaration
>(function*(statement, execContext) {
  let currExecContext = execContext;
  for (const declaration of statement.declarations) {
    if (declaration.init) {
      const initResult = yield evaluate(declaration.init, currExecContext);
      currExecContext = setVariableInScope(
        initResult[1],
        unsafeCast<Identifier>(declaration.id).name,
        initResult[0]
      );
    } else {
      currExecContext = setVariableInScope(
        currExecContext,
        unsafeCast<Identifier>(declaration.id).name,
        Undefined
      );
    }
  }
  return tuple(Undefined, currExecContext);
});

export const FunctionDeclarationResolver = statementResolver<
  FunctionDeclaration
>(function*(statement, execContext) {
  return tuple(
    Undefined,
    setVariableInScope(
      execContext,
      unsafeCast<Identifier>(statement.id).name,
      createFunction(statement.body.body, statement.params)
    )
  );
});

export const IfStatementResolver = statementResolver<IfStatement>(function*(
  statement,
  prevContext
) {
  const [testType, afterTestExecContext] = yield evaluate(
    statement.test,
    prevContext
  );
  const testTypeAsBoolean = coerceToBoolean(testType);

  if (testTypeAsBoolean.value === true) {
    const [, consequentExecContext] = yield evaluate(
      statement.consequent,
      afterTestExecContext
    );
    return tuple(Undefined, consequentExecContext);
  }

  return tuple(Undefined, afterTestExecContext);
});

export const EmptyStatementResolver = statementResolver<EmptyStatement>(
  function*(_, execContext) {
    return tuple(Undefined, execContext);
  }
);

export const NewExpressionResolver: ASTResolver<NewExpression, Any> = function*(
  expression,
  execContext
) {
  const thisValue = ESObject({});

  let [calleeType, newExecContext] = yield evaluate(
    expression.callee,
    execContext
  );

  let currExecContext = newExecContext;
  let argsTypes: Any[] = [];

  for (const argAST of expression.arguments) {
    const [argType, newExecContext] = yield evaluate(argAST, execContext);
    argsTypes = [...argsTypes, argType];
    currExecContext = newExecContext;
  }

  currExecContext = setCurrentThisValue(currExecContext, thisValue);

  const [, afterCallExecContext] = evaluateThrowableIterator(
    unsafeCast<FunctionBinding>(calleeType).function.implementation(
      unsafeCast<FunctionBinding>(calleeType).self ||
        currExecContext.value.global,
      argsTypes,
      currExecContext
    )
  );

  return tuple(
    ESObject({
      ...unsafeCast<TESObject>(
        unsafeCast<FunctionBinding>(calleeType).properties.prototype
      ).properties,
      ...unsafeCast<TESObject>(afterCallExecContext.value.thisValue).value
    }),
    afterCallExecContext
  );
};

export const LogicalExpressionResolver: ASTResolver<
  LogicalExpression,
  Any
> = function*(expression, execContext) {
  const logicalOperatorResolver = LogicalOperatorResolvers.get(
    expression.operator
  );
  assert(
    logicalOperatorResolver,
    `Logical operator for ${expression.operator} has not been implemented yet`
  );
  return yield* logicalOperatorResolver!(
    expression.left,
    expression.right,
    execContext
  );
};

export const TryStatementResolver = statementResolver<TryStatement>(function*(
  statement,
  execContext
) {
  return evaluate(statement.block, execContext);
});

export const ThrowStatementResolver = statementResolver<ThrowStatement>(
  function*(statement, execContext) {
    const [argType, afterArgExecContext] = yield evaluate(
      statement.argument,
      execContext
    );
    return tuple(ThrownValue(argType), afterArgExecContext);
  }
);

export const ASTResolvers = new Map<string, ASTResolver<any, any>>([
  ["StringLiteral", StringLiteralResolver],
  ["NumericLiteral", NumericLiteralResolver],
  ["BooleanLiteral", BooleanLiteralResolver],
  ["Identifier", IdentifierResolver],
  ["MemberExpression", MemberExpressionResolver],
  ["CallExpression", CallExpressionResolver],
  ["BinaryExpression", BinaryExpressionResolver],
  ["File", FileResolver],
  ["Program", ProgramResolver],
  ["AssignmentExpression", AssignmentExpressionResolver],
  ["ReturnStatement", ReturnStatementResolver],
  ["ThisExpression", ThisExpressionResolver],
  ["ObjectExpression", ObjectExpressionResolver],
  ["FunctionExpression", FunctionExpressionResolver],
  ["ExpressionStatement", ExpressionStatementResolver],
  ["VariableDeclaration", VariableDeclarationResolver],
  ["FunctionDeclaration", FunctionDeclarationResolver],
  ["IfStatement", IfStatementResolver],
  ["EmptyStatement", EmptyStatementResolver],
  ["BlockStatement", BlockStatementResolver],
  ["NewExpression", NewExpressionResolver],
  ["LogicalExpression", LogicalExpressionResolver],
  ["TryStatement", TryStatementResolver],
  ["ThrowStatement", ThrowStatementResolver]
]);
