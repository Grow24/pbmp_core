import type { BlocklyWorkspaceState } from '../../domain/logic/blocklyAdapter'
import type { PBMPComponentDefinition, PBMPLogicModel } from '../../domain/pbmp/types'

interface JsonInspectorProps {
  component: PBMPComponentDefinition
  logicModel: PBMPLogicModel
  blocklyState: BlocklyWorkspaceState
}

export function JsonInspector({ component, logicModel, blocklyState }: JsonInspectorProps) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-900">JSON Inspector</h2>
      <p className="text-sm text-slate-600">
        Inspect transport/configuration objects directly (Component Definition, PBMP Logic Model, Blockly
        workspace state).
      </p>
      <JsonBlock title="Component Definition JSON" value={component} />
      <JsonBlock title="PBMP Logic JSON (canonical semantic model)" value={logicModel} />
      <JsonBlock title="Blockly Workspace JSON (authoring/editor state)" value={blocklyState} />
    </section>
  )
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <details className="rounded-md border border-slate-200 bg-slate-50 p-3" open>
      <summary className="cursor-pointer text-sm font-semibold text-slate-800">{title}</summary>
      <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  )
}
