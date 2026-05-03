export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-6 h-6 border-2', md: 'w-10 h-10 border-4', lg: 'w-14 h-14 border-4' };
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizeClasses[size]} border-slate-200 border-t-primary-500 rounded-full animate-spin`} />
    </div>
  );
}
