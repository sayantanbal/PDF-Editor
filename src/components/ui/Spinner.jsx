import React from 'react';
import { cn } from '../../utils';

export const Spinner = React.forwardRef(({ className, size = 'default', ...props }, ref) => {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizes[size],
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
});

Spinner.displayName = 'Spinner';

export default Spinner;
