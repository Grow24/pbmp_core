import type {
  PBMPLogicBinaryOperator,
  PBMPLogicExpression,
  PBMPLogicModel,
  PBMPLogicStatement,
} from '../pbmp/types'

type TokenType = 'identifier' | 'number' | 'operator' | 'paren'

interface Token {
  type: TokenType
  value: string
}

const operatorPrecedence: Record<PBMPLogicBinaryOperator, number> = {
  add: 1,
  subtract: 1,
  multiply: 2,
  divide: 2,
  gt: 0,
  lt: 0,
  eq: 0,
}

export function parseFormulaToLogicModel(
  formulaInput: string,
  modelId = 'logic-formula-edited',
): PBMPLogicModel {
  const trimmed = formulaInput.trim()
  if (!trimmed) {
    throw new Error('Formula is empty.')
  }

  const normalized = trimmed.startsWith('=') ? `Result ${trimmed}` : trimmed
  const [targetRaw, expressionRaw] = splitAssignment(normalized)
  const target = targetRaw.trim()
  if (!target) {
    throw new Error('Assignment target is missing.')
  }

  const expression = parseExpression(expressionRaw.trim())
  return {
    id: modelId,
    version: '1.0.0',
    root: [
      {
        kind: 'assign',
        target,
        value: expression,
      },
    ],
    outputs: [target],
  }
}

export function logicModelToFormula(model: PBMPLogicModel): string {
  const assignment = model.root.find(
    (statement): statement is Extract<PBMPLogicStatement, { kind: 'assign' }> =>
      statement.kind === 'assign',
  )
  if (!assignment) {
    return '=0'
  }

  return `${assignment.target} = ${expressionToFormula(assignment.value)}`
}

export function expressionToFormula(expression: PBMPLogicExpression): string {
  switch (expression.kind) {
    case 'literal':
      return typeof expression.value === 'string'
        ? `"${expression.value}"`
        : String(expression.value)
    case 'reference':
      return expression.reference
    case 'binary': {
      const left = wrapIfNeeded(expression.left, expression.operator)
      const right = wrapIfNeeded(expression.right, expression.operator)
      return `${left} ${operatorToSymbol(expression.operator)} ${right}`
    }
    default:
      return '0'
  }
}

function wrapIfNeeded(
  expression: PBMPLogicExpression,
  parentOperator: PBMPLogicBinaryOperator,
): string {
  if (expression.kind !== 'binary') {
    return expressionToFormula(expression)
  }

  const childPrecedence = operatorPrecedence[expression.operator]
  const parentPrecedence = operatorPrecedence[parentOperator]
  if (childPrecedence < parentPrecedence) {
    return `(${expressionToFormula(expression)})`
  }

  return expressionToFormula(expression)
}

function splitAssignment(value: string): [string, string] {
  const equalsIndex = value.indexOf('=')
  if (equalsIndex === -1) {
    throw new Error('Formula must include "=" for assignment.')
  }
  return [value.slice(0, equalsIndex), value.slice(equalsIndex + 1)]
}

function parseExpression(input: string): PBMPLogicExpression {
  const tokens = tokenize(input)
  if (tokens.length === 0) {
    throw new Error('Expression is empty.')
  }
  let position = 0

  const parsePrimary = (): PBMPLogicExpression => {
    const token = tokens[position]
    if (!token) {
      throw new Error('Unexpected end of expression.')
    }

    if (token.type === 'number') {
      position += 1
      return { kind: 'literal', value: Number(token.value) }
    }

    if (token.type === 'identifier') {
      position += 1
      return { kind: 'reference', reference: token.value }
    }

    if (token.type === 'paren' && token.value === '(') {
      position += 1
      const nested = parseByPrecedence(0)
      const close = tokens[position]
      if (!close || close.type !== 'paren' || close.value !== ')') {
        throw new Error('Missing closing parenthesis.')
      }
      position += 1
      return nested
    }

    throw new Error(`Unexpected token "${token.value}".`)
  }

  const parseByPrecedence = (minimumPrecedence: number): PBMPLogicExpression => {
    let left = parsePrimary()

    while (true) {
      const token = tokens[position]
      if (!token || token.type !== 'operator') {
        break
      }

      const operator = symbolToOperator(token.value)
      const precedence = operatorPrecedence[operator]
      if (precedence < minimumPrecedence) {
        break
      }

      position += 1
      const right = parseByPrecedence(precedence + 1)

      left = {
        kind: 'binary',
        operator,
        left,
        right,
      }
    }

    return left
  }

  const expression = parseByPrecedence(0)
  if (position !== tokens.length) {
    throw new Error(`Unexpected token "${tokens[position]?.value ?? ''}".`)
  }

  return expression
}

function tokenize(input: string): Token[] {
  const tokenPattern = /\s*([A-Za-z_][A-Za-z0-9_]*|\d+(\.\d+)?|==|[+\-*/()<>])\s*/g
  const tokens: Token[] = []
  let match: RegExpExecArray | null

  while ((match = tokenPattern.exec(input)) !== null) {
    const value = match[1]
    if (/^\d+(\.\d+)?$/.test(value)) {
      tokens.push({ type: 'number', value })
      continue
    }

    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
      tokens.push({ type: 'identifier', value })
      continue
    }

    if (value === '(' || value === ')') {
      tokens.push({ type: 'paren', value })
      continue
    }

    tokens.push({ type: 'operator', value })
  }

  const consumed = tokens.map((token) => token.value).join('')
  const normalizedInput = input.replace(/\s+/g, '')
  if (consumed.replace(/\s+/g, '') !== normalizedInput) {
    throw new Error('Expression contains unsupported characters.')
  }

  return tokens
}

function operatorToSymbol(operator: PBMPLogicBinaryOperator): string {
  switch (operator) {
    case 'add':
      return '+'
    case 'subtract':
      return '-'
    case 'multiply':
      return '*'
    case 'divide':
      return '/'
    case 'gt':
      return '>'
    case 'lt':
      return '<'
    case 'eq':
      return '=='
    default:
      return '+'
  }
}

function symbolToOperator(symbol: string): PBMPLogicBinaryOperator {
  switch (symbol) {
    case '+':
      return 'add'
    case '-':
      return 'subtract'
    case '*':
      return 'multiply'
    case '/':
      return 'divide'
    case '>':
      return 'gt'
    case '<':
      return 'lt'
    case '==':
      return 'eq'
    default:
      throw new Error(`Unsupported operator "${symbol}".`)
  }
}
