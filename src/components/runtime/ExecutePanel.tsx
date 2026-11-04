import type { PBMPComponentDefinition, PBMPFormDefinition } from '../../domain/pbmp/types'
import type { PBMPExecutionResult } from '../../domain/logic/evaluator'

interface ExecutePanelProps {
  component: PBMPComponentDefinition
  selectedRoleId: string
  selectedChannelId: string
  onRoleChange: (roleId: string) => void
  onChannelChange: (channelId: string) => void
  number1: string
  number2: string
  onNumber1Change: (value: string) => void
  onNumber2Change: (value: string) => void
  onExecute: () => void
  isExecuting: boolean
  executionResult: PBMPExecutionResult | null
  visibleOutputFields: string[]
  accessMessage: string | null
  contentPreview: unknown
  transportableMessagePreview: unknown
}

export function ExecutePanel({
  component,
  selectedRoleId,
  selectedChannelId,
  onRoleChange,
  onChannelChange,
  number1,
  number2,
  onNumber1Change,
  onNumber2Change,
  onExecute,
  isExecuting,
  executionResult,
  visibleOutputFields,
  accessMessage,
  contentPreview,
  transportableMessagePreview,
}: ExecutePanelProps) {
  const activeForm =
    component.capabilities.forms.find((form) => form.channelId === selectedChannelId) ?? null
  const isMobile = activeForm?.structure.layout === 'vertical'

  return (
    <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Preview / Execute</h2>
        <p className="mt-1 text-sm text-slate-600">
          Shared logic + shared data model with channel-specific form structure and style.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Role
          <select
            value={selectedRoleId}
            onChange={(event) => onRoleChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {component.capabilities.roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Channel
          <select
            value={selectedChannelId}
            onChange={(event) => onChannelChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {component.capabilities.channels
              .filter((channel) => channel.exists)
              .map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
          </select>
        </label>
      </div>

      {activeForm ? (
        <FormPreview
          form={activeForm}
          isMobile={isMobile}
          number1={number1}
          number2={number2}
          onNumber1Change={onNumber1Change}
          onNumber2Change={onNumber2Change}
          onExecute={onExecute}
          isExecuting={isExecuting}
          result={executionResult?.output.Result}
          accessMessage={accessMessage}
        />
      ) : (
        <div className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          No form configured for this channel. This is valid for non-UI pathways (for example API).
        </div>
      )}

      <section className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-800">Output Entitlement View</h3>
        {!executionResult ? (
          <p className="mt-1 text-sm text-slate-600">Execute to inspect content/output rendering.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {visibleOutputFields.map((field) => (
              <li key={field}>
                <span className="font-medium">{field}</span>: {formatOutputValue(field, executionResult)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-800">Content → Format → Transportable Message</h3>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <pre className="max-h-56 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
            {JSON.stringify(contentPreview, null, 2)}
          </pre>
          <pre className="max-h-56 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
            {JSON.stringify(transportableMessagePreview, null, 2)}
          </pre>
        </div>
      </section>
    </section>
  )
}

function FormPreview({
  form,
  isMobile,
  number1,
  number2,
  onNumber1Change,
  onNumber2Change,
  onExecute,
  isExecuting,
  result,
  accessMessage,
}: {
  form: PBMPFormDefinition
  isMobile: boolean
  number1: string
  number2: string
  onNumber1Change: (value: string) => void
  onNumber2Change: (value: string) => void
  onExecute: () => void
  isExecuting: boolean
  result: unknown
  accessMessage: string | null
}) {
  const fieldClass = isMobile
    ? 'w-full rounded-md border border-slate-300 px-4 py-3 text-base'
    : 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm'

  return (
    <div
      className="rounded-lg border p-4"
      style={{
        borderColor: form.style.colors.primary,
        backgroundColor: form.style.colors.panel,
      }}
    >
      <h3 className="text-base font-semibold text-slate-900">{form.structure.sections[0]?.title}</h3>
      <div className={`mt-3 grid gap-3 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        <label className="text-sm font-medium text-slate-700">
          Number1
          <input
            type="number"
            value={number1}
            onChange={(event) => onNumber1Change(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Number2
          <input
            type="number"
            value={number2}
            onChange={(event) => onNumber2Change(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Result
          <input type="text" value={result == null ? '' : String(result)} readOnly className={fieldClass} />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onExecute}
          disabled={Boolean(accessMessage) || isExecuting}
          className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: form.style.colors.primary }}
        >
          {isExecuting ? 'Executing...' : 'Add Numbers'}
        </button>
        {accessMessage ? <span className="text-sm text-amber-700">{accessMessage}</span> : null}
      </div>
    </div>
  )
}

function formatOutputValue(field: string, result: PBMPExecutionResult): string {
  if (field === 'result') {
    return String(result.output.Result ?? '')
  }
  if (field === 'status') {
    return result.status
  }
  if (field === 'diagnostics') {
    return result.diagnostics.length ? result.diagnostics.join('; ') : 'none'
  }
  return ''
}
