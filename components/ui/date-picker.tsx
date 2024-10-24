import React from 'react'
import { Input } from './input'

interface DatePickerProps {
  onChange: (date: Date) => void
  required?: boolean
}

export const DatePicker: React.FC<DatePickerProps> = ({ onChange, required }) => {
  return (
    <Input
      type="date"
      onChange={(e) => onChange(new Date(e.target.value))}
      required={required}
    />
  )
}
