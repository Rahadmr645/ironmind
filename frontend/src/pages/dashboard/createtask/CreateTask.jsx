import React, { useEffect,useState, useContext } from "react";
import { MdOutlineCancel } from "react-icons/md";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext"; 
import './CreateTask.css'

const CreateTask = () => {
  const { user,URL,showAddTask, setShowAddTask } = useContext(AuthContext);
  const [formData, setFormData] = useState({
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
        <input
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="durationMinutes"
          placeholder="Duration (in minutes)"
          value={formData.durationMinutes}
          onChange={handleChange}
          required
        />
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