/// <reference types="node" />

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
  TESNumber,
  ESNumber,
  ESNull
} from "./types";
import { evaluate, evaluateThrowableIterator } from "./evaluate";
import {
  BinaryOperatorResolvers,
  LogicalOperatorResolvers,
  UnaryOperatorResolvers
} from "./operators";
import {
  TExecutionContext,
  setCurrentThisValue,
  setVariableInScope,
  ExecutionContext
} from "./execution-context/ExecutionContext";
import { createFunction } from "./Function/Function";
import { isNull } from "util";
import { unsafeCast } from "@deaven/unsafe-cast.macro";
import { ESObject, createNewObjectFromConstructor } from "./Object";
import { coerceToBoolean, ESBoolean } from "./boolean/ESBoolean";
import { tuple } from "@deaven/tuple";
import assert from "assert";
import { unimplemented } from "@deaven/unimplemented";
import { ESTree } from "cherow";

export type ASTResolver<TAST extends ESTree.Node, T extends Any> = (
  ast: TAST,
  prevContext: TExecutionContext
) => Iterator<[T | ControlFlowResult, TExecutionContext]>;

export const noExecutionContextResolver = <
  TAST extends ESTree.Node,
  T extends Any
>(
  fn: (ast: TAST, execContext: TExecutionContext) => T
) =>
  function*(ast: TAST, execContext: TExecutionContext) {
    return tuple(fn(ast, execContext), execContext);
  };

export const statementResolver = <TStatement extends ESTree.Statement>(
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
  ESTree.Identifier,
  Any
> = noExecutionContextResolver((ast, execContext) => {
  const resolvedFromScope = execContext.value.scope[ast.name];
  return (
    resolvedFromScope ||
    execContext.value.global.properties[ast.name] ||
    Undefined
  );
});

export const LiteralResolver: ASTResolver<
  ESTree.Literal,
  Any
> = noExecutionContextResolver(ast => {
  if (typeof ast.value === "string") {
    return ESString(ast.value);
  } else if (typeof ast.value === "number") {
    return ESNumber(ast.value);
  } else if (typeof ast.value === "boolean") {
    return ESBoolean(ast.value);
  } else if (ast.value === null) {
    return ESNull;
  }

  return unimplemented();
});

export const MemberExpressionResolver: ASTResolver<
  ESTree.MemberExpression,
  Any
> = function*(ast, execContext) {
  const [objectType, newExecContext] = yield evaluate(ast.object, execContext);
  const propertyType = unsafeCast<WithProperties>(objectType).properties[
    unsafeCast<ESTree.Identifier>(ast.property).name
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
  ESTree.CallExpression,
  Any
> = function*(ast, execContext) {
  let [calleeType, newExecContext] = yield evaluate(ast.callee, execContext);

  let currExecContext = newExecContext;
  let argsTypes: Any[] = [];

  for (const argAST of ast.arguments) {
    const [argType, newExecContext] = yield evaluate(argAST, currExecContext);
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
  ESTree.BinaryExpression,
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

// export const FileResolver: ASTResolver<File, Any> = (ast, execContext) => {
//   return ProgramResolver(ast.program, execContext);
// };

export const ProgramResolver: ASTResolver<ESTree.Program, Any> = function*(
  ast,
  execContext
) {
  const programFunction = createFunction(
    unsafeCast<ESTree.Statement[]>(ast.body),
    []
  );
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
        stderr: unsafeCast<TESString>(resultAsString).value
      })
    );
  }

  return tuple(Undefined, currentEvaluationResult[1]);
};

export const BlockStatementResolver = statementResolver<ESTree.BlockStatement>(
  function*(ast, execContext) {
    let currExecContext = execContext;
    for (const statement of ast.body) {
      [, currExecContext] = yield evaluate(statement, currExecContext);
    }

    return tuple(Undefined, currExecContext);
  }
);

export const AssignmentExpressionResolver: ASTResolver<
  ESTree.AssignmentExpression,
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
      unsafeCast<ESTree.Identifier>(ast.left.property).name
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
        unsafeCast<ESTree.Identifier>(ast.left).name,
        rightType
      )
    );
  }
};

export const ReturnStatementResolver = statementResolver<
  ESTree.ReturnStatement
>(function*(statement, execContext) {
  if (isNull(statement.argument)) {
    return tuple(ReturnValue(Undefined), execContext);
  }
  const [argType, afterArgExecContext] = yield evaluate(
    statement.argument,
    execContext
  );
  return tuple(ReturnValue(argType), afterArgExecContext);
});

export const ThisExpressionResolver: ASTResolver<
  ESTree.ThisExpression,
  Any
> = function*(_ast, execContext) {
  return tuple(execContext.value.thisValue, execContext);
};

export const ObjectExpressionResolver: ASTResolver<
  ESTree.ObjectExpression,
  Any
> = function*(ast, execContext) {
  let obj = {};
  let currExecContext = execContext;
  for (const property of ast.properties) {
    let propValueType;
    if (property.type === "Property") {
      if (property.shorthand) {
        [propValueType, currExecContext] = yield evaluate(
          property.key,
          currExecContext
        );
      } else {
        [propValueType, currExecContext] = yield evaluate(
          unsafeCast<ESTree.Node>(property.value),
          currExecContext
        );
      }
    }

    obj = {
      ...obj,
      [unsafeCast<ESTree.Identifier>(unsafeCast<ESTree.Property>(property).key)
        .name]: propValueType
    };
  }

  return tuple(ESObject(obj), currExecContext);
};

export const FunctionExpressionResolver: ASTResolver<
  ESTree.FunctionExpression,
  FunctionBinding
> = function*(ast, execContext) {
  const functionType = createFunction(ast.body.body, ast.params);

  return tuple(
    functionType,
    ast.id
      ? setVariableInScope(
          execContext,
          unsafeCast<ESTree.Identifier>(ast.id).name,
          functionType
        )
      : execContext
  );
};

export const ExpressionStatementResolver = statementResolver<
  ESTree.ExpressionStatement
>(function*(statement, execContext) {
  const result = yield evaluate(statement.expression, execContext);
  return tuple(Undefined, result[1]);
});

export const VariableDeclarationResolver = statementResolver<
  ESTree.VariableDeclaration
>(function*(statement, execContext) {
  let currExecContext = execContext;
  for (const declaration of statement.declarations) {
    if (declaration.init) {
      const initResult = yield evaluate(declaration.init, currExecContext);
      currExecContext = setVariableInScope(
        initResult[1],
        unsafeCast<ESTree.Identifier>(declaration.id).name,
        initResult[0]
      );
    } else {
      currExecContext = setVariableInScope(
        currExecContext,
        unsafeCast<ESTree.Identifier>(declaration.id).name,
        Undefined
      );
    }
  }
  return tuple(Undefined, currExecContext);
});

export const FunctionDeclarationResolver = statementResolver<
  ESTree.FunctionDeclaration
>(function*(statement, execContext) {
  return tuple(
    Undefined,
    setVariableInScope(
      execContext,
      unsafeCast<ESTree.Identifier>(statement.id).name,
      createFunction(statement.body.body, statement.params)
    )
  );
});

export const IfStatementResolver = statementResolver<ESTree.IfStatement>(
  function*(statement, prevContext) {
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
    } else if (testTypeAsBoolean.value === false) {
      if (statement.alternate) {
        const [, consequentExecContext] = yield evaluate(
          statement.alternate,
          afterTestExecContext
        );
        return tuple(Undefined, consequentExecContext);
      }

      return tuple(Undefined, afterTestExecContext);
    }

    return unimplemented();
  }
);

export const EmptyStatementResolver = statementResolver<ESTree.EmptyStatement>(
  function*(_, execContext) {
    return tuple(Undefined, execContext);
  }
);

export const NewExpressionResolver: ASTResolver<
  ESTree.NewExpression,
  Any
> = function*(expression, execContext) {
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

  return yield* createNewObjectFromConstructor(
    unsafeCast<FunctionBinding>(calleeType),
    argsTypes,
    currExecContext
  );
};

export const LogicalExpressionResolver: ASTResolver<
  ESTree.LogicalExpression,
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

export const TryStatementResolver = statementResolver<ESTree.TryStatement>(
  function*(statement, execContext) {
    const tryBlockEvaluationResult = evaluate(statement.block, execContext);
    if (isThrownValue(tryBlockEvaluationResult[0])) {
      const preCatchHandlerExecContext = setVariableInScope(
        tryBlockEvaluationResult[1],
        unsafeCast<ESTree.Identifier>(
          unsafeCast<ESTree.CatchClause>(statement.handler).param
        ).name,
        tryBlockEvaluationResult[0].value
      );
      return evaluate(
        unsafeCast<ESTree.CatchClause>(statement.handler).body,
        preCatchHandlerExecContext
      );
    }

    return tryBlockEvaluationResult;
  }
);

export const ThrowStatementResolver = statementResolver<ESTree.ThrowStatement>(
  function*(statement, execContext) {
    const [argType, afterArgExecContext] = yield evaluate(
      statement.argument,
      execContext
    );
    return tuple(ThrownValue(argType), afterArgExecContext);
  }
);

export const DoWhileStatementResolver = statementResolver<
  ESTree.DoWhileStatement
>(function*(_statement, execContext) {
  return tuple(Undefined, execContext);
});

export const UpdateExpressionResolver: ASTResolver<
  ESTree.UpdateExpression,
  TESNumber
> = function*(expression, execContext) {
  if (expression.argument.type === "Identifier") {
    const [argType, afterArgExecContext] = yield evaluate(
      expression.argument,
      execContext
    );

    let argTypeAfterUpdate: TESNumber;
    if (expression.operator === "++") {
      argTypeAfterUpdate = ESNumber(
        unsafeCast<number>(unsafeCast<TESNumber>(argType).value) + 1
      );
    } else {
      return unimplemented();
    }

    const afterUpdateExecContext = setVariableInScope(
      afterArgExecContext,
      expression.argument.name,
      argTypeAfterUpdate
    );

    return tuple(argTypeAfterUpdate, afterUpdateExecContext);
  }

  return unimplemented();
};

export const UnaryExpressionResolver: ASTResolver<
  ESTree.UnaryExpression,
  Any
> = function*(expression, execContext) {
  const [argType, afterArgExecContext] = yield evaluate(
    expression.argument,
    execContext
  );
  const unaryOperatorResolver = UnaryOperatorResolvers.get(expression.operator);
  assert(
    unaryOperatorResolver,
    `Unary operator resolver for ${
      expression.operator
    } hasn't been implemented yet`
  );
  return unaryOperatorResolver!(argType, afterArgExecContext);
};

export const ASTResolvers = new Map<string, ASTResolver<any, any>>([
  ["Literal", LiteralResolver],
  ["Identifier", IdentifierResolver],
  ["MemberExpression", MemberExpressionResolver],
  ["CallExpression", CallExpressionResolver],
  ["BinaryExpression", BinaryExpressionResolver],
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
  ["ThrowStatement", ThrowStatementResolver],
  ["DoWhileStatement", DoWhileStatementResolver],
  ["UpdateExpression", UpdateExpressionResolver],
  ["UnaryExpression", UnaryExpressionResolver]
]);
