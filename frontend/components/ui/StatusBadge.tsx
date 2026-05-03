interface StatusBadgeProps {
  status: 'paid' | 'partial' | 'pending';
}

const statusClasses: Record<string, string> = {
  paid: 'bg-success-gradient text-white',
  partial: 'bg-warning-gradient text-white',
  pending: 'bg-danger-gradient text-white',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold capitalize shadow-sm ${statusClasses[status]}`}>
      {status}
    </span>
  );
}
