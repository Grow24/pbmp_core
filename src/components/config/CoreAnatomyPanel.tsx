import type { PBMPComponentDefinition } from '../../domain/pbmp/types'

interface CoreAnatomyPanelProps {
  component: PBMPComponentDefinition
  onUpdate: (next: PBMPComponentDefinition) => void
}

export function CoreAnatomyPanel({ component, onUpdate }: CoreAnatomyPanelProps) {
  const intention = component.why.intentions[0]

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">WHAT</h2>
        <p className="mt-1 text-sm text-slate-600">
          Defines what the component is (identity, classification, ownership, and IO contract).
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <LabeledInput
            label="Component Name"
            value={component.what.name}
            onChange={(value) =>
              onUpdate({
                ...component,
                what: { ...component.what, name: value },
              })
            }
          />
          <LabeledInput
            label="GEMID"
            value={component.what.gemId}
            onChange={(value) =>
              onUpdate({
                ...component,
                what: { ...component.what, gemId: value },
              })
            }
          />
          <LabeledInput
            label="Version"
            value={component.what.version}
            onChange={(value) =>
              onUpdate({
                ...component,
                what: { ...component.what, version: value },
              })
            }
          />
          <LabeledInput
            label="Status"
            value={component.what.status}
            onChange={(value) =>
              onUpdate({
                ...component,
                what: { ...component.what, status: value },
              })
            }
          />
          <label className="md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
            <textarea
              value={component.what.description}
              onChange={(event) =>
                onUpdate({
                  ...component,
                  what: { ...component.what, description: event.target.value },
                })
              }
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">WHY</h2>
        <p className="mt-1 text-sm text-slate-600">
          Intention and enabled process remain separate from component anatomy.
        </p>
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Intention</span>
          <textarea
            value={intention?.statement ?? ''}
            onChange={(event) =>
              onUpdate({
                ...component,
                why: {
                  ...component.why,
                  intentions: [{ ...(intention ?? { id: 'intention', statement: '' }), statement: event.target.value }],
                },
              })
            }
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-3 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Enabled Processes:</span>{' '}
          {component.processes.map((process) => process.name).join(', ')}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">HOW</h2>
        <p className="mt-1 text-sm text-slate-600">
          Structure and behavior definitions are configuration objects, independent of UI rendering.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DefinitionList
            title="Structure"
            items={[
              `Inputs: ${component.how.structure.inputs.map((item) => item.name).join(', ')}`,
              `Outputs: ${component.how.structure.outputs.map((item) => item.name).join(', ')}`,
              `Interfaces: ${component.how.structure.interfaces.join(', ')}`,
            ]}
          />
          <DefinitionList
            title="Behavior"
            items={[
              `Logic model: ${component.how.behavior.logicModelId}`,
              `Functions: ${component.how.behavior.functions.join(', ')}`,
              `Rules: ${component.how.behavior.rules.join(', ')}`,
            ]}
          />
        </div>
      </section>
    </div>
  )
}

function DefinitionList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
    </label>
  )
}
