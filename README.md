🧠 Project Goal
Build a core WHMCS alternative (not a full clone) with:
Client management
Product & service management
Orders → invoices → payments flow
Automated provisioning (via queues)
Ticket system
Admin & client dashboards
🧩 Tech Stack
Backend
Node.js + Express
MongoDB + Mongoose
Redis + BullMQ (background jobs)
JWT Authentication
Node-Cron (scheduled tasks)
Frontend
React + Vite
Tailwind CSS
React Query
Axios
DevOps (later phase)
Docker
PM2
Nginx
CI/CD
🗂️ Monorepo Structure
whmcs-clone/
│
├── client/                 # React frontend
│
├── server/
│   ├── src/
│   │   ├── config/         # env, db, redis
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── services/       # Payments, provisioning
│   │   ├── queues/         # BullMQ jobs
│   │   ├── workers/        # Queue workers
│   │   ├── middlewares/    # Auth, RBAC
│   │   ├── utils/          # Helpers
│   │   └── app.js
│   │
│   └── server.js
│
├── docs/
├── docker/
└── README.md
🧭 Development Roadmap (VERY IMPORTANT)
🔹 PHASE 1: Foundation (Start Here)
1️⃣ Backend Setup
Initialize Node.js + Express
Connect MongoDB
Setup env config
Basic health check API
✅ Output:
GET /api/health → OK
2️⃣ Authentication & Authorization
User roles:
admin
client
JWT based login
Password hashing
Role-based middleware (RBAC)
✅ APIs:
POST /auth/register
POST /auth/login
GET  /auth/me
3️⃣ Core Database Models
Create schemas for:
User
Client
Product
Order
Service
Invoice
Transaction
Ticket
ActivityLog
⚠️ Add indexes early (clientId, status, nextDueDate)
🔹 PHASE 2: Billing Engine (Heart of WHMCS)
4️⃣ Product & Pricing System
Hosting / domain / addon products
Monthly / yearly cycles
Setup fee support
5️⃣ Order → Invoice Flow
Flow:
Order created
↓
Invoice generated
↓
Invoice unpaid
APIs:
POST /orders
POST /invoices/generate
GET  /invoices/:id
6️⃣ Payment Gateway Integration
Start with one gateway (Stripe / Razorpay)
Webhook verification
Idempotency handling
Flow:
Payment success
↓
Invoice marked paid
↓
Provisioning job queued
🔹 PHASE 3: Automation & Provisioning
7️⃣ Redis + BullMQ Setup
Queues:
billingQueue
provisioningQueue
emailQueue
domainQueue
8️⃣ Provisioning Workers
Worker actions:
create service
suspend service
terminate service
renew service
⚠️ All workers must be idempotent
9️⃣ Cron Jobs
Invoice reminders
Auto-suspension
Renewals
Cleanup logs
🔹 PHASE 4: Client & Admin Panels
🔟 Client Area (React)
Client can:
View services
Pay invoices
Open tickets
Manage profile
1️⃣1️⃣ Admin Panel
Admin can:
Manage clients
Create products
View invoices
Manually trigger provisioning
View logs
🔹 PHASE 5: Tickets & Notifications
1️⃣2️⃣ Ticket System
Client ↔ Admin messages
Status tracking
Priority levels
1️⃣3️⃣ Email System
Transactional emails
Queue-based sending
Templates
🔹 PHASE 6: Production Hardening
Rate limiting
API versioning
Audit logs
DLQ for failed jobs
Monitoring (queue length, failures)
🔐 Security Checklist
JWT expiration
Encrypted credentials
Webhook signature verification
Role-based permissions
Activity logging
📌 MVP Feature List
Auth
Products
Orders
Invoices
Payments
Basic provisioning
Client dashboard
🧪 Testing Strategy
Unit tests (services)
API tests (Postman)
Worker failure simulation
📦 Deployment Plan
Dockerize backend
Redis container
MongoDB Atlas
Frontend on Vercel / Netlify
🛠️ Future Enhancements
Multi-currency
Tax rules
Domain registrar integration
Affiliate system
Reports & analytics



whmcs-clone/
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API service calls
│   │   ├── utils/         # Helpers
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/        # Environment, DB, Redis config
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API route definitions
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── queues/        # BullMQ job definitions
│   │   ├── workers/       # Queue processors
│   │   ├── middlewares/   # Auth, validation, RBAC
│   │   ├── utils/         # Helpers, constants
│   │   ├── cron/          # Scheduled tasks
│   │   ├── validators/    # Request validators
│   │   └── app.js         # Express app setup
│   ├── server.js          # Server entry point
│   └── package.json
│
├── docs/                  # Documentation
├── docker/               # Docker configs
├── .env.example          # Environment variables template
├── docker-compose.yml    # Multi-container setup
└── README.md