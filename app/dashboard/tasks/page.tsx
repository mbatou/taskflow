"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Drawer } from "vaul"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

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
      const response = await fetch(`/api/tasks?id=${editTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTask.title,
          department: editTask.department,
          taskType: editTask.taskType,
          status: editTask.status,
          deadline: editTask.deadline,
          assignedTo: editTask.assignedTo.id, // Ensure this is a string
        }),
      });

      if (response.ok) {
        fetchTasks();
        setSelectedTaskId(null);
      } else {
        console.error("Failed to update task", await response.json());
      }
    } catch (error) {
      console.error("Error updating task:", error);
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
            {tasks.map((task) => (
              <TableRow key={task.id} className={task.status === "Overdue" ? "bg-red-100" : ""}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.department}</TableCell>
                <TableCell>{task.taskType}</TableCell>
                <TableCell>{task.assignedTo?.name || 'Unassigned'}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{new Date(task.deadline).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="flex space-x-2">
                  <Drawer.Root>
                    <Drawer.Trigger asChild>
                      <Button onClick={() => { setEditTask(task); setSelectedTaskId(task.id); }}>View/Edit</Button>
                    </Drawer.Trigger>
                    <Drawer.Portal>
                      <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                      <Drawer.Content className="bg-zinc-100 flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 right-0 w-[400px]">
                        <div className="p-4 bg-white rounded-t-[10px] flex-1 overflow-auto">
                          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
                          <div className="max-w-md mx-auto">
                            {editTask && (
                              <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
                                <div className="mb-4">
                                  <label className="block text-sm font-medium">Title</label>
                                  <p>{editTask.title}</p>
                                </div>
                                <div className="mb-4">
                                  <label className="block text-sm font-medium">Department</label>
                                  <p>{editTask.department}</p>
                                </div>
                                <div className="mb-4">
                                  <label className="block text-sm font-medium">Task Type</label>
                                  <p>{editTask.taskType}</p>
                                </div>
                                <div className="mb-4">
                                  <label className="block text-sm font-medium">Status</label>
                                  <Select value={editTask.status} onValueChange={(value) => setEditTask({ ...editTask, status: value })}>
                                    <SelectTrigger>{editTask.status}</SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Pending">Pending</SelectItem>
                                      <SelectItem value="In Progress">In Progress</SelectItem>
                                      <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="mb-4">
                                  <label className="block text-sm font-medium">Due Date</label>
                                  <input
                                    type="date"
                                    value={new Date(editTask.deadline).toISOString().split('T')[0]}
                                    onChange={(e) => setEditTask({ ...editTask, deadline: e.target.value })}
                                    className="border rounded p-2 w-full"
                                  />
                                </div>
                                <div className="mb-4">
                                  <label className="block text-sm font-medium">Assignee</label>
                                  <select
                                    value={editTask.assignedTo.id}
                                    onChange={(e) => setEditTask({ ...editTask, assignedTo: { id: e.target.value, name: users.find(user => user.id === e.target.value)?.name || '' } })}
                                    className="border rounded p-2 w-full"
                                  >
                                    {users.map(user => (
                                      <option key={user.id} value={user.id}>
                                        {user.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="mb-4">
                                  <label className="block text-sm font-medium">Created Date</label>
                                  <p>{new Date(editTask.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                  <Button onClick={() => setSelectedTaskId(null)}>Cancel</Button>
                                  <Button type="submit" className="bg-blue-500 text-white">Save</Button>
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
            ))}
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
