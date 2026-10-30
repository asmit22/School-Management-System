const inputClass =
  'rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-registry'

export default function StudentFilter({ filters, onChange }) {
  const update = (field) => (event) => {
    const value = event.target.value
    onChange({ ...filters, [field]: value || undefined })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        placeholder="Search name or admission #"
        value={filters.search || ''}
        onChange={update('search')}
        className={`${inputClass} w-64`}
      />
      <input
        placeholder="Class"
        value={filters.class || ''}
        onChange={update('class')}
        className={`${inputClass} w-24`}
      />
      <input
        placeholder="Section"
        value={filters.section || ''}
        onChange={update('section')}
        className={`${inputClass} w-24`}
      />
      <select
        value={filters.isActive === undefined ? '' : String(filters.isActive)}
        onChange={(event) =>
          onChange({
            ...filters,
            isActive: event.target.value === '' ? undefined : event.target.value === 'true',
          })
        }
        className={inputClass}
      >
        <option value="">All statuses</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>
  )
}
