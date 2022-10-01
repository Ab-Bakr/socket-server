const io = require("socket.io")(https, {
  cors: {
    origin: "https://chat.webfikasolutions.com/",
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  // Add new user
  socket.on("new-user-add", (newUserId) => {
    // if user not added previoulsy
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);
    }

    io.emit("get-users", activeUsers);
  });

  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    console.log("Sending from socket to :", receiverId);
    console.log("Data is :", data);
    if (user) {
      io.to(user.socketId).emit("receive-message", data);
    }
  });

  // Remove user
  socket.on("disconnect", () => {
    // remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    // send all active users to all users
    io.emit("get-users", activeUsers);
  });
});
