import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, ref:"user", 
     required : true
  },
  title: {
    type: String, 
    required: true
  },
  description: String,
  startTime: Date,
  endTime: Date,
  durationMinutes: Number,
  status: {
    type: String,
    enum: ['Pending', 'Completed','Failed','Under_review'],
    default: 'Pending'
  },
  proof: {
    type: String,
    default: null,
  },
  punishment: {
    type: String,
    enum: ['block_app', 'block_phone', 'mute_notifications','reduce_points'],
    default: 'block_app'
  },
  punishmentDuration: {
    type: Number,
    default: 24
  },
  reviewedByAI : {
    type: Boolean,
    default: false
  },
  
}, {timestamps: true}) ;

const Task = mongoose.model('Task', taskSchema);

export default Task;
