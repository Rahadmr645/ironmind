
import { Server } from 'socket.io'

let io = null;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*" },
    });


    io.on('connection', (socket) => {

        console.log('User connected:', socket.id);


        // user join in room 
        socket.on('register', (userId) => {
            socket.join(userId);
            console.log("user joined room ", userId);
        });


        socket.on("disconnected", () => {
            console.log("User disconnected:", socket.id)
        })
    });
};


export const getIo = () => {
    if (!io) {
        throw new Error("socket.io not inittialized")
    }
    return io;
}