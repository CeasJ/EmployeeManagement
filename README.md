# 🧑‍💼 Real-Time Employee Task Management Tool

This project is a full-stack application built for the to create a real-time employee task management tool. It includes a ReactJS, Express.js, and Firebase for the database. The application supports user authentication, employee management, task assignment, real-time chat using and SMS/email notifications via Vonage and an email service. Managers can add and delete employees, assign tasks, and communicate in real-time, while employees can log in, manage tasks.

---

## 🚀 Features

### 🔐 Authentication
- Phone or email-based login using 6-digit access codes
- Separate login flows for **Manager** and **Employee**
- Token-based session management

### 👨‍💼 Manager Role
- Add, edit, delete employees
- Assign work schedules and tasks
- Send account credentials via email
- Real-time chat with employees (Socket.IO)

### 👷 Employee Role
- Set up account via email link
- Edit profile information
- View and complete assigned tasks
- Chat with manager in real-time

---

## 🧱 Tech Stack

| Layer     | Technology                          |
|-----------|--------------------------------------|
| Frontend  | React.js (Create React App), Socket.IO Client |
| Backend   | Node.js, Express, Socket.IO, JWT     |
| Database  | Firebase (Firestore) |
| Messaging | Vonage (SMS), Nodemailer (Email)     |

---

## 📁 Setup Instructions
### 1. Set up Firebase
- Create a Firebase project in the Firebase Console.
- Enable Firestore Database
- Copy your Firebase configuration and add it to a .env file.

### 2. Set up Vonage
- Sign up for a Vonage account and obtain your Account SID, Auth Token, and a Vonage phone number.
- Add these credentials to the .env file.

### 3. Set Up Email Service:
- Configure an email service for sending employee credentials.
- Add the email service credentials to the .env file.

### 4. Install Dependencies:
- For the front-end:
```bash
cd client
npm install
npm start
```
- For the back-end:
```bash
cd server
npm install
node server.js
```


### 5. Environment Variables: 
```bash
# Server
PORT=YOUR_PORT

# JWT
JWT_KEY=YOUR_KEY
JWT_REFRESH_KEY=YOUR_KEY


# Mailer
EMAIL_USER=EMAIL_USERNAME
EMAIL_PASS=EMAIL_PASSWORD

# SMS
SMS_API_KEY=YOUR_VONAGE_KEY
SMS_API_SECRET=YOUR_VONAGE_SECRET
SMS_PHONE_NUMBER=YOUR_PHONE_NUMBER
```

### 6. Usage:
- Manager Role:
  - Log in with phone number and OTP.
  - Manage employees (add, edit, delete) and assign tasks.
  - Chat with employees in real-time.
- Employee Role:
  - Set up account via email verification link.
  - Log in with credentials, manage tasks, and update profile.
