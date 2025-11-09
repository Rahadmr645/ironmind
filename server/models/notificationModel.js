import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema ({
   userId: {
       type:mongoose.Schema.Types.ObjectId, ref:"user"
   },
   message: String,
   type: {
     type: String,
     enum:['reminder','warning', 'punishemnt', 'success']
   },
   isRead: {
     type: Boolean,
     default: false
}, {timestamps: true});


const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;