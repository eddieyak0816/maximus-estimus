interface Props {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export default function FormField({ label, error, required, children, hint }: Props) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}
        {required && <span className="required-star"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
