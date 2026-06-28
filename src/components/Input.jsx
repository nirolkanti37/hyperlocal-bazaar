import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  type = 'text', 
  placeholder = '', 
  error = '', 
  leftIcon = null,
  rightIcon = null,
  helperText = '',
  className = '',
  textarea = false,
  rows = 4,
  ...props 
}, ref) => {
  const baseStyles = 'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500';
  const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-gray-300 hover:border-gray-400';
  const iconPadding = leftIcon ? 'pl-10' : 'pl-4';
  const rightPadding = rightIcon ? 'pr-10' : 'pr-4';

  const inputProps = {
    ref,
    className: `${baseStyles} ${errorStyles} ${iconPadding} ${rightPadding} py-2.5 text-base bg-white ${className}`,
    placeholder,
    ...props
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </span>
        )}
        {textarea ? (
          <textarea {...inputProps} rows={rows} />
        ) : (
          <input type={type} {...inputProps} />
        )}
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
