interface TabsProps {
  items: Array<{ id: string; label: string }>
  activeId: string
  onChange: (tabId: string) => void
}

export function Tabs({ items, activeId, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
