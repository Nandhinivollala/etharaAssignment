# Project Manager Server

Node.js + Express backend with MongoDB Atlas, Mongoose, JWT authentication, and Admin/Member role-based access.

## Folder Structure

```text
server/
  src/
    config/
      db.js
    controllers/
      authController.js
    middleware/
      authMiddleware.js
      roleMiddleware.js
    models/
      User.js
    routes/
      authRoutes.js
      testRoutes.js
    app.js
    server.js
  .env.example
  package.json
```

## API Routes

```text
GET    /
GET    /api/test
GET    /api/test/member
GET    /api/test/admin
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

Protected routes require:

```text
Authorization: Bearer <token>
```
