'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import api from '../../../../lib/api';

export default function EditarUsuarioPage() {
  const router = useRouter();
  const { id } = useParams();

  const [me, setMe] = useState(null);
  const [loadingGuard, setLoadingGuard] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('project-manager');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('auth_user');
    if (!raw) {
      router.replace('/');
      return;
    }
    try {
      const u = JSON.parse(raw);
      setMe(u);
      if (u.role !== 'admin' && u.role !== 'administrador') {
        router.replace('/proyectos');
        return;
      }
      setLoadingGuard(false);
    } catch {
      router.replace('/');
    }
  }, [router]);

  const isAdmin = useMemo(
    () => me?.role === 'admin' || me?.role === 'administrador',
    [me]
  );

  useEffect(() => {
    if (!id || !isAdmin || loadingGuard) return;
    setLoading(true);
    setErr('');
    api
      .get(`/users/${id}`)
      .then((res) => {
        const u = res.data;
        if (!u?.id) throw new Error('not found');
        setName(u.name ?? '');
        setUsername(u.username ?? '');
        setRole(u.role ?? 'project-manager');
      })
      .catch(() => setErr('No se pudo cargar el usuario.'))
      .finally(() => setLoading(false));
  }, [id, isAdmin, loadingGuard]);

  const validate = async () => {
    if (!name.trim() || !username.trim() || !role) {
      return 'Nombre, usuario y rol son obligatorios.';
    }
    if (username.trim().length < 3) {
      return 'El usuario debe tener al menos 3 caracteres.';
    }

    const resp = await api.get('/users', {
      params: { username: username.trim() },
    });
    const takenBy = Array.isArray(resp.data)
      ? resp.data.find((u) => String(u.id) !== String(id))
      : null;
    if (takenBy) {
      return 'Ese nombre de usuario ya está en uso.';
    }

    if (password && password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const msg = await validate();
      if (msg) {
        setErr(msg);
        return;
      }

      const payload = {
        name: name.trim(),
        username: username.trim(),
        role,
      };
      if (password) {
        payload.password = password;
      }

      await api.patch(`/users/${id}`, payload);
      router.replace('/proyectos/usuarios');
    } catch {
      setErr('No se pudo actualizar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingGuard) return null;

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant='h5' fontWeight={700} gutterBottom>
        Editar usuario
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom>
        Solo administradores pueden acceder a esta vista.
      </Typography>

      {loading ? (
        <Typography color='text.secondary'>Cargando…</Typography>
      ) : (
        <Box component='form' onSubmit={onSubmit} noValidate>
          <Stack spacing={2} mt={2} maxWidth={520}>
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
              required
            >
              <MenuItem value='admin'>admin</MenuItem>
              <MenuItem value='project-manager'>project-manager</MenuItem>
              <MenuItem value='administrador'>administrador</MenuItem>
            </TextField>

            <TextField
              label='Contraseña (opcional)'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText='Déjala vacía para no cambiar la contraseña. Mínimo 6 caracteres si la modificas.'
            />

            {err && <Alert severity='error'>{err}</Alert>}

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
      )}
    </Paper>
  );
}
