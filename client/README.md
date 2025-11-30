**Name:** Nidhi V  
**College:** PES Institute of Technology and Management, Shivamogga  
**Contact Number:** 7975272886  

---

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

---

### 🌱 Seed Data (Quick Setup)

To instantly populate the database with sample users (1 Manager, 2 Employees) and dummy attendance records for the past 5 days:

1.Open the server terminal.

2.Run:
```bash
node seed.js
```

🔐 Login Credentials (After Seeding)

For Manager- Email: manager@test.com, Password: 123

For Employee- Email: alice@test.com, Password: 123

---

### Screenshots

1. Splash Screen

<img width="1892" height="895" alt="image" src="https://github.com/user-attachments/assets/7a784c56-b765-4cad-8728-85204f5e4791" />

2. Login Page

<img width="1891" height="890" alt="image" src="https://github.com/user-attachments/assets/3fc12eee-7881-4f77-98a9-a880e43055c2" />

3. New Register Page

<img width="1890" height="890" alt="image" src="https://github.com/user-attachments/assets/f3d4f5c2-47fa-41c4-bf1f-f8cc9d109a78" />

4. Manager Attendance Portal

<img width="1891" height="892" alt="image" src="https://github.com/user-attachments/assets/85636d04-6127-4967-bdf6-c10763d2fb7b" />

<img width="1881" height="889" alt="image" src="https://github.com/user-attachments/assets/0a905e89-31d0-44b9-931d-174a4232c4c3" />

5. Employee Attendance Portal

<img width="1888" height="896" alt="image" src="https://github.com/user-attachments/assets/27bbae04-9b0e-44a0-871f-7c0c0f9fe691" />

<img width="1890" height="720" alt="image" src="https://github.com/user-attachments/assets/29ba8fec-0f8a-4e78-abc2-077225c34771" />







