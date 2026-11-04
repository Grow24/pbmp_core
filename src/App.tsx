import { useCallback, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import { CapabilitiesPanel } from './components/config/CapabilitiesPanel'
import { CoreAnatomyPanel } from './components/config/CoreAnatomyPanel'
import { RelationshipsPanel } from './components/config/RelationshipsPanel'
import { JsonInspector } from './components/inspectors/JsonInspector'
import { Tabs } from './components/layout/Tabs'
import { BlocklyEditor } from './components/logic/BlocklyEditor'
import { FormulaEditor } from './components/logic/FormulaEditor'
import { ExecutePanel } from './components/runtime/ExecutePanel'
import {
  logicModelToBlocklyState,
  type BlocklyWorkspaceState,
} from './domain/logic/blocklyAdapter'
import { executeLogicModel, type PBMPExecutionResult } from './domain/logic/evaluator'
import { logicModelToFormula, parseFormulaToLogicModel } from './domain/logic/formula'
import {
  cloneComponentDefinition,
  cloneLogicDefinition,
} from './domain/pbmp/sampleData'
import { loadSnapshot, saveSnapshot } from './services/storage'

type TabId = 'core' | 'relationships' | 'capabilities' | 'logic' | 'preview' | 'inspector'

const TAB_ITEMS: Array<{ id: TabId; label: string }> = [
  { id: 'core', label: 'Core Anatomy' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'capabilities', label: 'Capabilities Enabled' },
  { id: 'logic', label: 'Logic' },
  { id: 'preview', label: 'Preview / Execute' },
  { id: 'inspector', label: 'JSON Inspector' },
]

function App() {
  const [componentDefinition, setComponentDefinition] = useState(() => cloneComponentDefinition())
  const [logicModel, setLogicModel] = useState(() => cloneLogicDefinition())
  const [blocklyState, setBlocklyState] = useState<BlocklyWorkspaceState>(() =>
    logicModelToBlocklyState(cloneLogicDefinition()),
  )
  const [blocklyRevision, setBlocklyRevision] = useState(0)
  const [logicFromBlockly, setLogicFromBlockly] = useState(() => cloneLogicDefinition())
  const [formulaDraft, setFormulaDraft] = useState(() => logicModelToFormula(cloneLogicDefinition()))
  const [formulaError, setFormulaError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('core')
  const [selectedRoleId, setSelectedRoleId] = useState('role-user')
  const [selectedChannelId, setSelectedChannelId] = useState('channel-desktop-browser')
  const [number1, setNumber1] = useState('25')
  const [number2, setNumber2] = useState('17')
  const [executionResult, setExecutionResult] = useState<PBMPExecutionResult | null>(null)
  const [storageMessage, setStorageMessage] = useState<string | null>(null)

  const selectedChannel = componentDefinition.capabilities.channels.find(
    (channel) => channel.id === selectedChannelId,
  )
  const selectedRule = componentDefinition.capabilities.roleAccessRules.find(
    (rule) => rule.roleId === selectedRoleId && rule.channelId === selectedChannelId,
  )
  const selectedOutputSet = componentDefinition.capabilities.outputSets.find(
    (outputSet) => outputSet.id === selectedRule?.outputSetId,
  )
  const visibleOutputFields = selectedOutputSet?.fields ?? []

  const accessMessage = useMemo(() => {
    if (!selectedChannel) {
      return 'Selected channel is missing from configuration.'
    }
    if (selectedChannel.availability !== 'available') {
      return `Channel is ${selectedChannel.availability}.`
    }
    if (selectedChannel.state !== 'open') {
      return `Channel state is ${selectedChannel.state}.`
    }
    if (selectedChannel.access !== 'accessible') {
      return `Channel access is ${selectedChannel.access}.`
    }
    if (!selectedRule) {
      return 'No role/channel access rule found.'
    }
    if (!selectedRule.executeAllowed) {
      return 'Execution is disabled by role policy.'
    }
    return null
  }, [selectedChannel, selectedRule])

  const executeMutation = useMutation({
    mutationFn: async () => {
      await wait(120)
      return executeLogicModel(logicModel, {
        Number1: Number(number1),
        Number2: Number(number2),
      })
    },
    onSuccess: (result) => {
      setExecutionResult(result)
    },
  })

  const applyFormulaChanges = () => {
    try {
      const parsedModel = parseFormulaToLogicModel(formulaDraft)
      setLogicModel(parsedModel)
      const nextBlocklyState = logicModelToBlocklyState(parsedModel)
      setBlocklyState(nextBlocklyState)
      setBlocklyRevision((value) => value + 1)
      setFormulaError(null)
    } catch (error) {
      setFormulaError(error instanceof Error ? error.message : 'Unknown formula parse error.')
    }
  }

  const handleBlocklyChange = useCallback(
    (nextState: BlocklyWorkspaceState, nextLogicModel: typeof logicModel) => {
      setBlocklyState(nextState)
      setLogicFromBlockly(nextLogicModel)
      setLogicModel(nextLogicModel)
      setFormulaDraft(logicModelToFormula(nextLogicModel))
      setFormulaError(null)
    },
    [],
  )

  const handleSaveLocal = () => {
    saveSnapshot({
      componentDefinition,
      logicDefinition: logicModel,
      blocklyState,
      roleAccessConfiguration: componentDefinition.capabilities.roleAccessRules,
      channelConfiguration: componentDefinition.capabilities.channels,
      formConfiguration: componentDefinition.capabilities.forms,
    })
    setStorageMessage('Saved to browser local storage.')
  }

  const handleLoadLocal = () => {
    const snapshot = loadSnapshot()
    let nextComponent = snapshot.componentDefinition ?? componentDefinition

    if (snapshot.roleAccessConfiguration) {
      nextComponent = {
        ...nextComponent,
        capabilities: {
          ...nextComponent.capabilities,
          roleAccessRules: snapshot.roleAccessConfiguration,
        },
      }
    }
    if (snapshot.channelConfiguration) {
      nextComponent = {
        ...nextComponent,
        capabilities: {
          ...nextComponent.capabilities,
          channels: snapshot.channelConfiguration,
        },
      }
    }
    if (snapshot.formConfiguration) {
      nextComponent = {
        ...nextComponent,
        capabilities: {
          ...nextComponent.capabilities,
          forms: snapshot.formConfiguration,
        },
      }
    }
    setComponentDefinition(nextComponent)

    const nextLogic = snapshot.logicDefinition ?? logicModel
    setLogicModel(nextLogic)
    setLogicFromBlockly(nextLogic)
    setFormulaDraft(logicModelToFormula(nextLogic))

    const nextBlocklyState = snapshot.blocklyState ?? logicModelToBlocklyState(nextLogic)
    setBlocklyState(nextBlocklyState)
    setBlocklyRevision((value) => value + 1)
    setFormulaError(null)
    setStorageMessage('Loaded configuration from local storage.')
  }

  const logicIsSynchronized = useMemo(
    () => JSON.stringify(logicModel) === JSON.stringify(logicFromBlockly),
    [logicFromBlockly, logicModel],
  )

  const contentPreview = useMemo(() => {
    const content = {
      id: 'content-addition-result-runtime',
      structureId: componentDefinition.capabilities.contentStructures[0]?.id ?? 'content-structure-addition-result',
      items: [
        { key: 'operandA', valueType: 'number', value: Number(number1) },
        { key: 'operandB', valueType: 'number', value: Number(number2) },
        { key: 'operation', valueType: 'string', value: 'Addition' },
        { key: 'result', valueType: 'number', value: executionResult?.output.Result ?? null },
        { key: 'status', valueType: 'string', value: executionResult?.status ?? 'Pending' },
      ],
    }
    return content
  }, [componentDefinition.capabilities.contentStructures, executionResult?.output.Result, executionResult?.status, number1, number2])

  const transportableMessagePreview = useMemo(() => {
    const format = componentDefinition.capabilities.formats[0]
    return {
      id: 'message-addition-result-runtime',
      contentId: 'content-addition-result-runtime',
      formatId: format?.id ?? 'format-json',
      channelId: selectedChannelId,
      encodedPayload: JSON.stringify(contentPreview),
    }
  }, [componentDefinition.capabilities.formats, contentPreview, selectedChannelId])

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-8">
        <header className="rounded-lg border border-slate-200 bg-white p-4">
          <h1 className="text-2xl font-bold">PBMP Generic Component Prototype</h1>
          <p className="mt-1 text-sm text-slate-600">
            One component definition with multi-role, multi-channel, multi-form runtime behavior. Concrete
            example: Add Two Numbers.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSaveLocal}
              className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-900"
            >
              Save Local
            </button>
            <button
              type="button"
              onClick={handleLoadLocal}
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50"
            >
              Load Local
            </button>
            {storageMessage ? <span className="text-sm text-slate-600">{storageMessage}</span> : null}
          </div>
        </header>

        <Tabs items={TAB_ITEMS} activeId={activeTab} onChange={(tabId) => setActiveTab(tabId as TabId)} />

        {activeTab === 'core' ? (
          <CoreAnatomyPanel component={componentDefinition} onUpdate={setComponentDefinition} />
        ) : null}
        {activeTab === 'relationships' ? <RelationshipsPanel component={componentDefinition} /> : null}
        {activeTab === 'capabilities' ? (
          <CapabilitiesPanel component={componentDefinition} onUpdate={setComponentDefinition} />
        ) : null}
        {activeTab === 'logic' ? (
          <section className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <span className="font-medium">Formula ↔ Blockly semantic sync:</span>{' '}
              {logicIsSynchronized ? (
                <span className="font-semibold text-emerald-700">Synchronized via PBMP Logic Model</span>
              ) : (
                <span className="font-semibold text-amber-700">Pending synchronization</span>
              )}
            </div>
            <FormulaEditor
              formula={formulaDraft}
              onFormulaChange={setFormulaDraft}
              onApplyFormula={applyFormulaChanges}
              errorMessage={formulaError}
            />
            <BlocklyEditor
              workspaceState={blocklyState}
              stateRevision={blocklyRevision}
              onWorkspaceChange={handleBlocklyChange}
            />
          </section>
        ) : null}
        {activeTab === 'preview' ? (
          <ExecutePanel
            component={componentDefinition}
            selectedRoleId={selectedRoleId}
            selectedChannelId={selectedChannelId}
            onRoleChange={setSelectedRoleId}
            onChannelChange={setSelectedChannelId}
            number1={number1}
            number2={number2}
            onNumber1Change={setNumber1}
            onNumber2Change={setNumber2}
            onExecute={() => executeMutation.mutate()}
            isExecuting={executeMutation.isPending}
            executionResult={executionResult}
            visibleOutputFields={visibleOutputFields}
            accessMessage={accessMessage}
            contentPreview={contentPreview}
            transportableMessagePreview={transportableMessagePreview}
          />
        ) : null}
        {activeTab === 'inspector' ? (
          <JsonInspector component={componentDefinition} logicModel={logicModel} blocklyState={blocklyState} />
        ) : null}
      </div>
    </main>
  )
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export default App
