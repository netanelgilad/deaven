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
  callExpression,
  LogicalExpression
} from "@babel/types";
import { String, TString } from "./string/String";
import {
  WithProperties,
  isFunction,
  Type,
  Undefined,
  GreaterThanEquals,
  NumberLiteral,
  FunctionBinding,
  Function,
  isThrownValue
} from "./types";
import { evaluate, evaluateThrowableIterator } from "./evaluate";
import { greaterThanEquals, plus } from "./operators";
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

export type ASTResolver<TAST extends Node, T extends Type> = (
  ast: TAST,
  prevContext: TExecutionContext
) => Iterator<[T, TExecutionContext]>;

export const noExecutionContextResolver = <TAST extends Node, T extends Type>(
  fn: (ast: TAST, execContext: TExecutionContext) => T
) =>
  function*(ast: TAST, execContext: TExecutionContext) {
    return [fn(ast, execContext), execContext] as [T, TExecutionContext];
  };

export const statementResolver = <TStatement extends Statement>(
  fn: (
    ast: TStatement,
    execContext: TExecutionContext
  ) => IterableIterator<[Type, TExecutionContext]>
) =>
  function*(ast: TStatement, execContext: TExecutionContext) {
    const resultIter = fn(ast, execContext);

    let currentEvaluationResult = resultIter.next();
    while (
      !isThrownValue(currentEvaluationResult.value[0]) &&
      !currentEvaluationResult.done
    ) {
      currentEvaluationResult = resultIter.next(currentEvaluationResult.value);
    }

    return currentEvaluationResult.value;
  };

export const IdentifierResolver: ASTResolver<
  Identifier,
  Type
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
  TString
> = noExecutionContextResolver(ast => String(ast.value));

export const NumericLiteralResolver: ASTResolver<
  NumericLiteral,
  { number: number }
> = noExecutionContextResolver(ast => ({
  number: ast.value
}));

export const MemberExpressionResolver: ASTResolver<
  MemberExpression,
  Type
> = function*(ast, execContext) {
  const [objectType, newExecContext] = yield evaluate(ast.object, execContext);
  const propertyType = (objectType as WithProperties).properties[
    ast.property.name
  ];
  if (isFunction(propertyType)) {
    return [
      {
        self: objectType,
        function: propertyType
      },
      newExecContext
    ] as [Type, TExecutionContext];
  } else {
    return [propertyType, newExecContext] as [Type, TExecutionContext];
  }
};

export const CallExpressionResolver: ASTResolver<
  CallExpression,
  Type
> = function*(ast, execContext) {
  let [calleeType, newExecContext] = yield evaluate(ast.callee, execContext);

  let currExecContext = newExecContext;
  let argsTypes: Type[] = [];

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
  any | TString
> = function*(ast, execContext) {
  const [leftType, leftExecContext] = yield evaluate(ast.left, execContext);
  const [rightType, rightExecContext] = yield evaluate(
    ast.right,
    leftExecContext
  );
  if (ast.operator === ">") {
    return [
      greaterThanEquals(
        unsafeCast<GreaterThanEquals>(leftType),
        unsafeCast<NumberLiteral>(rightType)
      ),
      rightExecContext
    ] as [Type, TExecutionContext];
  } else {
    return [plus(leftType, rightType), rightExecContext] as [
      Type,
      TExecutionContext
    ];
  }
};

export const FileResolver: ASTResolver<File, typeof Undefined> = (
  ast,
  execContext
) => {
  return ProgramResolver(ast.program, execContext);
};

export const ProgramResolver: ASTResolver<
  Program,
  typeof Undefined
> = function*(ast, execContext) {
  const programFunction = createFunction(ast.body, []);
  const programIter = programFunction.function.implementation(
    execContext.value.global,
    [],
    execContext
  );

  let currentEvaluationResult = programIter.next();
  while (
    !isThrownValue(currentEvaluationResult.value[0]) &&
    !currentEvaluationResult.done
  ) {
    currentEvaluationResult = programIter.next(currentEvaluationResult.value);
  }

  if (isThrownValue(currentEvaluationResult.value[0])) {
    const [resultAsString, resultExecContext] = yield* unsafeCast<
      FunctionBinding
    >(
      unsafeCast<WithProperties>(currentEvaluationResult.value[0].value)
        .properties["toString"]
    ).function.implementation(
      currentEvaluationResult.value[0].value,
      [],
      currentEvaluationResult.value[1]
    );
    return [
      Undefined,
      ExecutionContext({
        ...resultExecContext.value,
        stdout: unsafeCast<TString>(resultAsString).value
      })
    ] as [typeof Undefined, TExecutionContext];
  }

  return [Undefined, currentEvaluationResult.value[1]] as [
    typeof Undefined,
    TExecutionContext
  ];
};

export const BlockStatementResolver = statementResolver<BlockStatement>(
  function*(ast, execContext) {
    let currExecContext = execContext;
    for (const statement of ast.body) {
      [, currExecContext] = yield evaluate(statement, currExecContext);
    }

    return [Undefined, currExecContext] as [
      typeof Undefined,
      TExecutionContext
    ];
  }
);

export const AssignmentExpressionResolver: ASTResolver<
  AssignmentExpression,
  Type
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
    return [rightType, afterRightExecContext] as [Type, TExecutionContext];
  } else {
    const [rightType, afterRightExecContext] = yield evaluate(
      ast.right,
      execContext
    );
    return [
      rightType,
      setVariableInScope(
        afterRightExecContext,
        unsafeCast<Identifier>(ast.left).name,
        rightType
      )
    ] as [Type, TExecutionContext];
  }
};

export const ReturnStatementResolver: ASTResolver<
  ReturnStatement,
  Type
> = function*(ast, execContext) {
  if (isNull(ast.argument)) {
    return [Undefined, execContext] as [typeof Undefined, TExecutionContext];
  }
  return evaluate(ast.argument, execContext);
};

export const ThisExpressionResolver: ASTResolver<
  ThisExpression,
  Type
> = function*(_ast, execContext) {
  return [execContext.value.thisValue, execContext] as [
    Type,
    TExecutionContext
  ];
};

export const ObjectExpressionResolver: ASTResolver<
  ObjectExpression,
  Type
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

  return [ESObject(obj), currExecContext] as [TESObject, TExecutionContext];
};

export const FunctionExpressionResolver: ASTResolver<
  FunctionExpression,
  FunctionBinding
> = function*(ast, execContext) {
  return [createFunction(ast.body.body, ast.params), execContext] as [
    FunctionBinding,
    TExecutionContext
  ];
};

export const BooleanLiteralResolver: ASTResolver<
  BooleanLiteral,
  typeof Undefined
> = function*(ast, execContext) {
  return [Undefined, execContext] as [typeof Undefined, TExecutionContext];
};

export const ExpressionStatementResolver = statementResolver<
  ExpressionStatement
>(function*(statement, execContext) {
  const result = yield evaluate(statement.expression, execContext);
  return [Undefined, result[1]] as [typeof Undefined, TExecutionContext];
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
  return [Undefined, currExecContext] as [typeof Undefined, TExecutionContext];
});

export const FunctionDeclarationResolver = statementResolver<
  FunctionDeclaration
>(function*(statement, execContext) {
  return [
    Undefined,
    setVariableInScope(
      execContext,
      unsafeCast<Identifier>(statement.id).name,
      createFunction(statement.body.body, statement.params)
    )
  ] as [typeof Undefined, TExecutionContext];
});

export const IfStatementResolver = statementResolver<IfStatement>(function*(
  statement,
  prevContext
) {
  return evaluate(statement.consequent, prevContext);
});

export const EmptyStatementResolver = statementResolver<EmptyStatement>(
  function*(_, execContext) {
    return [Undefined, execContext] as [typeof Undefined, TExecutionContext];
  }
);

export const NewExpressionResolver: ASTResolver<
  NewExpression,
  Type
> = function*(expression, execContext) {
  const thisValue = ESObject({});

  let [calleeType, newExecContext] = yield evaluate(
    expression.callee,
    execContext
  );

  let currExecContext = newExecContext;
  let argsTypes: Type[] = [];

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

  return [
    ESObject({
      ...unsafeCast<TESObject>(
        unsafeCast<FunctionBinding>(calleeType).properties.prototype
      ).properties,
      ...unsafeCast<TESObject>(afterCallExecContext.value.thisValue).value
    }),
    afterCallExecContext
  ] as [Type, TExecutionContext];
};

export const LogicalExpressionResolver: ASTResolver<
  LogicalExpression,
  Type
> = function*(expression, execContext) {
  return evaluate(expression.left, execContext);
};

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
  ["LogicalExpression", LogicalExpressionResolver]
]);
