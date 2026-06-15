import styles from './TagPicker.module.css'

interface TagPickerProps {
  label?: string
  options: string[]
  /** Currently selected values (multi-select) */
  value: string[]
  onChange: (value: string[]) => void
  /** Max number of selectable tags. Defaults to unlimited */
  max?: number
  className?: string
}

export function TagPicker({
  label,
  options,
  value,
  onChange,
  max,
  className = '',
}: TagPickerProps) {
  function toggle(tag: string) {
    if (value.includes(tag)) {
      onChange(value.filter(v => v !== tag))
    } else {
      if (max && value.length >= max) return
      onChange([...value, tag])
    }
  }

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.chips} role='group' aria-label={label}>
        {options.map(opt => (
          <button
            key={opt}
            type='button'
            role='checkbox'
            aria-checked={value.includes(opt)}
            className={`${styles.chip} ${value.includes(opt) ? styles.chipActive : ''}`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Single-select variant — selects one tag at a time */
interface SingleTagPickerProps extends Omit<TagPickerProps, 'value' | 'onChange' | 'max'> {
  value: string | undefined
  onChange: (value: string | undefined) => void
}

export function SingleTagPicker({ value, onChange, ...rest }: SingleTagPickerProps) {
  return (
    <TagPicker
      {...rest}
      value={value ? [value] : []}
      max={1}
      onChange={tags => onChange(tags[0])}
    />
  )
}
