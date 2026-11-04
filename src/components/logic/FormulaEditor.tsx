interface FormulaEditorProps {
  formula: string
  onFormulaChange: (value: string) => void
  onApplyFormula: () => void
  errorMessage: string | null
}

export function FormulaEditor({
  formula,
  onFormulaChange,
  onApplyFormula,
  errorMessage,
}: FormulaEditorProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-900">Formula View</h2>
      <p className="mt-1 text-sm text-slate-600">
        Non-technical authoring view (Excel-like). Parsed into canonical PBMP Logic Model.
      </p>
      <textarea
        value={formula}
        onChange={(event) => onFormulaChange(event.target.value)}
        className="mt-3 h-24 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onApplyFormula}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Apply Formula
        </button>
        {errorMessage ? <span className="text-sm text-red-600">{errorMessage}</span> : null}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Examples: <code>Result = Number1 + Number2</code> or <code>=Number1 + Number2</code>
      </p>
    </section>
  )
}
