# CRM System

A comprehensive CRM system with project management and financial tracking capabilities.

## Features

- **Client Onboarding**: Manage client information, contact details, and account managers
- **Project Management**: Create and track projects with categories, budgets, and timelines
- **Task Allocation**: Assign tasks to team members with Kanban board view
- **Progress Tracking**: Visual Kanban board, Calendar view, and Gantt chart for task/project management
- **Review & Approval**: Track deliverables and client approval workflow
- **Financial Tracking**: Track expenses, revenue, and generate financial reports
- **Dashboard**: Comprehensive dashboard with charts and analytics
- **User Roles & Permissions**: Admin, Project Manager, Team Member, Finance User with granular module-level access control
- **Team Messaging**: Real-time messaging system for team communication
- **Personal Calendar**: Users can create and manage personal calendar events
- **Admin Calendar Assignment**: Admins and Project Managers can assign calendar events to team members
- **Department-based Task Visibility**: Team members see tasks from their department
- **Firebase Integration**: Real-time database sync, automatic data persistence
- **Deployment Ready**: Configured for Firebase Hosting and backend hosting services
- **Team Messaging**: Real-time communication for project collaborators
- **Granular Permissions**: Admin-managed access to individual modules

## Tech Stack

- **Backend**: Express.js, CSV file storage
- **Frontend**: React, Material-UI, Recharts, React Big Calendar
- **Authentication**: JWT
- **Storage**: Firebase Realtime Database (with optional CSV fallback)
- **Real-time Collaboration**: Firebase-powered task sync and team messaging

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- No database required - uses CSV files for storage

### Installation

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

3. Create a `.env` file in the root directory with your Firebase credentials (see `FIREBASE_SETUP.md` for details):
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://<your-db>.firebasedatabase.app
```

4. Create default admin user (skipped if you run the seed script):
```bash
npm run create-admin
```

This creates an admin user with:
- Email: `admin@crm.com`
- Password: `admin123`

**⚠️ Important: Change the default password after first login!**

5. (Optional) Seed the application with demo data:
```bash
npm run seed
```

6. (Optional) Migrate existing CSV data into Firebase (one-time):
```bash
npm run migrate:data
```

This command clears existing CSV data and creates demo clients, projects, tasks, finance records, and multiple user accounts.

### Deployment

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md) or [QUICK_DEPLOY.md](./QUICK_DEPLOY.md).

**Quick Deploy (Frontend to Firebase Hosting):**
```bash
npm run deploy
```

Or use the deployment scripts:
- Windows: `deploy.bat`
- Linux/Mac: `./deploy.sh`

### Running the Application

#### Option 1: Run both servers concurrently
```bash
npm run dev
```

#### Option 2: Run servers separately

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create client (Admin/Project Manager)
- `PUT /api/clients/:id` - Update client (Admin/Project Manager)
- `DELETE /api/clients/:id` - Delete client (Admin)

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Admin/Project Manager)
- `PUT /api/projects/:id` - Update project (Admin/Project Manager)
- `POST /api/projects/:id/complete` - Complete project (Admin/Project Manager)
- `DELETE /api/projects/:id` - Delete project (Admin)

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/notes` - Add note to task
- `POST /api/tasks/:id/deliverables` - Upload deliverable
- `DELETE /api/tasks/:id` - Delete task

### Finance
- `GET /api/finance` - Get all finance entries
- `GET /api/finance/:id` - Get single entry
- `POST /api/finance` - Create entry (Admin/Finance User/Project Manager)
- `PUT /api/finance/:id` - Update entry (Admin/Finance User)
- `DELETE /api/finance/:id` - Delete entry (Admin/Finance User)

### Dashboard
- `GET /api/dashboard` - Get dashboard data

### Team
- `GET /api/team` - Get all team members
- `GET /api/team/:id` - Get single member
- `POST /api/team` - Create member (Admin)
- `PUT /api/team/:id` - Update member (Admin)

## Project Structure

```
CRM/
├── server/
│   ├── models/          # MongoDB models (User, Client, Project, Task, FinanceEntry)
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── scripts/         # Utility scripts
│   └── index.js         # Server entry point
├── client/
│   ├── src/
│   │   ├── components/  # React components (Layout, PrivateRoute)
│   │   ├── pages/       # Page components (Dashboard, Clients, Projects, etc.)
│   │   ├── context/     # React context (AuthContext)
│   │   ├── App.js       # Main app component
│   │   └── index.js     # React entry point
│   └── public/          # Static files
├── package.json         # Root package.json
└── README.md
```

## Features in Detail

### Client Management
- Auto-generate client IDs (CLI-00001, CLI-00002, etc.)
- Link clients to projects
- Track account managers
- Store contact information and industry

### Project Management
- Create projects with categories (Event, Social Media, Branding, Video Production, etc.)
- Set budgets and timelines
- Track project status (Planning, Active, Review, Awaiting Client Approval, Completed, Closed)
- Link to clients and team members
- Auto-generate project IDs (PROJ-00001, etc.)
- Completion summary with deliverables and outcomes

### Task Management
- Kanban board view with drag-and-drop
- Assign tasks to team members
- Track priorities (Low, Medium, High, Urgent)
- Status tracking (To Do, In Progress, Review, Awaiting Client Approval, Done)
- Internal notes and activity logs
- Deliverable tracking with version history

### Calendar View
- View all tasks and projects on a calendar
- Switch between month, week, day, and agenda views
- Color-coded events (tasks vs projects)

### Gantt Chart View
- Visual timeline for all projects
- Progress bars showing completion percentage
- Days remaining/overdue indicators
- Project duration visualization

### Financial Tracking
- Record expenses and revenue
- Link entries to projects
- Track invoices and payment deadlines
- Automatic project budget updates
- Overdue invoice tracking

### Dashboard
- Project statistics (Total, Active, Completed)
- Revenue vs expenses (Monthly & YTD)
- Profit margin calculation
- Top 5 clients by revenue
- Monthly revenue vs expense chart
- Project-wise profitability chart
- Department cost breakdown (pie chart)
- Upcoming payment deadlines
- Overdue invoices

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full control: view/edit all projects, clients, finance, team management |
| **Project Manager** | Create/Edit projects, assign tasks, update progress, add finance entries |
| **Team Member** | View assigned tasks, mark progress, upload files, add notes |
| **Finance User** | Add expenses, update received payments, view all finance data |
| **Client** | View-only access (optional portal - not implemented in this version) |

## Default Login Credentials

Run either `npm run create-admin` or the demo seed script to get started. The seed script creates several accounts:

- **Admin**: `admin@crm.com` / `admin123`
- **Project Manager**: `sophia.pm@crm.com` / `password123`
- **Designer**: `james.design@crm.com` / `password123`
- **Copywriter**: `emily.copy@crm.com` / `password123`
- **Finance User**: `michael.finance@crm.com` / `password123`

**⚠️ Change this password immediately after first login!**

## Development Notes

- The backend uses CSV files for data storage (located in `server/data/`)
- Data is automatically persisted to CSV files
- JWT tokens are used for authentication (7-day expiration)
- Passwords are hashed using bcryptjs
- CORS is enabled for development
- The frontend uses Material-UI for components
- React Router handles client-side routing
- Axios is used for API calls
- CSV files are created automatically when the server starts

## Future Enhancements

- File upload functionality for task attachments and deliverables
- Email/Slack notifications for status updates
- Advanced reporting and export features
- Client portal for viewing deliverables and invoices
- Time tracking integration
- Advanced Gantt chart with dependencies
- Mobile app support

## License

ISC
