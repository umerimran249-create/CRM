import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PermissionGate from './components/PermissionGate';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import Finance from './pages/Finance';
import Team from './pages/Team';
import CalendarView from './pages/CalendarView';
import GanttView from './pages/GanttView';
import Messages from './pages/Messages';
import Unauthorized from './pages/Unauthorized';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <PermissionGate permission="dashboard.view">
                    <Dashboard />
                  </PermissionGate>
                }
              />
              <Route
                path="clients"
                element={
                  <PermissionGate permission="clients.view">
                    <Clients />
                  </PermissionGate>
                }
              />
              <Route
                path="clients/:id"
                element={
                  <PermissionGate permission="clients.view">
                    <ClientDetail />
                  </PermissionGate>
                }
              />
              <Route
                path="projects"
                element={
                  <PermissionGate permission="projects.view">
                    <Projects />
                  </PermissionGate>
                }
              />
              <Route
                path="projects/:id"
                element={
                  <PermissionGate permission="projects.view">
                    <ProjectDetail />
                  </PermissionGate>
                }
              />
              <Route
                path="tasks"
                element={
                  <PermissionGate permission="tasks.view">
                    <Tasks />
                  </PermissionGate>
                }
              />
              <Route
                path="messages"
                element={
                  <PermissionGate permission="messages.view">
                    <Messages />
                  </PermissionGate>
                }
              />
              <Route
                path="calendar"
                element={
                  <PermissionGate permission="calendar.view">
                    <CalendarView />
                  </PermissionGate>
                }
              />
              <Route
                path="gantt"
                element={
                  <PermissionGate permission="gantt.view">
                    <GanttView />
                  </PermissionGate>
                }
              />
              <Route
                path="finance"
                element={
                  <PermissionGate permission="finance.view">
                    <Finance />
                  </PermissionGate>
                }
              />
              <Route
                path="team"
                element={
                  <PermissionGate permission="team.view">
                    <Team />
                  </PermissionGate>
                }
              />
            </Route>
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

