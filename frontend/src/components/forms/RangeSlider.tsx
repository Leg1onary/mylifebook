import styles from './RangeSlider.module.css'

interface RangeSliderProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  /** CSS color string — e.g. 'var(--color-primary)' */
  color?: string
  onChange: (value: number) => void
  /** Show numeric value next to label */
  showValue?: boolean
  className?: string
}

export function RangeSlider({
  label,
  value,
  min = 0,
  max = 10,
  step = 1,
  color,
  onChange,
  showValue = true,
  className = '',
}: RangeSliderProps) {
  return (
    <div className={`${styles.row} ${className}`}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {showValue && (
          <span className={styles.value} style={color ? { color } : undefined}>
            {value}
          </span>
        )}
      </div>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        className='slider'
        style={color ? ({ '--slider-color': color } as React.CSSProperties) : undefined}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <div className={styles.ticks}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
