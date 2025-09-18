'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import api from '../../lib/api';

export default function CrearProyectoPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // form state
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [estimatedEndDate, setEstimatedEndDate] = useState('');
  const [owner, setOwner] = useState('');
  const [developers, setDevelopers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // users para selects
  const [users, setUsers] = useState([]);

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

  useEffect(() => {
    api.get('/users').then((res) => setUsers(res.data || []));
  }, []);

  const ownersOptions = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        label: `${u.name || u.username} (${u.role})`,
      })),
    [users]
  );

  const devOptions = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        name: u.name || u.username,
      })),
    [users]
  );

  const isAdmin = useMemo(() => me?.role === 'administrador', [me]);

  const validate = () => {
    if (!name.trim() || !startDate || !estimatedEndDate || !owner) {
      return 'Nombre, fechas y encargado son obligatorios.';
    }
    const sd = new Date(startDate);
    const ed = new Date(estimatedEndDate);
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) {
      return 'Fechas inválidas.';
    }
    if (sd > ed) {
      return 'La fecha inicial no puede ser posterior a la fecha final estimada.';
    }
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const msg = validate();
      if (msg) {
        setError(msg);
        return;
      }
      // construir objeto proyecto
      const selectedOwner = ownersOptions.find(
        (o) => String(o.id) === String(owner)
      );
      const devs = developers.map((name, idx) => ({
        id: `dev-${idx + 1}`,
        name,
      }));

      await api.post('/projects', {
        name: name.trim(),
        startDate,
        estimatedEndDate,
        owner: Number(owner),
        developers: devs,
        tasks: [], // inicia vacío
      });

      router.replace('/proyectos');
    } catch (err) {
      setError('No se pudo crear el proyecto.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAdmin) return null;

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant='h5' fontWeight={700} gutterBottom>
        Crear proyecto
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom>
        Solo administradores pueden acceder a esta vista.
      </Typography>

      <Box component='form' onSubmit={onSubmit} noValidate>
        <Stack spacing={2} mt={2} maxWidth={560}>
          <TextField
            label='Nombre del proyecto'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label='Fecha inicial'
              type='date'
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              sx={{ flex: 1 }}
            />
            <TextField
              label='Fecha final estimada'
              type='date'
              InputLabelProps={{ shrink: true }}
              value={estimatedEndDate}
              onChange={(e) => setEstimatedEndDate(e.target.value)}
              required
              sx={{ flex: 1 }}
            />
          </Stack>

          <TextField
            select
            label='Encargado (owner)'
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            required
          >
            {ownersOptions.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            multiple
            options={devOptions}
            getOptionLabel={(o) => o.name}
            value={devOptions.filter((o) => developers.includes(o.name))}
            onChange={(_, values) => setDevelopers(values.map((v) => v.name))}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Equipo (developers)'
                placeholder='Agregar developer'
              />
            )}
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
