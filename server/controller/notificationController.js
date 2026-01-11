
// import Notification from '../models/notificationModel'
// import { getIo } from '../socket/Socket';


// // crate notification

// export const CreateNotification = async (req, res) => {
//     try {
//         const { userId, title, message } = req.body;

//         const notification = await Notification.create({
//             userId, title, message
//         });

//         // send real-time notificaiton 
//         getIo().to(userId).emit("new-notification", notification);

//         res.status(200).json({ success: true, notification });
//     } catch (error) {
//         res.status(500).json({ error: error.message })
//     }
// });

// // get notification 
// export const getNotification = async (req, res) => {
//     const notificaiton = (await Notification.find({ userId: req.params.userId })).toSorted({ createdAt: -1 });
//     res.json(notificaiton);
// };

// // mark as seen
// export const SeenNotification = async (req, res) => {
//     const { id } = req.body;
//     await Notification.findByIdAndUpdate(id, { seen: true });
//     res.json({ success: true });
// };


