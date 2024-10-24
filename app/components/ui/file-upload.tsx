import React from 'react'
import { Input } from './input'

interface FileUploadProps {
  onUpload: (files: FileList) => void
  multiple?: boolean
  accept?: string
  maxSize?: number
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, multiple, accept, maxSize }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpload(e.target.files)
    }
  }

  return (
    <Input
      type="file"
      onChange={handleChange}
      multiple={multiple}
      accept={accept}
    />
  )
}
