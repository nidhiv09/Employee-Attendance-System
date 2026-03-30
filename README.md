# 👔 Employee Attendance Management System

A full-stack MERN application for tracking employee attendance, managing leaves, and generating reports. This system features Role-Based Access Control (RBAC) for Managers and Employees.

![Status](https://img.shields.io/badge/Status-Completed-success)
![Stack](https://img.shields.io/badge/Stack-MERN-blue)

## 🚀 Features

### 👨‍💼 Employee Portal
* **Secure Login/Register:** Create accounts and log in securely.
* **Mark Attendance:** Check In and Check Out with real-time status updates.
* **Late Marking Logic:** Automatically marks status as "Late" if checked in after 10:00 AM and asks for a reason.
* **Dashboard Stats:** View total hours worked, present days, and late days.
* **Calendar View:** Visual monthly calendar showing attendance history (Green=Present, Yellow=Late, Red=Absent).

### 👩‍✈️ Manager Portal
* **Dashboard Analytics:** View total employees, present count, and late arrivals for the day.
* **Visual Charts:** Weekly Attendance Trends (Bar Chart) and Department-wise Distribution (Pie Chart).
* **Absent List:** specific list of employees who haven't checked in today.
* **Reports & Filters:** Filter attendance records by Employee Name, Start Date, and End Date.
* **Export to CSV:** Download attendance reports for offline usage.

---

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite), Recharts (Visualization), Zustand (State Management), CSS Modules.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (Mongoose).
* **Authentication:** JWT (JSON Web Tokens) & Bcrypt.

---

## ⚙️ Environment Variables

Go to the `server` folder and create a `.env` file. You can reference the provided `.env.example`.

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance_db
JWT_SECRET=your_super_secret_key_123
```

---

### 📥 Setup & Installation

Follow these steps to get the project running on your local machine.

1. Clone the Repository

```bash
git clone [https://github.com/YOUR_USERNAME/Attendance-Management-System.git](https://github.com/YOUR_USERNAME/Attendance-Management-System.git)
cd Attendance-Management-System
```

2. Install Dependencies

Backend:
```bash
cd server
npm install
```

Frontend:
```bash
cd ../client
npm install
```

---

### 🏃‍♂️ How to Run

1.Start the Backend Server

Open a terminal in the server folder:

```bash
cd server
node index.js
```
You should see: ✅ MongoDB Connected

2. Start the Frontend Application

Open a new terminal in the client folder:

```bash
cd client
npm run dev
```
Open your browser and visit: http://localhost:5173







