import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../layout/Layout';

const TaskManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    taskName: '',
    deadline: '',
    description: ''
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please sign in');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/employee/getEmployee', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(response.data.filter(emp => emp.status === 'Active'));
      } catch (error) {
        toast.error('There is at least one employee in inactive status!');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(
            `http://localhost:5000/api/task?userId=${selectedEmployee.id}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          setTasks(response.data);
        } catch (error) {
          toast.error('Failed to fetch tasks');
        }
      };

      fetchTasks();
    }
  }, [selectedEmployee]);

  const handleAssignClick = (employee) => {
    setSelectedEmployee(employee);
    setTaskData({ taskName: '', deadline: '', description: '' });
    setTaskModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/task',
        {
          userId: selectedEmployee.id,
          taskName: taskData.taskName,
          deadline: taskData.deadline,
          description: taskData.description
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success(`Task assigned to ${selectedEmployee.name}`);
      setTaskModalOpen(false);

      const response = await axios.get(
        `http://localhost:5000/api/task?userId=${selectedEmployee.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to assign task');
    }
  };

  if (loading) {
    return <Layout><div className="p-6">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Employee Task Assignment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="border p-4 rounded-xl shadow hover:shadow-md transition cursor-pointer"
              onClick={() => handleAssignClick(employee)}
            >
              <h3 className="text-lg font-medium">{employee.name}</h3>
              <p className="text-sm text-gray-500">{employee.email}</p>
            </div>
          ))}
        </div>

        {taskModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-2xl">
              <h2 className="text-xl font-semibold mb-4">
                Assign Task to <span className="text-blue-600">{selectedEmployee.name}</span>
              </h2>
              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Task Name</label>
                  <input
                    type="text"
                    name="taskName"
                    value={taskData.taskName}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={taskData.deadline}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={taskData.description}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-2 rounded-lg"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setTaskModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Assign Task
                  </button>
                </div>
              </form>
              {tasks.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Assigned Tasks</h3>
                  <ul className="space-y-2">
                    {tasks.map((task) => (
                      <li key={task.taskId} className="border p-2 rounded-lg">
                        <p><strong>{task.taskName}</strong> - {task.status}</p>
                        <p className="text-sm text-gray-500">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                        <p className="text-sm">{task.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TaskManagement;