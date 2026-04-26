export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '',
  ...props 
}) {
  const baseStyles = 'font-semibold rounded transition flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-primary hover:bg-red-600 text-white disabled:bg-gray-400',
    secondary: 'bg-secondary hover:bg-orange-600 text-white disabled:bg-gray-400',
    outline: 'border-2 border-primary text-primary hover:bg-red-50 disabled:border-gray-400 disabled:text-gray-400',
    ghost: 'text-primary hover:bg-red-50 disabled:text-gray-400',
    danger: 'bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-400',
    success: 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    full: 'w-full px-4 py-2 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}
