export type Department = 'Finance' | 'Marketing & Strategy' | 'Operations' | 'Administration' | 'Graphic Design'
export type UserRole = 'Administrator' | 'Department Manager' | 'Employee'
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue'

export interface User {
  id: string
  email: string
  name: string
  department: Department
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description: string
  department: Department
  assignedTo: string | null
  createdBy: string
  status: TaskStatus
  deadline: Date
  attachments: string[]
  slaBreached: boolean
  createdAt: Date
  updatedAt: Date
}