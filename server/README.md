# Project Manager Server

Node.js + Express backend with MongoDB Atlas, Mongoose, JWT authentication, project/task APIs, dashboard summary, and Admin/Member role-based access.

## Folder Structure

```text
server/
  src/
    config/
      db.js
    controllers/
      authController.js
      dashboardController.js
      projectController.js
      taskController.js
    middleware/
      authMiddleware.js
      roleMiddleware.js
    models/
      Project.js
      Task.js
      User.js
    routes/
      authRoutes.js
      dashboardRoutes.js
      projectRoutes.js
      taskRoutes.js
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

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/dashboard/summary

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

Protected routes require:

```text
Authorization: Bearer <token>
```
