# Project Manager Assignment

Full-stack project manager assignment with a React + Vite frontend and a Node.js + Express backend.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB Atlas with Mongoose
- Authentication: JWT
- Authorization: Admin and Member roles

## Project Structure

```text
.
|-- clien/
|   `-- React frontend
`-- server/
    `-- Express backend
```

## Backend Setup

```powershell
cd server
npm install
Copy-Item .env.example .env
npm run dev
```

Update `server/.env` with your MongoDB Atlas connection string and JWT secret before starting the backend.

From the project root, you can also run:

```powershell
npm run server:dev
```

## Frontend Setup

```powershell
cd clien
npm install
npm run dev
```

From the project root, you can also run:

```powershell
npm run client:dev
npm run client:build
npm run client:lint
```

## Backend API Routes

```text
GET    /
GET    /api/test
GET    /api/test/member
GET    /api/test/admin
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

Protected routes require this header:

```text
Authorization: Bearer <token>
```

## Environment Variables

Use `server/.env.example` as the template:

```text
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
