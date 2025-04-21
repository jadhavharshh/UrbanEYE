# UrbanEye - Community Issue Reporting & Management System

UrbanEye is a full-stack application designed to empower citizens to report urban issues, communicate directly with authorities, and monitor the resolution process. With real-time messaging, AI-based image analysis, and role-based access, UrbanEye provides a centralized platform for improved civic engagement and urban governance.

---

## 🌐 Features

- **User Authentication**: Seamless and secure login/signup with Clerk  
- **Complaint Management**: Submit, view, and track community complaints  
- **Real-time Messaging**: Integrated chat system with support and administrators  
- **Social Feed**: Interact with public complaints and community updates  
- **Role-Based Access Control**: Different dashboards and access levels for users, staff, and admins  
- **Image Detection**: Python-based AI server to detect issue types via uploaded images  

---

## 🤝 Tech Stack

### Frontend (Client)
- React + TypeScript  
- Vite for blazing fast builds  
- Tailwind CSS + Shadcn UI components  
- Socket.io client for real-time interactions  

### Backend (Server)
- Express.js + TypeScript  
- MongoDB with Mongoose  
- Socket.io for real-time communication  
- **Clerk** for authentication  

### AI Image Detection (Python Server)
- Python 3.8+  
- Image recognition and classification using custom ML models  

---

## 📁 Project Structure

```
UrbanEye/
├── client/                   # React+TypeScript+Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── utils/            # Helper functions and constants
│   │   ├── lib/              # Shared libraries
│   │   ├── hooks/            # Custom React hooks
│   │   └── configurations/   # App-wide configs and constants
│   └── public/               # Static assets
│
├── server/                  # Express+TypeScript backend
│   ├── src/
│   │   ├── Routes/           # API route definitions
│   │   ├── models/           # MongoDB models
│   │   ├── middleware/       # Auth and error-handling middleware
│   │   └── controllers/      # Request handlers
│   └── public/               # Uploaded/static files
│
└── pythonserver/            # Python server for image detection
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16+)  
- MongoDB  
- Python 3.8+  
- npm or yarn  

---

### 🚀 Client Setup
```bash
cd client
npm install
cp .env.example .env
# Update your .env with:
# VITE_BACKEND_URL, VITE_CLERK_PUBLISHABLE_KEY
npm run dev
```

---

### 🚀 Server Setup
```bash
cd server
npm install
cp .env.example .env
# Set values for DATABASE_URL, CLIENT_URL, CLERK_SECRET_KEY, etc.
npm run dev
```

---

### 🚀 Python Server Setup
```bash
cd pythonserver
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py  # or your main file
```

---

## 📄 API Endpoints

### Base URL: `/api`

- **Auth**: `/auth/...`  
- **User Data**: `/data/...`  
- **Complaints**: `/complaint/...`  
- **Messaging**: `/messages/...`  
- **Contacts**: `/contacts/...`  

---

## 📚 Contributing

1. Fork the repository  
2. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add amazing feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request  

---

## 🚀 Authors

Made with ❤️ by the Harsh Jadhav

