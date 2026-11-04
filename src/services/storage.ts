import type { BlocklyWorkspaceState } from '../domain/logic/blocklyAdapter'
import type {
  PBMPChannel,
  PBMPComponentDefinition,
  PBMPFormDefinition,
  PBMPLogicModel,
  PBMPRoleAccessRule,
} from '../domain/pbmp/types'

const STORAGE_KEYS = {
  componentDefinition: 'pbmp.component.definition',
  logicDefinition: 'pbmp.logic.definition',
  blocklyState: 'pbmp.blockly.workspaceState',
  roleAccessConfiguration: 'pbmp.capabilities.roleAccess',
  channelConfiguration: 'pbmp.capabilities.channels',
  formConfiguration: 'pbmp.capabilities.forms',
}

export interface PBMPLocalSnapshot {
  componentDefinition: PBMPComponentDefinition | null
  logicDefinition: PBMPLogicModel | null
  blocklyState: BlocklyWorkspaceState | null
  roleAccessConfiguration: PBMPRoleAccessRule[] | null
  channelConfiguration: PBMPChannel[] | null
  formConfiguration: PBMPFormDefinition[] | null
}

export function saveSnapshot(snapshot: {
  componentDefinition: PBMPComponentDefinition
  logicDefinition: PBMPLogicModel
  blocklyState: BlocklyWorkspaceState
  roleAccessConfiguration: PBMPRoleAccessRule[]
  channelConfiguration: PBMPChannel[]
  formConfiguration: PBMPFormDefinition[]
}): void {
  saveJson(STORAGE_KEYS.componentDefinition, snapshot.componentDefinition)
  saveJson(STORAGE_KEYS.logicDefinition, snapshot.logicDefinition)
  saveJson(STORAGE_KEYS.blocklyState, snapshot.blocklyState)
  saveJson(STORAGE_KEYS.roleAccessConfiguration, snapshot.roleAccessConfiguration)
  saveJson(STORAGE_KEYS.channelConfiguration, snapshot.channelConfiguration)
  saveJson(STORAGE_KEYS.formConfiguration, snapshot.formConfiguration)
}

export function loadSnapshot(): PBMPLocalSnapshot {
  return {
    componentDefinition: readJson<PBMPComponentDefinition>(STORAGE_KEYS.componentDefinition),
    logicDefinition: readJson<PBMPLogicModel>(STORAGE_KEYS.logicDefinition),
    blocklyState: readJson<BlocklyWorkspaceState>(STORAGE_KEYS.blocklyState),
    roleAccessConfiguration: readJson<PBMPRoleAccessRule[]>(STORAGE_KEYS.roleAccessConfiguration),
    channelConfiguration: readJson<PBMPChannel[]>(STORAGE_KEYS.channelConfiguration),
    formConfiguration: readJson<PBMPFormDefinition[]>(STORAGE_KEYS.formConfiguration),
  }
}

function saveJson(storageKey: string, value: unknown): void {
  localStorage.setItem(storageKey, JSON.stringify(value, null, 2))
}

function readJson<T>(storageKey: string): T | null {
  const raw = localStorage.getItem(storageKey)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
