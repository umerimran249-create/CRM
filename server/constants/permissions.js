const ROLE_PERMISSIONS = {
  Admin: ['*'],
  'Project Manager': [
    'dashboard.view',
    'clients.view',
    'clients.manage',
    'projects.view',
    'projects.manage',
    'tasks.view',
    'tasks.manage',
    'team.view',
    'messages.view',
    'messages.manage',
    'calendar.view',
    'calendar.manage',
    'gantt.view',
  ],
  'Team Member': [
    'dashboard.view',
    'projects.view',
    'tasks.view',
    'tasks.manage',
    'messages.view',
    'messages.manage',
    'calendar.view',
    'gantt.view',
    'team.view',
  ],
  'Finance User': [
    'dashboard.view',
    'projects.view',
    'clients.view',
    'finance.view',
    'finance.manage',
    'messages.view',
  ],
};

const DEFAULT_PERMISSIONS = [
  'dashboard.view',
  'messages.view',
  'projects.view',
  'tasks.view',
];

function getPermissionsForRole(role) {
  if (!role) return DEFAULT_PERMISSIONS;
  return ROLE_PERMISSIONS[role] || DEFAULT_PERMISSIONS;
}

function hasPermission(user, permission) {
  if (!permission || !user) return true;
  if (user.role === 'Admin') return true;
  const permissions = user.permissions || [];
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

module.exports = {
  ROLE_PERMISSIONS,
  DEFAULT_PERMISSIONS,
  getPermissionsForRole,
  hasPermission,
};

