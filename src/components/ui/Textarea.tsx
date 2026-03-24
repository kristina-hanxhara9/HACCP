import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-[#0f172a]">
            {label}
            {props.required && <span className="text-[#dc2626] ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a5c35] focus:border-transparent resize-y min-h-[80px] ${error ? 'border-[#dc2626] bg-[#fef2f2]' : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
