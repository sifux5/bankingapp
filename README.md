# 🏦 Banking App

A full-stack banking application built with Spring Boot and React, featuring secure JWT authentication, account management, and transaction tracking.

## 🚀 Live Demo
> Coming soon

## ✨ Features

### Authentication & Security
- JWT-based authentication
- Rate limiting — account locked for 5 minutes after 5 failed login attempts
- Strong password requirements (min 8 characters, number and special character required)
- Session expiry handling

### Account Management
- Create checking and savings accounts
- View account details (balance, status, total in/out)
- Close accounts (requires zero balance)
- Dark mode support

### Transactions
- Deposit and withdraw funds
- Transfer money between accounts
- Transaction history with filtering (by type, date range, search)
- Transaction categorization (Food, Transport, Entertainment, etc.)
- Export transactions as PDF

### User Profile
- View and edit profile information
- Change password securely

## 🛠️ Tech Stack

### Backend
- **Java 21**
- **Spring Boot 3.4.1**
- **Spring Security** — JWT authentication
- **Spring Data JPA / Hibernate** — ORM
- **PostgreSQL** — production database
- **Lombok** — boilerplate reduction
- **Maven** — build tool

### Frontend
- **React 18** + **TypeScript**
- **Vite** — build tool
- **Tailwind CSS** — styling
- **Axios** — HTTP client
- **jsPDF** — PDF export
- **React Toastify** — notifications

### Infrastructure
- **Docker** — local PostgreSQL database
- **Render.com** — backend deployment
- **Netlify** — frontend deployment

## 📦 Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- Docker

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/bankingapp.git
cd bankingapp
```

### 2. Start the database
```bash
docker-compose up -d
```

### 3. Start the backend
```bash
./mvnw spring-boot:run
```

### 4. Start the frontend
```bash
cd banking-frontend
npm install
npm run dev
```

### 5. Open the app
Navigate to `http://localhost:5173`

## 🗄️ Database Schema

```
users
  - id, first_name, last_name, email, password, phone_number, created_at, updated_at

accounts
  - id, account_number, account_type (CHECKING/SAVINGS), balance, active, user_id, created_at, updated_at

transactions
  - id, from_account_id, to_account_id, amount, transaction_type, status, description, category, created_at
```

## 🔒 Security Features
- Passwords hashed with BCrypt
- JWT tokens for stateless authentication
- Rate limiting on login endpoint
- Input validation on both frontend and backend
- CORS configured for frontend origin

## 📁 Project Structure

```
bankingapp/
├── src/main/java/com/banking/bankingapp/
│   ├── config/          # Security, CORS, Rate Limiter
│   ├── controller/      # REST controllers
│   ├── dto/             # Data Transfer Objects
│   ├── entity/          # JPA entities
│   ├── repository/      # Spring Data repositories
│   ├── service/         # Business logic
│   └── util/            # JWT utility
├── banking-frontend/
│   ├── src/
│   │   ├── pages/       # Login, Register, Dashboard, Profile
│   │   ├── services/    # API calls
│   │   ├── components/  # Reusable components
│   │   └── types/       # TypeScript interfaces
│   └── public/
├── docker-compose.yml
└── README.md
```

## 👤 Author
Alex Kupper
