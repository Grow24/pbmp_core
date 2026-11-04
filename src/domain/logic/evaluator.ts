import type {
  PBMPLogicExpression,
  PBMPLogicModel,
  PBMPLogicStatement,
} from '../pbmp/types'

export interface PBMPExecutionContext {
  [key: string]: unknown
}

export interface PBMPExecutionResult {
  output: PBMPExecutionContext
  status: 'Success' | 'Failure'
  diagnostics: string[]
}

export function executeLogicModel(
  model: PBMPLogicModel,
  inputContext: PBMPExecutionContext,
): PBMPExecutionResult {
  const runtimeContext: PBMPExecutionContext = { ...inputContext }
  const diagnostics: string[] = []

  for (const statement of model.root) {
    executeStatement(statement, runtimeContext, diagnostics)
  }

  const output: PBMPExecutionContext = {}
  for (const outputKey of model.outputs) {
    output[outputKey] = runtimeContext[outputKey]
  }

  return {
    output,
    status: diagnostics.length === 0 ? 'Success' : 'Failure',
    diagnostics,
  }
}

function executeStatement(
  statement: PBMPLogicStatement,
  runtimeContext: PBMPExecutionContext,
  diagnostics: string[],
): void {
  if (statement.kind === 'assign') {
    runtimeContext[statement.target] = evaluateExpression(statement.value, runtimeContext, diagnostics)
    return
  }

  if (statement.kind === 'if') {
    const conditionValue = evaluateExpression(statement.condition, runtimeContext, diagnostics)
    const shouldRunThen = Boolean(conditionValue)
    const branch = shouldRunThen ? statement.then : statement.else ?? []
    for (const nestedStatement of branch) {
      executeStatement(nestedStatement, runtimeContext, diagnostics)
    }
    return
  }

  if (statement.kind === 'forEach') {
    const collectionValue = evaluateExpression(statement.collection, runtimeContext, diagnostics)
    if (!Array.isArray(collectionValue)) {
      diagnostics.push(`forEach collection "${statement.iterator}" is not iterable.`)
      return
    }
    for (const item of collectionValue) {
      runtimeContext[statement.iterator] = item
      for (const nestedStatement of statement.body) {
        executeStatement(nestedStatement, runtimeContext, diagnostics)
      }
    }
  }
}

function evaluateExpression(
  expression: PBMPLogicExpression,
  runtimeContext: PBMPExecutionContext,
  diagnostics: string[],
): unknown {
  if (expression.kind === 'literal') {
    return expression.value
  }

  if (expression.kind === 'reference') {
    return runtimeContext[expression.reference]
  }

  const left = evaluateExpression(expression.left, runtimeContext, diagnostics)
  const right = evaluateExpression(expression.right, runtimeContext, diagnostics)

  switch (expression.operator) {
    case 'add':
      return Number(left) + Number(right)
    case 'subtract':
      return Number(left) - Number(right)
    case 'multiply':
      return Number(left) * Number(right)
    case 'divide':
      return Number(left) / Number(right)
    case 'gt':
      return Number(left) > Number(right)
    case 'lt':
      return Number(left) < Number(right)
    case 'eq':
      return left === right
    default:
      diagnostics.push(`Unsupported operator: ${(expression as { operator?: string }).operator ?? ''}`)
      return null
  }
}
