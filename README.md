# **NestJS Fastify Authentication System**

This is a **scalable and secure authentication system** built with **NestJS and Fastify**, designed for **multi-platform compatibility** (web and mobile) while maintaining **high performance and security best practices**. The project supports **GraphQL and REST APIs**, integrates **OAuth authentication**, and follows a modular, well-structured architecture for maintainability and scalability.

---

## **Features**

### **Authentication & User Management**
- ✅ **Email/Password Authentication** – Secure login & registration using bcrypt.
- ✅ **OTP-Based Login & Password Recovery** – Time-limited, single-use OTPs sent via email.
- ✅ **Google & Facebook OAuth 2.0** – Secure social login via Passport.js strategies.
- ✅ **JWT Authentication & Token Management**  
  - **Access Token:** 15 min expiration  
  - **Refresh Token:** 7 days expiration  
  - Includes **Role-Based Access Control (RBAC)** (user, admin).

### **Security Features**
- 🔒 **Rate Limiting** – Protects against brute-force attacks.
- 🔒 **CORS & CSRF Protection** – Secures cross-origin requests.
- 🔒 **Input Validation & Sanitization** – Prevents SQL injection & XSS attacks.
- 🔒 **HTTPS Support** – Configured for secure API communications.

### **API & Backend Architecture**
- 🚀 **GraphQL API for Queries & Mutations** – Optimized for fetching structured data.
- 🚀 **REST API for File Uploads & Miscellaneous Endpoints** – Handles efficient file management.
- 🚀 **Versioned API Endpoints** – Ensures backward compatibility (e.g., `/v1/login`).
- 🚀 **PostgreSQL with Prisma ORM** – Structured database with optimized schema.
- 🚀 **Admin Panel** – User management, data exports, and system monitoring.

### **Cloud Integrations**
- ☁️ **Google Cloud Storage** – Securely handles file uploads.
- 📧 **SendGrid Email Service** – OTP & account recovery email handling.

---

## **Setup & Installation**

### **1️⃣ Clone the repository**
```sh
git clone https://github.com/yourusername/nestjs-fastify-auth.git
cd nestjs-fastify-auth
```

### **2️⃣ Install dependencies**
```sh
npm install
```

### **3️⃣ Setup environment variables**
- Copy `.env.example` to `.env` and update values (database, JWT secrets, OAuth keys, etc.).

### **4️⃣ Run the application**
```sh
npm run start:dev
```

---

## **Testing the API**
📌 **Postman Workspace** – Pre-configured API requests:  
🔗 [Postman Collection](https://www.postman.com/planetary-meadow-877636/workspace/freelancing/collection/6761f024ee1120390951c8ff?action=share&creator=23240798)

📌 **Run API Tests with Jest**
```sh
npm run test
```

---

## **Tech Stack**
✅ **NestJS + Fastify** – High-performance backend framework.  
✅ **PostgreSQL + Prisma** – Efficient database management.  
✅ **GraphQL + REST API** – Flexible & scalable API structure.  
✅ **Passport.js** – Secure OAuth authentication.  
✅ **SendGrid + Google Cloud Storage** – Reliable email & cloud storage integration.  

---

This project ensures **scalability, security, and maintainability**, making it ideal for real-world **production-ready authentication systems**. 🚀
