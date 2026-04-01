import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full rounded-sm border border-caramel bg-transparent text-ink outline-none transition-colors placeholder:text-ink-soft focus:ring-2 focus:ring-caramel/20 focus:border-caramel disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'py-[7px] px-[15px] text-sm',
        md: 'py-[7px] px-[15px] text-base',
        lg: 'py-3 px-4 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      hasIconRight: {
        true: 'pr-10',
      },
      error: {
        true: 'border-red-500 focus:ring-red-500/20',
      },
    },
    defaultVariants: {
      size: 'md',
      fullWidth: true,
    },
  },
);

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {
  iconRight?: React.ReactNode;
}

const TextField: React.FC<InputProps> = ({ className, size, fullWidth, disabled, error, iconRight, ...props }) => {
  return (
    <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto')}>
      <input
        className={cn(
          inputVariants({
            size,
            fullWidth,
            hasIconRight: !!iconRight,
            error,
          }),
          className,
        )}
        disabled={disabled}
        {...props}
      />

      {iconRight && <div className="absolute inset-y-0 right-4 flex items-center text-caramel">{iconRight}</div>}
    </div>
  );
};

export default TextField;
