import * as Blockly from 'blockly'

import type {
  PBMPLogicBinaryOperator,
  PBMPLogicExpression,
  PBMPLogicModel,
} from '../pbmp/types'

export type BlocklyWorkspaceState = Record<string, unknown>

export const PBMP_BLOCKLY_TOOLBOX: Blockly.utils.toolbox.ToolboxDefinition = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Variables',
      categorystyle: 'variable_category',
      custom: 'VARIABLE',
    },
    {
      kind: 'category',
      name: 'Math',
      categorystyle: 'math_category',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
      ],
    },
    {
      kind: 'category',
      name: 'Logic',
      categorystyle: 'logic_category',
      contents: [{ kind: 'block', type: 'logic_compare' }],
    },
  ],
}

export function logicModelToBlocklyState(model: PBMPLogicModel): BlocklyWorkspaceState {
  const workspace = new Blockly.Workspace()
  ensureVariable(workspace, 'Number1')
  ensureVariable(workspace, 'Number2')
  ensureVariable(workspace, 'Result')

  const assignStatement = model.root.find((statement) => statement.kind === 'assign')
  if (assignStatement) {
    const assignBlock = workspace.newBlock('variables_set')
    assignBlock.setFieldValue(ensureVariable(workspace, assignStatement.target).getId(), 'VAR')
    const valueBlock = expressionToBlock(workspace, assignStatement.value)
    const inputConnection = assignBlock.getInput('VALUE')?.connection
    if (inputConnection && valueBlock.outputConnection) {
      inputConnection.connect(valueBlock.outputConnection)
    }
    assignBlock.moveBy(40, 40)
  }

  const state = Blockly.serialization.workspaces.save(workspace) as BlocklyWorkspaceState
  workspace.dispose()
  return state
}

export function applyBlocklyState(
  workspace: Blockly.WorkspaceSvg,
  state: BlocklyWorkspaceState,
): void {
  workspace.clear()
  Blockly.serialization.workspaces.load(state, workspace)
}

export function workspaceToBlocklyState(workspace: Blockly.WorkspaceSvg): BlocklyWorkspaceState {
  return Blockly.serialization.workspaces.save(workspace) as BlocklyWorkspaceState
}

export function workspaceToLogicModel(workspace: Blockly.WorkspaceSvg): PBMPLogicModel {
  const topBlocks = workspace.getTopBlocks(true)
  const setBlock = topBlocks.find((block) => block.type === 'variables_set')
  if (!setBlock) {
    return fallbackLogicModel()
  }

  const target = variableNameFromField(workspace, setBlock.getFieldValue('VAR')) ?? 'Result'
  const valueBlock = setBlock.getInputTargetBlock('VALUE')
  const expression: PBMPLogicExpression = valueBlock
    ? blockToExpression(valueBlock, workspace)
    : { kind: 'literal', value: 0 }

  return {
    id: 'logic-from-blockly',
    version: '1.0.0',
    root: [{ kind: 'assign', target, value: expression }],
    outputs: [target],
  }
}

function expressionToBlock(workspace: Blockly.Workspace, expression: PBMPLogicExpression): Blockly.Block {
  if (expression.kind === 'literal') {
    const numberBlock = workspace.newBlock('math_number')
    numberBlock.setFieldValue(String(expression.value), 'NUM')
    return numberBlock
  }

  if (expression.kind === 'reference') {
    const variableBlock = workspace.newBlock('variables_get')
    variableBlock.setFieldValue(ensureVariable(workspace, expression.reference).getId(), 'VAR')
    return variableBlock
  }

  const comparison = comparisonOperator(expression.operator)
  const blockType = comparison ? 'logic_compare' : 'math_arithmetic'
  const binaryBlock = workspace.newBlock(blockType)
  if (blockType === 'math_arithmetic') {
    binaryBlock.setFieldValue(arithmeticOperator(expression.operator), 'OP')
  } else {
    binaryBlock.setFieldValue(comparison ?? 'EQ', 'OP')
  }

  const leftBlock = expressionToBlock(workspace, expression.left)
  const rightBlock = expressionToBlock(workspace, expression.right)
  const leftConnection = binaryBlock.getInput('A')?.connection
  const rightConnection = binaryBlock.getInput('B')?.connection

  if (leftConnection && leftBlock.outputConnection) {
    leftConnection.connect(leftBlock.outputConnection)
  }
  if (rightConnection && rightBlock.outputConnection) {
    rightConnection.connect(rightBlock.outputConnection)
  }

  return binaryBlock
}

function blockToExpression(block: Blockly.Block, workspace: Blockly.Workspace): PBMPLogicExpression {
  if (block.type === 'math_number') {
    return {
      kind: 'literal',
      value: Number(block.getFieldValue('NUM')),
    }
  }

  if (block.type === 'variables_get') {
    return {
      kind: 'reference',
      reference: variableNameFromField(workspace, block.getFieldValue('VAR')) ?? 'Unknown',
    }
  }

  if (block.type === 'math_arithmetic') {
    const left = block.getInputTargetBlock('A')
    const right = block.getInputTargetBlock('B')
    return {
      kind: 'binary',
      operator: arithmeticOperatorToPBMP(block.getFieldValue('OP')),
      left: left ? blockToExpression(left, workspace) : { kind: 'literal', value: 0 },
      right: right ? blockToExpression(right, workspace) : { kind: 'literal', value: 0 },
    }
  }

  if (block.type === 'logic_compare') {
    const left = block.getInputTargetBlock('A')
    const right = block.getInputTargetBlock('B')
    return {
      kind: 'binary',
      operator: comparisonOperatorToPBMP(block.getFieldValue('OP')),
      left: left ? blockToExpression(left, workspace) : { kind: 'literal', value: 0 },
      right: right ? blockToExpression(right, workspace) : { kind: 'literal', value: 0 },
    }
  }

  return { kind: 'literal', value: 0 }
}

function ensureVariable(workspace: Blockly.Workspace, name: string) {
  const variableMap = workspace.getVariableMap()
  const variable = variableMap.getVariable(name)
  if (variable) {
    return variable
  }
  return variableMap.createVariable(name)
}

function variableNameFromField(workspace: Blockly.Workspace, fieldValue: string | null): string | undefined {
  if (!fieldValue) {
    return undefined
  }
  return workspace.getVariableMap().getVariableById(fieldValue)?.getName() ?? fieldValue
}

function arithmeticOperator(operator: PBMPLogicBinaryOperator): string {
  switch (operator) {
    case 'add':
      return 'ADD'
    case 'subtract':
      return 'MINUS'
    case 'multiply':
      return 'MULTIPLY'
    case 'divide':
      return 'DIVIDE'
    default:
      return 'ADD'
  }
}

function arithmeticOperatorToPBMP(operator: string): 'add' | 'subtract' | 'multiply' | 'divide' {
  switch (operator) {
    case 'ADD':
      return 'add'
    case 'MINUS':
      return 'subtract'
    case 'MULTIPLY':
      return 'multiply'
    case 'DIVIDE':
      return 'divide'
    default:
      return 'add'
  }
}

function comparisonOperator(operator: PBMPLogicBinaryOperator): string | null {
  switch (operator) {
    case 'gt':
      return 'GT'
    case 'lt':
      return 'LT'
    case 'eq':
      return 'EQ'
    default:
      return null
  }
}

function comparisonOperatorToPBMP(operator: string): 'gt' | 'lt' | 'eq' {
  switch (operator) {
    case 'GT':
      return 'gt'
    case 'LT':
      return 'lt'
    case 'EQ':
      return 'eq'
    default:
      return 'eq'
  }
}

function fallbackLogicModel(): PBMPLogicModel {
  return {
    id: 'logic-empty',
    version: '1.0.0',
    root: [
      {
        kind: 'assign',
        target: 'Result',
        value: {
          kind: 'binary',
          operator: 'add',
          left: { kind: 'reference', reference: 'Number1' },
          right: { kind: 'reference', reference: 'Number2' },
        },
      },
    ],
    outputs: ['Result'],
  }
}
