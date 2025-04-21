import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import http from 'http';
import { Server, Socket } from 'socket.io';
import AuthRoutes from './Routes/AuthRoutes';
import DataRoutes from './Routes/DataRoutes';
import path from 'path';
import ComplaintRoutes from './Routes/ComplaintRoutes';
import ComplaintModel from './models/ComplaintModel';
import ContactRoutes from './Routes/ContactRoutes';
dotenv.config();

const app = express();
import socketController from './controllers/SocketController';
import MessageRoutes from './Routes/MessageRoutes';

const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize chat socket handlers
socketController(io);

const port = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
const origin = process.env.ORIGIN || "http://localhost:5173";

// Define types for socket event payloads
interface LikePayload {
    complaintId: string;
    userId: string;
    action: 'like' | 'unlike';
}

interface CommentPayload {
    complaintId: string;
    comment: {
        id: string;
        userId: string;
        userName: string;
        text: string;
        createdAt: string;
    };
}

const likesMapping: { [complaintId: string]: string[] } = {};

io.on("connection", (socket: Socket) => {
  console.log("Client connected:", socket.id);

  socket.on("toggle-like", ({ complaintId, userId, action }: { complaintId: string, userId: string, action: "like" | "unlike" }) => {
    if (!likesMapping[complaintId]) {
      likesMapping[complaintId] = [];
    }
    if (action === "like") {
      if (!likesMapping[complaintId].includes(userId)) {
        likesMapping[complaintId].push(userId);
      }
    } else {
      likesMapping[complaintId] = likesMapping[complaintId].filter(id => id !== userId);
    }
    // Broadcast the updated likes for this complaint to all clients
    io.emit("like-update", { complaintId, likes: likesMapping[complaintId] });
  });

  socket.on("add-comment", async ({ complaintId, comment }: { complaintId: string, comment: { id: string, userId: string, userName: string, text: string, createdAt: string } }) => {
    try {
      // Update (persist) the new comment in the database
      await ComplaintModel.findByIdAndUpdate(
        complaintId,
        { $push: { comments: comment } },
        { new: true }
      );
      // Broadcast the update to all connected clients
      io.emit("comment-update", { complaintId, comment });
    } catch (err) {
      console.error("Failed to save comment", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Middleware for CORS
app.use(cors({
    origin: origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use("/api/auth", AuthRoutes);
app.use("/api/data", DataRoutes);
app.use('/api/complaint', ComplaintRoutes);
app.use('/api/contacts', ContactRoutes);
app.use('/api/messages', MessageRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});

// Connect to the database and then start the server
mongoose.connect(DATABASE_URL as string)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
    });