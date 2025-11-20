import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Folder as FolderIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', permission: 'dashboard.view' },
  { text: 'Clients', icon: <PeopleIcon />, path: '/clients', permission: 'clients.view' },
  { text: 'Projects', icon: <FolderIcon />, path: '/projects', permission: 'projects.view' },
  { text: 'Tasks', icon: <AssignmentIcon />, path: '/tasks', permission: 'tasks.view' },
  { text: 'Messages', icon: <ChatIcon />, path: '/messages', permission: 'messages.view' },
  { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar', permission: 'calendar.view' },
  { text: 'Gantt Chart', icon: <TimelineIcon />, path: '/gantt', permission: 'gantt.view' },
  { text: 'Finance', icon: <MoneyIcon />, path: '/finance', permission: 'finance.view' },
  { text: 'Team', icon: <GroupIcon />, path: '/team', permission: 'team.view' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            CRM System
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name} ({user?.role})
          </Typography>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer' }}
            onClick={logout}
          >
            Logout
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems
              .filter((item) => hasPermission(item.permission))
              .map((item) => (
              <ListItem
                button
                key={item.text}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

