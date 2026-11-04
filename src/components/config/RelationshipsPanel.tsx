import type { PBMPComponentDefinition } from '../../domain/pbmp/types'

interface RelationshipsPanelProps {
  component: PBMPComponentDefinition
}

export function RelationshipsPanel({ component }: RelationshipsPanelProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Relationship Taxonomy</h2>
        <p className="mt-1 text-sm text-slate-600">
          Relationships are modeled separately from core anatomy and classified hierarchically.
        </p>
        <pre className="mt-3 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
{`Relationship
├── Structural
│   ├── Whole-Part
│   │   ├── Composition
│   │   └── Aggregation
│   └── Association
├── Taxonomic
│   └── Generalization / Specialization
├── Realization
└── Dependency
    ├── Requires
    ├── Uses
    └── Depends On`}
        </pre>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Modeled Relationships</h2>
        <div className="mt-4 space-y-3">
          {component.relationships.map((relationship) => (
            <article key={relationship.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm text-slate-800">
                <span className="font-semibold">{relationship.sourceLabel}</span> —{' '}
                <span className="italic">{relationship.relationshipVerb}</span> →{' '}
                <span className="font-semibold">{relationship.targetLabel}</span>
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Category: {relationship.type.category} · Family: {relationship.type.family} · Variant:{' '}
                {relationship.type.variant} · Scope: {relationship.scope}
              </p>
              {relationship.notes ? <p className="mt-1 text-xs text-slate-500">{relationship.notes}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
