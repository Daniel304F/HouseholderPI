type ButtonProps = {
  title: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className: string }>;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  iconPosition?: 'left' | 'right';
  className?: string;
};

export const HouseHolderButton: React.FC<ButtonProps> = ({
  title,
  onClick,
  icon: Icon,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  iconPosition = 'left',
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm gap-1.5',
    medium: 'px-4 py-2 text-sm gap-2',
    large: 'px-6 py-3 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 focus:ring-blue-500 shadow-md hover:shadow-lg',
    secondary: 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 focus:ring-blue-500 shadow-sm hover:shadow-md',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 shadow-md hover:shadow-lg',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500 shadow-md hover:shadow-lg',
    warning: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 focus:ring-yellow-500 shadow-md hover:shadow-lg',
    outline: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-5 h-5'
  };

  const buttonClasses = [
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      type="button"
    >
      {Icon && iconPosition === 'left' && (
        <Icon className={iconSizes[size]} />
      )}
      <span>{title}</span>
      {Icon && iconPosition === 'right' && (
        <Icon className={iconSizes[size]} />
      )}
    </button>
  );
};
