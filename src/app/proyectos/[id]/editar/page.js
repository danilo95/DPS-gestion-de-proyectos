'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import api from "@/app/lib/api";

export default function EditarProyectoPage() {
    const { id } = useParams();
    const router = useRouter();

    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    // state del form
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [estimatedEndDate, setEstimatedEndDate] = useState('');
    const [owner, setOwner] = useState('');
    const [developers, setDevelopers] = useState([]);

    const [users, setUsers] = useState([]);

    // cargar usuario logueado
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

    // cargar usuarios
    useEffect(() => {
        api.get('/users').then((res) => setUsers(res.data || []));
    }, []);

    // cargar proyecto
    useEffect(() => {
        if (!id || users.length === 0) return;
        api.get(`/projects/${id}`).then((res) => {
            const p = res.data;
            if (!p) return;
            setName(p.name);
            setStartDate(p.startDate);
            setEstimatedEndDate(p.estimatedEndDate);
            setOwner(p.owner);
            // Mapear los nombres de desarrolladores del proyecto a los objetos de usuario completos
            const devs = users.filter((u) => p.developers?.some((d) => d.id === u.id));
            setDevelopers(devs || []);
        });
    }, [id, users]);

    const projectManagers = useMemo(
        () => users.filter((u) => u.role === 'project-manager'),
        [users]
    );

    const developersList = useMemo(
        () => users.filter((u) => u.role === 'developer'),
        [users]
    );

    const ownersOptions = useMemo(
        () =>
            projectManagers.map((u) => ({
                id: u.id,
                label: `${u.name || u.username}`,
            })),
        [projectManagers]
    );

    const devOptions = useMemo(
        () =>
            developersList.map((u) => ({
                id: u.id,
                name: u.name || u.username,
            })),
        [developersList]
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
                setSaving(false);
                return;
            }
            const devs = developers.map((dev) => ({
                id: dev.id,
                name: dev.name,
            }));

            await api.patch(`/projects/${id}`, {
                name: name.trim(),
                startDate,
                estimatedEndDate,
                owner: Number(owner),
                developers: devs,
            });

            router.replace('/proyectos');
        } catch (err) {
            console.error('Error al actualizar el proyecto:', err);
            setError('No se pudo actualizar el proyecto.');
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        console.log('¿Seguro que deseas eliminar este proyecto? Esta acción no se puede deshacer.');
        setDeleting(true);
        try {
            await api.delete(`/projects/${id}`);
            router.replace('/proyectos');
        } catch (err) {
            console.error('Error al eliminar el proyecto:', err);
            setError('No se pudo eliminar el proyecto.');
        } finally {
            setDeleting(false);
        }
    };

    if (loading || !isAdmin) return null;

    return (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant='h5' fontWeight={700} gutterBottom>
                Editar proyecto
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
                        value={developers}
                        onChange={(_, values) => setDevelopers(values)}
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
                        <Button
                            color='error'
                            variant='outlined'
                            onClick={onDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Paper>
    );
}