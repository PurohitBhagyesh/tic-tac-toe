import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary', // 'primary', 'secondary', 'accent', 'danger', 'icon'
  size = 'md', // 'sm', 'md', 'lg', 'block'
  disabled = false,
  className = '',
  icon: Icon = null,
  type = 'button',
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary': return 'btn-secondary';
      case 'accent': return 'btn-accent';
      case 'danger': return 'btn-danger';
      case 'icon': return 'btn-icon';
      case 'primary':
      default: return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    if (size === 'lg') return 'btn-lg';
    if (size === 'block') return 'btn-block';
    return '';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default Button;
