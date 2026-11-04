import type {
  PBMPChannel,
  PBMPComponentDefinition,
  PBMPRoleAccessRule,
} from '../../domain/pbmp/types'

interface CapabilitiesPanelProps {
  component: PBMPComponentDefinition
  onUpdate: (next: PBMPComponentDefinition) => void
}

export function CapabilitiesPanel({ component, onUpdate }: CapabilitiesPanelProps) {
  const updateRule = (ruleId: string, changes: Partial<PBMPRoleAccessRule>) => {
    const updatedRules = component.capabilities.roleAccessRules.map((rule) =>
      composeRuleId(rule) === ruleId ? { ...rule, ...changes } : rule,
    )
    onUpdate({
      ...component,
      capabilities: {
        ...component.capabilities,
        roleAccessRules: updatedRules,
      },
    })
  }

  const updateChannel = (channelId: string, changes: Partial<PBMPChannel>) => {
    const updatedChannels = component.capabilities.channels.map((channel) =>
      channel.id === channelId ? { ...channel, ...changes } : channel,
    )
    onUpdate({
      ...component,
      capabilities: {
        ...component.capabilities,
        channels: updatedChannels,
      },
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Roles & Access</h2>
        <p className="mt-1 text-sm text-slate-600">
          Role → Channel → Output entitlement is configuration-driven.
        </p>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Execute</th>
                <th className="px-2 py-2">Channel</th>
                <th className="px-2 py-2">Output Set</th>
              </tr>
            </thead>
            <tbody>
              {component.capabilities.roleAccessRules.map((rule) => {
                const role = component.capabilities.roles.find((candidate) => candidate.id === rule.roleId)
                const channel = component.capabilities.channels.find(
                  (candidate) => candidate.id === rule.channelId,
                )
                const outputSet = component.capabilities.outputSets.find(
                  (candidate) => candidate.id === rule.outputSetId,
                )
                const rowId = composeRuleId(rule)
                return (
                  <tr key={rowId} className="border-b border-slate-100">
                    <td className="px-2 py-2 text-slate-800">{role?.name ?? rule.roleId}</td>
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={rule.executeAllowed}
                        onChange={(event) =>
                          updateRule(rowId, {
                            executeAllowed: event.target.checked,
                          })
                        }
                      />
                    </td>
                    <td className="px-2 py-2 text-slate-700">{channel?.name ?? rule.channelId}</td>
                    <td className="px-2 py-2 text-slate-700">{outputSet?.name ?? rule.outputSetId}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Channels</h2>
        <p className="mt-1 text-sm text-slate-600">
          Channel exists independently from UI and has availability/state/access properties.
        </p>
        <div className="mt-3 grid gap-3">
          {component.capabilities.channels.map((channel) => (
            <article key={channel.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <h3 className="text-sm font-semibold text-slate-800">{channel.name}</h3>
              <p className="mt-1 text-xs text-slate-600">{channel.description}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <SelectField
                  label="Availability"
                  value={channel.availability}
                  onChange={(value) => updateChannel(channel.id, { availability: value as PBMPChannel['availability'] })}
                  options={['available', 'unavailable']}
                />
                <SelectField
                  label="State"
                  value={channel.state}
                  onChange={(value) => updateChannel(channel.id, { state: value as PBMPChannel['state'] })}
                  options={['open', 'closed']}
                />
                <SelectField
                  label="Access"
                  value={channel.access}
                  onChange={(value) => updateChannel(channel.id, { access: value as PBMPChannel['access'] })}
                  options={['accessible', 'restricted']}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Messaging, Content, Form, Media</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>
            <span className="font-medium">Messaging:</span>{' '}
            {component.capabilities.messaging.map((message) => message.meaning).join(' | ')}
          </li>
          <li>
            <span className="font-medium">Content Structure Root:</span>{' '}
            {component.capabilities.contentStructures[0]?.root.name}
          </li>
          <li>
            <span className="font-medium">Format:</span>{' '}
            {component.capabilities.formats.map((format) => format.name).join(', ')}
          </li>
          <li>
            <span className="font-medium">Form Variants:</span>{' '}
            {component.capabilities.forms.map((form) => form.name).join(', ')}
          </li>
          <li>
            <span className="font-medium">Media Classification Root:</span>{' '}
            {component.capabilities.mediaClassifications[0]?.root.name}
          </li>
        </ul>
      </section>
    </div>
  )
}

function composeRuleId(rule: PBMPRoleAccessRule): string {
  return `${rule.roleId}-${rule.channelId}-${rule.outputSetId}`
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="text-xs font-medium text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
