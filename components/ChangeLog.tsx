import React from 'react'

interface Change {
  field: string
  oldValue: any
  newValue: any
  changedBy: string
  changedAt: Date
}

interface ChangeLogProps {
  changes: Change[]
}

const ChangeLog: React.FC<ChangeLogProps> = ({ changes }) => {
  return (
    <div className="space-y-4">
      {changes.map((change, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-lg">
          <p className="font-semibold">{change.field} changed</p>
          <p>From: {JSON.stringify(change.oldValue)}</p>
          <p>To: {JSON.stringify(change.newValue)}</p>
          <p className="text-sm text-gray-500">
            Changed by {change.changedBy} on {change.changedAt.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}

export default ChangeLog
