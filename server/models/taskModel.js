import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      set: v => Number(v) || 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "under_review"],
      default: "pending",
    },
    proof: {
      type: String,
      default: null,
    },
    punishment: {
      type: String,
      default: "",
    },
    punishmentDuration: {
      type: Number,
      default: 0,
      set: v => Number(v) || 0,
    },
    reviewedByAI: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;