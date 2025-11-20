import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      textAlign="center"
    >
      <Typography variant="h4" gutterBottom color="error">
        Access Restricted
      </Typography>
      <Typography variant="body1" mb={3}>
        You don&apos;t have permission to view this module. Please contact an administrator if you
        believe this is an error.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </Button>
    </Box>
  );
}

