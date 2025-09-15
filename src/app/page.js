'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from './lib/api';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('auth_user');
    if (raw) {
      router.replace('/proyectos');
    }
  }, [router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.get('/users', { params: { username } });
      if (
        !Array.isArray(data) ||
        data.length === 0 ||
        data[0].password !== password
      ) {
        setError('Usuario o contraseña inválidos.');
        return;
      }
      const { password: _omit, ...safeUser } = data[0];
      localStorage.setItem('auth_user', JSON.stringify(safeUser));
      router.push('/proyectos');
    } catch {
      setError(
        'No se pudo contactar el servidor. intenta nuevamente mas tarde.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',

        backgroundImage:
          'linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url(/login.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: 3,

          bgcolor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <Typography variant='h4' fontWeight={700} gutterBottom>
          Iniciar sesión
        </Typography>

        <Box component='form' onSubmit={onSubmit} noValidate>
          <Stack spacing={2} mt={2}>
            <TextField
              label='Usuario'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete='username'
            />
            <TextField
              label='Contraseña'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete='current-password'
            />

            {error && <Alert severity='error'>{error}</Alert>}

            <Button
              type='submit'
              variant='contained'
              disabled={submitting}
              size='large'
            >
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
