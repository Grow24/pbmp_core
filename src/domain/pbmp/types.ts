export type PBMPIdentifier = string

export interface PBMPInputOutputField {
  id: PBMPIdentifier
  name: string
  description: string
  dataType: 'number' | 'string' | 'boolean' | 'object'
  required: boolean
}

export interface PBMPActor {
  id: PBMPIdentifier
  name: string
  actorType:
    | 'person'
    | 'program'
    | 'service'
    | 'physical-good'
    | 'digital-good'
    | 'organization'
    | 'component'
    | 'other'
  description: string
}

export interface PBMPComponentWhat {
  componentId: PBMPIdentifier
  gemId: string
  name: string
  description: string
  componentType: string
  classification: string
  version: string
  status: string
  ownerActorId: PBMPIdentifier
  inputs: PBMPInputOutputField[]
  outputs: PBMPInputOutputField[]
  potentialRealizations: string[]
}

export interface PBMPIntention {
  id: PBMPIdentifier
  statement: string
}

export interface PBMPProcess {
  id: PBMPIdentifier
  name: string
  description: string
  steps: string[]
}

export interface PBMPComponentWhy {
  intentions: PBMPIntention[]
  enabledProcessIds: PBMPIdentifier[]
}

export interface PBMPComponentStructure {
  inputs: PBMPInputOutputField[]
  outputs: PBMPInputOutputField[]
  properties: Record<string, string>
  interfaces: string[]
  configuration: Record<string, string>
  internalParts?: string[]
}

export interface PBMPComponentBehavior {
  logicModelId: PBMPIdentifier
  functions: string[]
  rules: string[]
  stateModel: string[]
  events: string[]
  lifecycle: string[]
}

export interface PBMPComponentHow {
  structure: PBMPComponentStructure
  behavior: PBMPComponentBehavior
}

export type PBMPRelationshipCategory =
  | 'structural'
  | 'taxonomic'
  | 'realization'
  | 'dependency'

export type PBMPRelationshipScope = 'intra-component' | 'inter-component'

export interface PBMPRelationshipType {
  category: PBMPRelationshipCategory
  family:
    | 'whole-part'
    | 'association'
    | 'generalization-specialization'
    | 'realization'
    | 'requires'
    | 'uses'
    | 'depends-on'
  variant: 'composition' | 'aggregation' | 'direct' | 'none'
}

export interface PBMPRelationship {
  id: PBMPIdentifier
  sourceId: PBMPIdentifier
  sourceLabel: string
  targetId: PBMPIdentifier
  targetLabel: string
  relationshipVerb: string
  type: PBMPRelationshipType
  scope: PBMPRelationshipScope
  notes?: string
}

export interface PBMPRole {
  id: PBMPIdentifier
  name: string
  description: string
}

export interface PBMPOutputSet {
  id: PBMPIdentifier
  name: string
  fields: string[]
}

export interface PBMPRoleAccessRule {
  roleId: PBMPIdentifier
  executeAllowed: boolean
  channelId: PBMPIdentifier
  outputSetId: PBMPIdentifier
}

export interface PBMPChannel {
  id: PBMPIdentifier
  name: string
  description: string
  parentChannelId?: PBMPIdentifier
  exists: boolean
  availability: 'available' | 'unavailable'
  state: 'open' | 'closed'
  access: 'accessible' | 'restricted'
  preferred: boolean
  selected: boolean
  endpointAActorId: PBMPIdentifier
  endpointBActorId: PBMPIdentifier
}

export interface PBMPMessaging {
  id: PBMPIdentifier
  meaning: string
}

export interface PBMPContentItem {
  key: string
  valueType: 'number' | 'string' | 'boolean' | 'object'
  value: unknown
}

export interface PBMPContentStructureNode {
  id: PBMPIdentifier
  name: string
  children?: PBMPContentStructureNode[]
}

export interface PBMPContentStructure {
  id: PBMPIdentifier
  root: PBMPContentStructureNode
}

export interface PBMPFormat {
  id: PBMPIdentifier
  name: 'json' | 'xml' | 'csv' | 'in-memory-object'
  mimeType: string
}

export interface PBMPContent {
  id: PBMPIdentifier
  items: PBMPContentItem[]
  structureId: PBMPIdentifier
}

export interface PBMPTransportableMessage {
  id: PBMPIdentifier
  contentId: PBMPIdentifier
  formatId: PBMPIdentifier
  encodedPayload: string
  channelId: PBMPIdentifier
}

export interface PBMPFormField {
  id: PBMPIdentifier
  key: string
  label: string
  fieldType: 'number-input' | 'text-input' | 'readonly'
  required: boolean
}

export interface PBMPFormStructure {
  id: PBMPIdentifier
  name: string
  layout: 'horizontal' | 'vertical'
  sections: Array<{
    id: PBMPIdentifier
    title: string
    fieldIds: PBMPIdentifier[]
  }>
  actionIds: PBMPIdentifier[]
}

export interface PBMPStyleDefinition {
  id: PBMPIdentifier
  name: string
  typography: string
  spacing: 'compact' | 'comfortable'
  emphasis: 'subtle' | 'prominent'
  theme: 'light' | 'dark'
  colors: Record<string, string>
  touchTarget: 'standard' | 'large'
}

export interface PBMPFormDefinition {
  id: PBMPIdentifier
  name: string
  channelId: PBMPIdentifier
  structure: PBMPFormStructure
  style: PBMPStyleDefinition
  fields: PBMPFormField[]
}

export interface PBMPMediaClassificationNode {
  id: PBMPIdentifier
  name: string
  children?: PBMPMediaClassificationNode[]
}

export interface PBMPMediaClassification {
  id: PBMPIdentifier
  root: PBMPMediaClassificationNode
}

export type PBMPLogicBinaryOperator =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'gt'
  | 'lt'
  | 'eq'

export type PBMPLogicExpression =
  | {
      kind: 'literal'
      value: number | string | boolean
    }
  | {
      kind: 'reference'
      reference: string
    }
  | {
      kind: 'binary'
      operator: PBMPLogicBinaryOperator
      left: PBMPLogicExpression
      right: PBMPLogicExpression
    }

export interface PBMPLogicAssignStatement {
  kind: 'assign'
  target: string
  value: PBMPLogicExpression
}

export interface PBMPLogicIfStatement {
  kind: 'if'
  condition: PBMPLogicExpression
  then: PBMPLogicStatement[]
  else?: PBMPLogicStatement[]
}

export interface PBMPLogicForEachStatement {
  kind: 'forEach'
  iterator: string
  collection: PBMPLogicExpression
  body: PBMPLogicStatement[]
}

export type PBMPLogicStatement =
  | PBMPLogicAssignStatement
  | PBMPLogicIfStatement
  | PBMPLogicForEachStatement

export interface PBMPLogicModel {
  id: PBMPIdentifier
  version: string
  root: PBMPLogicStatement[]
  outputs: string[]
}

export interface PBMPCapabilitiesEnabled {
  roles: PBMPRole[]
  channels: PBMPChannel[]
  roleAccessRules: PBMPRoleAccessRule[]
  outputSets: PBMPOutputSet[]
  messaging: PBMPMessaging[]
  contentStructures: PBMPContentStructure[]
  formats: PBMPFormat[]
  forms: PBMPFormDefinition[]
  mediaClassifications: PBMPMediaClassification[]
}

export interface PBMPComponentDefinition {
  id: PBMPIdentifier
  what: PBMPComponentWhat
  why: PBMPComponentWhy
  how: PBMPComponentHow
  actors: PBMPActor[]
  processes: PBMPProcess[]
  relationships: PBMPRelationship[]
  capabilities: PBMPCapabilitiesEnabled
}
