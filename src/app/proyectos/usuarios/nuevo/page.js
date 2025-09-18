'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import api from '../../../lib/api';

export default function CrearUsuarioPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('project-manager'); // default
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('auth_user');
    if (!raw) {
      router.replace('/');
      return;
    }
    try {
      const u = JSON.parse(raw);
      setMe(u);
      if (u.role !== 'administrador') {
        router.replace('/proyectos');
        return;
      }
      setLoading(false);
    } catch {
      router.replace('/');
    }
  }, [router]);

  const isAdmin = useMemo(() => me?.role === 'administrador', [me]);

  const validate = async () => {
    if (!name.trim() || !username.trim() || !password.trim()) {
      return 'Todos los campos son obligatorios.';
    }
    if (username.length < 3) {
      return 'El usuario debe tener al menos 3 caracteres.';
    }
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    const res = await api.get('/users', { params: { username } });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return 'El nombre de usuario ya existe.';
    }
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const msg = await validate();
      if (msg) {
        setError(msg);
        return;
      }
      await api.post('/users', {
        username: username.trim(),
        password: password,
        role,
        name: name.trim(),
      });
      router.replace('/proyectos');
    } catch (err) {
      setError('No se pudo crear el usuario.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAdmin) return null;

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant='h5' fontWeight={700} gutterBottom>
        Crear usuario
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom>
        Solo administradores pueden acceder a esta vista.
      </Typography>

      <Box component='form' onSubmit={onSubmit} noValidate>
        <Stack spacing={2} mt={2} maxWidth={480}>
          <TextField
            label='Nombre completo'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label='Usuario'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            helperText='Mínimo 3 caracteres. Debe ser único.'
          />
          <TextField
            select
            label='Rol'
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value='administrador'>admin</MenuItem>
            <MenuItem value='project-manager'>project-manager</MenuItem>
          </TextField>
          <TextField
            label='Contraseña'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText='Mínimo 6 caracteres. (Demo, sin hashing)'
          />

          {error && <Alert severity='error'>{error}</Alert>}

          <Stack direction='row' spacing={1}>
            <Button type='submit' variant='contained' disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button onClick={() => router.back()} disabled={saving}>
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}
