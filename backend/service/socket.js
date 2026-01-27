// let io;

// const initSocket = (server) => {
//   io = require("socket.io")(server, {
//     cors: {
//          origin: "*"
//          }
//   });

//   io.on("connection", (socket) => {
//     socket.on("join", (userId) => {
//       socket.join(userId);
//     });
//   });
// };

// const sendNotification = (userId, payload) => {
//   if (io) {
//     io.to(userId.toString()).emit("notification", payload);
//   }
// };

// module.exports = { initSocket, sendNotification };
