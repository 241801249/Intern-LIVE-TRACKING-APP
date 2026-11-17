const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/liveTracking")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Extended location schema
const locationSchema = new mongoose.Schema({
  userId: String,
  latitude: Number,
  longitude: Number,
  speed: Number,       // in m/s
  heading: Number,     // direction in degrees
  accuracy: Number,    // in meters
  altitude: Number,    // in meters
  timestamp: { type: Date, default: Date.now },
});

const Location = mongoose.model("Location", locationSchema);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("sendLocation", async (data) => {
  if (data.latitude && data.longitude) {
    const loc = new Location({
      userId: data.userId || "unknown",
      lat: data.latitude,
      lng: data.longitude,
    });
    await loc.save();
    io.emit("receiveLocation", data);
    console.log("📍 Location saved:", data);
  } else {
    console.log("⚠️ Invalid data:", data);
  }
});

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3000, '0.0.0.0', () => {
  console.log("🚀 Server running on port 3000");
});
