'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../lib/api';
export default function UsuariosListPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [loadingGuard, setLoadingGuard] = useState(true);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

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
    if (!isAdmin || loadingGuard) return;
    setLoading(true);
    setErr('');
    api
      .get('/users')
      .then((res) => setUsers(res.data || []))
      .catch(() => setErr('No se pudieron cargar los usuarios.'))
      .finally(() => setLoading(false));
  }, [isAdmin, loadingGuard]);

  if (loadingGuard) return null;

  return (
    <Stack spacing={2}>
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Typography variant='h4' fontWeight={700}>
          Usuarios
        </Typography>
        <Button
          variant='contained'
          onClick={() => router.push('/proyectos/usuarios/nuevo')}
        >
          Crear usuario
        </Button>
      </Box>

      {err && <Alert severity='error'>{err}</Alert>}

      <TableContainer component={Paper}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align='right'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color='text.secondary'>Sin usuarios.</Typography>
                </TableCell>
              </TableRow>
            )}

            {loading && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color='text.secondary'>Cargando…</Typography>
                </TableCell>
              </TableRow>
            )}

            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.name || '—'}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell align='right'>
                  <Tooltip title='Editar'>
                    <IconButton
                      size='small'
                      onClick={() =>
                        router.push(`/proyectos/usuarios/${u.id}/editar`)
                      }
                    >
                      <EditIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
