import React, { useEffect, useState, useContext } from "react";
import { MdOutlineCancel } from "react-icons/md";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import './CreateTask.css'
import { TaskContext } from "../../../context/TaskContext";

const CreateTask = () => {
  const { user } = useContext(AuthContext);
  const { URL, showAddTask, setShowAddTask } = useContext(TaskContext);
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    status: "upcoming",
    proof: "",
    punishment: "",
    punishmentDuration: "",
    reviewedByAI: false,
  });

  useEffect(() => {
    showAddTask
      ? document.body.style.overflow = "hidden"
      : document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showAddTask]);

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return setMessage("User not found");

    try {
      
      const today = new Date().toISOString().split("T")[0]; 
      
      const startTime = new Date(`${today}T${formData.startTime}:00`);
      
      const endTime = new Date(`${today}T${formData.endTime}:00`);
      
      
      const payload = {
        ...formData,
        startTime,
        endTime,
      }
      
      
      
      
      const res = await axios.post(
        `${URL}/api/task/create/${user.id}`,
        formData
      );
      setMessage(res.data.message);
      setFormData({
        title: "",
        startTime: "",
        endTime: "",
        durationMinutes: "",
        status: "pending",
        proof: "",
        punishment: "",
        punishmentDuration: "",
        reviewedByAI: false,
      });

      setShowAddTask(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create task");
      console.error(error.response?.data?.message)
    }
  };

  return (
    <div className="task-container">
      <div className="task-form-container">
        <div className="task-form-header">
          <h2>Create New Task</h2>
          <h2 onClick={() => setShowAddTask(false)} className="task-cancel-icon"><MdOutlineCancel /></h2>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <label>
            Start Time
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
           </label>
          <label>End Time 
           <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
          </label>
         
          <input
            type="text"
            name="proof"
            placeholder="Proof (URL or text)"
            value={formData.proof}
            onChange={handleChange}
          />
          <input
            type="text"
            name="punishment"
            placeholder="Punishment description"
            value={formData.punishment}
            onChange={handleChange}
          />
          <input
            type="number"
            name="punishmentDuration"
            placeholder="Punishment duration (minutes)"
            value={formData.punishmentDuration}
            onChange={handleChange}
          />
          <label>
            Reviewed by AI?
            <input
              type="checkbox"
              name="reviewedByAI"
              checked={formData.reviewedByAI}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Create Task</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default CreateTask;