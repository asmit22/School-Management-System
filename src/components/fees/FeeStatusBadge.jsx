const STATUS_CONFIG = {
  paid: { label: 'Paid', dot: 'bg-status-paid', text: 'text-status-paid' },
  partial: { label: 'Partial', dot: 'bg-status-partial', text: 'text-status-partial' },
  pending: { label: 'Pending', dot: 'bg-status-pending', text: 'text-status-pending' },
}

export default function FeeStatusBadge({ status, compact = false }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending

  if (compact) {
    return <span className={`inline-block h-2.5 w-2.5 rounded-full ${config.dot}`} aria-label={config.label} title={config.label} />
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.text}`}>
      <span className={`h-2 w-2 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  )
}
