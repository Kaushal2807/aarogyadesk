interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export default function TableSkeleton({ rows = 5, cols = 5, className = '' }: TableSkeletonProps) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            {Array.from({ length: cols }).map((_, c) => (
              <th key={c} className="py-3.5 px-4 text-left">
                <div className="h-4 bg-slate-200/80 rounded animate-pulse w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="animate-pulse">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="py-3.5 px-4">
                  <div 
                    className="h-4 bg-slate-200/70 rounded" 
                    style={{ width: c === 0 ? '70%' : c === cols - 1 ? '45%' : '85%' }} 
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
