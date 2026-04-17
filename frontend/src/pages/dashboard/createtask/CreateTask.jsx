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
      
      window.location.reload();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create task");
      console.error(error.response?.data?.message)
    }
  };

  useEffect(() => {

  },[URL])
  return (
    <div className="task-container">
      <div className="task-form-container">
        <div className="task-form-header">
          <div>
            <h2>Create Task</h2>
            <p className="task-form-subtitle">Plan your next action with clear deadlines.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddTask(false)}
            className="task-cancel-icon"
            aria-label="Close task form"
          >
            <MdOutlineCancel />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="field-group">
            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              name="title"
              placeholder="Ex: Morning cardio and stretching"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="task-start-time">Start Time</label>
              <input
                id="task-start-time"
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="task-end-time">End Time</label>
              <input
                id="task-end-time"
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="task-proof">Proof</label>
            <input
              id="task-proof"
              type="text"
              name="proof"
              placeholder="URL, notes, or evidence details"
              value={formData.proof}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label htmlFor="task-punishment">Punishment Description</label>
            <input
              id="task-punishment"
              type="text"
              name="punishment"
              placeholder="What happens if task is missed?"
              value={formData.punishment}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label htmlFor="task-punishment-duration">Punishment Duration (minutes)</label>
            <input
              id="task-punishment-duration"
              type="number"
              name="punishmentDuration"
              placeholder="Ex: 20"
              value={formData.punishmentDuration}
              onChange={handleChange}
            />
          </div>

          <label className="checkbox-row">
            <span>Reviewed by AI</span>
            <input
              type="checkbox"
              name="reviewedByAI"
              checked={formData.reviewedByAI}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Create Task</button>
        </form>
        {message && <p className="task-message">{message}</p>}
      </div>
    </div>
  );
};

export default CreateTask;