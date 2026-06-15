import styles from './CheckboxField.module.css'

interface CheckboxFieldProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function CheckboxField({
  label,
  description,
  checked,
  onChange,
  className = '',
}: CheckboxFieldProps) {
  return (
    <label className={`${styles.row} ${className}`}>
      <input
        type='checkbox'
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className={styles.input}
      />
      <span className={styles.textGroup}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
    </label>
  )
}
