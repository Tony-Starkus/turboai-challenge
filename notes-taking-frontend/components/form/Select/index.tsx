import React, { useEffect, useRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'w-full rounded-sm border border-caramel bg-transparent text-ink outline-none transition-colors focus:ring-2 focus:ring-caramel/20 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'py-[7px] px-[12px] text-sm',
        md: 'py-[7px] px-[15px] text-base',
        lg: 'py-3 px-4 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
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

interface SelectOptionProps {
  value: string;
  children: React.ReactNode;
}

export const Option: React.FC<SelectOptionProps> = () => null;

interface SelectProps extends VariantProps<typeof selectVariants> {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  placeholder,
  children,
  size,
  fullWidth,
  error,
  disabled,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const parsedOptions: Array<{ value: string; node: React.ReactNode }> = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    // Accept our Option component or any element with a "value" prop
    const childValue = child.props?.value;
    if (typeof childValue === 'string') {
      parsedOptions.push({ value: childValue, node: child.props.children });
    }
  });

  const selected = parsedOptions.find((o) => o.value === value);

  return (
    <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto')} ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        disabled={disabled}
        className={cn(selectVariants({ size, fullWidth, error }), className, 'flex items-center justify-between')}
      >
        <div className="flex items-center gap-3 overflow-hidden text-ellipsis">
          {selected ? (
            <span className="flex items-center gap-3">{selected.node}</span>
          ) : (
            <span className="text-ink-soft">{placeholder ?? 'Select...'}</span>
          )}
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-3 h-4 w-4 text-ink-soft"
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-sm border border-border bg-white shadow-lg"
        >
          {parsedOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
              className={cn(
                'w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3',
                opt.value === value ? 'bg-gray-100' : '',
              )}
            >
              <div className="flex items-center gap-3">{opt.node}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
