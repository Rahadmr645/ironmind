import mongoose from 'mongoose'

const proofSchema = new mongoose.Schema({
   taskId : {
     type: mongoose.Schema.Types.ObjectId, ref:'Task',
     required: true
   },
   userId: {
     type: mongoose.Schema.Types.ObjectId, ref:'user',
     required: true
   },
   fileUrl: {
     type: String, required: true
   },
   verificationStatus: {
     type: String,
     enum: ['Pending', 'Verified', 'rejected'],
     default:'Pending'
   },
   VerifiedByAI: {
     type: Boolean,
     default: false
   },
   feedback: String,
}, {timestamps: true});

const Proof = mongoose.model('Proof', proofSchema);

export default Proof;