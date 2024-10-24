"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { toast } from "sonner"
import { X, Edit2, Save, Clock, User, FileText, Tag, CheckCircle, History } from "lucide-react"
import ChangeLog from "@/components/ChangeLog"

interface Task {
  id: string;
  title: string;
  description: string;
  department: string;
  taskType: string;
  status: string;
  deadline: string;
  assignedTo: {
    id: string;
    name: string;
  };
  createdAt: string;
  dynamicFields: any;
}

const STATUS_OPTIONS = ["Opened", "In Progress", "Blocked", "Completed"]

export default function TaskDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [task, setTask] = useState<Task | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [changeLog, setChangeLog] = useState<Array<{field: string, oldValue: any, newValue: any, changedBy: string, changedAt: Date}>>([])
  const [users, setUsers] = useState<{id: string, name: string}[]>([])
  const [countdown, setCountdown] = useState("")

  useEffect(() => {
    const fetchTask = async () => {
      const response = await fetch(`/api/tasks/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTask(data)
      } else {
        toast.error("Failed to fetch task details")
        router.push("/dashboard/tasks")
      }
    }

    const fetchUsers = async () => {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    }

    fetchTask()
    fetchUsers()
  }, [params.id, router])

  useEffect(() => {
    if (task) {
      const timer = setInterval(() => {
        const now = new Date()
        const deadline = new Date(task.deadline)
        const difference = deadline.getTime() - now.getTime()

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24))
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          setCountdown(`${days}d ${hours}h ${minutes}m`)
        } else {
          setCountdown("Overdue")
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [task])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!task) return

    const response = await fetch(`/api/tasks/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })

    if (response.ok) {
      setIsEditing(false)
      const updatedTask = await response.json()
      setTask(updatedTask)
      toast.success("Task updated successfully")
      
      // Log changes
      const changes = Object.keys(updatedTask).filter(key => updatedTask[key] !== task[key as keyof Task]).map(key => ({
        field: key,
        oldValue: task[key as keyof Task],
        newValue: updatedTask[key],
        changedBy: session?.user?.name || 'Unknown user',
        changedAt: new Date()
      }))
      setChangeLog([...changeLog, ...changes])
    } else {
      toast.error("Failed to update task")
    }
  }

  const handleChange = (field: string, value: any) => {
    if (task) {
      setTask({ ...task, [field]: value })
    }
  }

  if (!task) return <div>Loading...</div>

  const canEdit = session?.user?.role === "Admin" || session?.user?.role === "Department Manager"

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">{task.title}</h2>
        <div className="space-x-2">
          {canEdit && !isEditing && (
            <Button onClick={handleEdit}>
              <Edit2 className="h-4 w-4 mr-2" /> Edit
            </Button>
          )}
          <Button variant="ghost" onClick={() => router.push("/dashboard/tasks")}>
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Tag className="h-5 w-5 text-blue-500" />
          <span className="text-gray-600 font-medium">{task.taskType}</span>
        </div>

        <div className="flex items-center space-x-4">
          <FileText className="h-5 w-5 text-green-500" />
          {isEditing ? (
            <div className="flex-1">
              <Textarea
                value={task.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full"
              />
            </div>
          ) : (
            <div className="flex-1 flex justify-between items-center">
              <p className="text-gray-600">{task.description}</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <User className="h-5 w-5 text-purple-500" />
          {isEditing ? (
            <div className="flex-1">
              <Select
                value={task.assignedTo.id}
                onValueChange={(value) => handleChange('assignedTo', { id: value, name: users.find(u => u.id === value)?.name || '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assigned To" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex-1 flex justify-between items-center">
              <span className="text-gray-600">{task.assignedTo.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Clock className="h-5 w-5 text-yellow-500" />
          {isEditing ? (
            <div className="flex-1">
              <DatePicker
                date={new Date(task.deadline)}
                onDateChange={(date) => handleChange('deadline', date.toISOString())}
              />
            </div>
          ) : (
            <div className="flex-1 flex justify-between items-center">
              <span className="text-gray-600">{new Date(task.deadline).toLocaleDateString()}</span>
              <span className={`font-bold ${countdown === "Overdue" ? "text-red-500" : "text-green-500"}`}>
                {countdown}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <CheckCircle className="h-5 w-5 text-indigo-500" />
          {isEditing ? (
            <div className="flex-1">
              <Select
                value={task.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex-1 flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-sm font-semibold
                ${task.status === 'Completed' ? 'bg-green-200 text-green-800' :
                task.status === 'In Progress' ? 'bg-blue-200 text-blue-800' :
                task.status === 'Blocked' ? 'bg-red-200 text-red-800' :
                'bg-gray-200 text-gray-800'}`}>
                {task.status}
              </span>
            </div>
          )}
        </div>

        {/* Render dynamic fields */}
        {Object.entries(task.dynamicFields).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-4">
            <span className="text-gray-500 capitalize">{key}:</span>
            <span className="text-gray-600">{String(value)}</span>
          </div>
        ))}

        <div className="mt-6 text-sm text-gray-500">
          Created on: {new Date(task.createdAt).toLocaleString()}
        </div>

        {isEditing ? (
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        ) : null}

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <History className="h-5 w-5 mr-2" /> Change Log
          </h3>
          <ChangeLog changes={changeLog} />
        </div>
      </div>
    </div>
  )
}
