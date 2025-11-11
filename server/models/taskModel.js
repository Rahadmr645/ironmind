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
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: "End time must be after start time"
      }
    },
    durationMinutes:{
       type: Number,
       default: 0,
       set: v => Number(v)  || 0
    },

    status: {
      type: String,
      enum: ["upcoming", "running", "completed", "overdue"],
      default: "upcoming",
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

taskSchema.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    const diff = (this.endTime - this.startTime) / (1000 * 60);
    this.durationMinutes = diff;
  }
  next();
});

const Task = mongoose.model("Task", taskSchema);

export default Task;