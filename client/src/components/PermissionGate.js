import React from 'react';
import { useAuth } from '../context/AuthContext';
import Unauthorized from '../pages/Unauthorized';

const PermissionGate = ({ permission, children }) => {
  const { loading, hasPermission } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (permission && !hasPermission(permission)) {
    return <Unauthorized />;
  }

  return children;
};

export default PermissionGate;

