interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'count';
  className?: string;
}

const variantClasses: Record<string, string> = {
  success: 'bg-success-gradient text-white shadow-[0_2px_4px_rgba(16,185,129,0.3)]',
  warning: 'bg-warning-gradient text-white shadow-[0_2px_4px_rgba(245,158,11,0.3)]',
  danger: 'bg-danger-gradient text-white shadow-[0_2px_4px_rgba(239,68,68,0.3)]',
  info: 'bg-primary-gradient text-white shadow-[0_2px_4px_rgba(99,102,241,0.3)]',
  primary: 'bg-primary-gradient text-white shadow-[0_2px_4px_rgba(99,102,241,0.3)]',
  count: 'bg-primary-gradient text-white shadow-[0_2px_4px_rgba(99,102,241,0.3)]',
};

export default function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-[20px] text-xs font-semibold tracking-wide ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
