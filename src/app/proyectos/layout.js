'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
} from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function ProyectosLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('auth_user');
    if (!raw) {
      router.replace('/');
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      router.replace('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    router.push('/');
  };

  if (!user) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f3f3f3' }}>
      <AppBar position='sticky' sx={{ bgcolor: '#111' }} elevation={1}>
        <Toolbar>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            Proyectos
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountCircleIcon fontSize='small' />
            <Typography variant='body2' sx={{ mr: 1 }}>
              {user?.name ?? user?.username}
            </Typography>

            <Tooltip title='Cerrar sesión'>
              <IconButton color='inherit' onClick={handleLogout} size='small'>
                <LogoutRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth='lg' sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
