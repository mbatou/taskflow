"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Drawer } from "vaul"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from "sonner"

const STATUS_OPTIONS = ["Opened", "In Progress", "Blocked", "Completed"]

interface Task {
  id: string;
  title: string;
  department: string;
  taskType: string;
  status: string;
  deadline: string;
  assignedTo: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function TasksOverview() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState({ status: "", department: "", taskType: "", deadline: "" })
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session, filter])

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('/api/users') // Adjust the endpoint as needed
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    }

    fetchUsers()
  }, [])

  const fetchTasks = async () => {
    const queryParams = new URLSearchParams(filter)
    const response = await fetch(`/api/tasks?${queryParams}`)
    if (response.ok) {
      const data = await response.json()
      setTasks(data)
    }
  }

  const handleDelete = async () => {
    if (!taskToDelete) return

    try {
      const response = await fetch(`/api/tasks?id=${taskToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskToDelete));
        setShowDeleteModal(false);
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEdit = async () => {
    if (!editTask) return

    try {
      // Create an object with only the fields that have changed
      const updatedFields = Object.keys(editTask).reduce((acc, key) => {
        const originalTask = tasks.find(t => t.id === editTask.id);
        if (!originalTask) return acc;

        switch (key) {
          case 'assignedTo':
            if (editTask.assignedTo && originalTask.assignedTo) {
              if (editTask.assignedTo.id !== originalTask.assignedTo.id) {
                acc.assignedTo = { id: editTask.assignedTo.id, name: editTask.assignedTo.name }; // Updated to match the structure
              }
            }
            break;
          case 'deadline':
            const date = new Date(editTask.deadline);
            if (!isNaN(date.getTime()) && date.toISOString() !== originalTask.deadline) {
              acc.deadline = date.toISOString();
            }
            break;
          default:
            if (key === 'assignedTo') {
              if (typeof editTask.assignedTo === 'object' && editTask.assignedTo !== null) {
                acc.assignedTo = editTask.assignedTo; // Ensure it's an object
              }
            } else if (editTask[key as keyof Task] !== originalTask[key as keyof Task]) {
              acc[key as keyof Task] = editTask[key as keyof Task] as any; // Use 'as any' to bypass type checking
            }
        }
        return acc;
      }, {} as Partial<Task>);

      // Only proceed with the update if there are changes
      if (Object.keys(updatedFields).length > 0) {
        const response = await fetch(`/api/tasks/${editTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFields),
        });

        if (response.ok) {
          fetchTasks();
          setIsDrawerOpen(false); // Close the drawer after successful edit
          toast.success("Task updated successfully");
          
          // If the assignee has changed, show a success message
          if (updatedFields.assignedTo) {
            toast.success(`Task assigned to ${editTask.assignedTo.name}`);
          }
        } else {
          console.error("Failed to update task", await response.json());
          toast.error("Failed to update task");
        }
      } else {
        setIsDrawerOpen(false); // Close the drawer if no changes were made
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Error updating task");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks Overview</CardTitle>
        <Button onClick={() => router.push('/tasks/create')}>New Task</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Task Type</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TableRow key={task.id} className={task.status === "Overdue" ? "bg-red-100" : ""}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.department}</TableCell>
                  <TableCell>{task.taskType}</TableCell>
                  <TableCell>{task.assignedTo?.name || 'Unassigned'}</TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell>{new Date(task.deadline).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                      <Drawer.Trigger asChild>
                        <Button onClick={() => { setEditTask(task); setSelectedTaskId(task.id); setIsDrawerOpen(true); }}>
                          View/Edit
                        </Button>
                      </Drawer.Trigger>
                      <Drawer.Portal>
                        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                        <Drawer.Content className="bg-gradient-to-br from-gray-900 to-black flex flex-col rounded-t-[20px] h-[96%] mt-24 fixed bottom-0 right-0 w-[450px] shadow-lg">
                          <div className="p-6 flex-1 overflow-auto">
                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-600 mb-8" />
                            <div className="max-w-md mx-auto">
                              {editTask && (
                                <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-6">
                                  <h2 className="text-2xl font-bold text-white mb-6">Edit Task</h2>
                                  
                                  <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                                    <p className="text-lg font-semibold text-white">{editTask.title}</p>
                                  </div>

                                  <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                                    <p className="text-lg text-white">{editTask.department}</p>
                                  </div>

                                  <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Task Type</label>
                                    <p className="text-lg text-white">{editTask.taskType}</p>
                                  </div>

                                  <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                    <Select value={editTask.status} onValueChange={(value) => setEditTask({ ...editTask, status: value })}>
                                      <SelectTrigger id="status" className="w-full bg-gray-700 text-white">
                                        {editTask.status}
                                      </SelectTrigger>
                                      <SelectContent className="bg-gray-700 text-white">
                                        {STATUS_OPTIONS.map((status) => (
                                          <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                                    <input
                                      id="dueDate"
                                      type="date"
                                      value={new Date(editTask.deadline).toISOString().split('T')[0]}
                                      onChange={(e) => setEditTask({ ...editTask, deadline: e.target.value })}
                                      className="border rounded p-2 w-full bg-gray-700 text-white focus:ring-2 focus:ring-gray-500"
                                    />
                                  </div>

                                  <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                                    <label htmlFor="assignee" className="block text-sm font-medium text-gray-300 mb-1">Assignee</label>
                                    <select
                                      id="assignee"
                                      value={editTask.assignedTo.id}
                                      onChange={(e) => setEditTask({ ...editTask, assignedTo: { id: e.target.value, name: users.find(user => user.id === e.target.value)?.name || '' } })}
                                      className="border rounded p-2 w-full bg-gray-700 text-white focus:ring-2 focus:ring-gray-500"
                                    >
                                      {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                          {user.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Created Date</label>
                                    <p className="text-lg text-white">{new Date(editTask.createdAt).toLocaleDateString()}</p>
                                  </div>

                                  <div className="flex justify-end space-x-3 mt-8">
                                    <Button 
                                      type="button"
                                      onClick={() => setIsDrawerOpen(false)} 
                                      className="bg-gray-600 text-white hover:bg-gray-700"
                                    >
                                      Cancel
                                    </Button>
                                    <Button type="submit" className="bg-black text-white hover:bg-gray-900">
                                      Save Changes
                                    </Button>
                                  </div>
                                </form>
                              )}
                            </div>
                          </div>
                        </Drawer.Content>
                      </Drawer.Portal>
                    </Drawer.Root>
                    <button className="delete-button" onClick={() => { setTaskToDelete(task.id); setShowDeleteModal(true); }}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No tasks available for now
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this task?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button onClick={handleDelete} className="bg-red-500 text-white">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
