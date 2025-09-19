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
    // estructura para las tareas
    const [tasks, setTasks] = useState([{ id: Date.now(), name: '', assignees: [], dueDate: '' }]);
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

    const handleAddTask = () => {
        setTasks([...tasks, { id: Date.now(), name: '', assignees: [], dueDate: '' }]);
    };

    // Función para manejar cambios en cualquier campo de una tarea
    const handleTaskChange = (id, field, value) => {
        setTasks(tasks.map((task) => (task.id === id ? { ...task, [field]: value } : task)));
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
            const selectedOwner = ownersOptions.find((o) => String(o.id) === String(owner));
            const devs = developers.map((dev) => ({
                id: dev.id,
                name: dev.name,
            }));

            // Filter out empty tasks and add status
            const tasksToSave = tasks
                .filter((task) => task.name.trim() !== '')
                .map((task) => ({
                    id: task.id,
                    title: task.name,
                    status: 'to_do',
                    assignees: task.assignees.map(dev => dev.name),
                    dueDate: task.dueDate
                }));

            await api.post('/projects', {
                name: name.trim(),
                startDate,
                estimatedEndDate,
                owner: selectedOwner.id, // Se usa el ID del owner
                developers: devs,
                tasks: tasksToSave,
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

                    <Typography variant='subtitle1' fontWeight={700} sx={{ mt: 3 }}>
                        Tareas del proyecto
                    </Typography>
                    {tasks.map((task, index) => (
                        <Box key={task.id} sx={{ mb: 2, border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
                            <Typography variant='subtitle2' mb={1}>Tarea {index + 1}</Typography>
                            <Stack spacing={2}>
                                <TextField
                                    label='Nombre de la tarea'
                                    value={task.name}
                                    onChange={(e) => handleTaskChange(task.id, 'name', e.target.value)}
                                    required
                                />
                                <Autocomplete
                                    multiple
                                    options={devOptions}
                                    getOptionLabel={(o) => o.name}
                                    value={task.assignees}
                                    onChange={(_, values) => handleTaskChange(task.id, 'assignees', values)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label='Asignado a'
                                            placeholder='Asignar developers'
                                        />
                                    )}
                                />
                                <TextField
                                    label='Fecha de vencimiento'
                                    type='date'
                                    InputLabelProps={{ shrink: true }}
                                    value={task.dueDate}
                                    onChange={(e) => handleTaskChange(task.id, 'dueDate', e.target.value)}
                                />
                            </Stack>
                        </Box>
                    ))}
                    <Button onClick={handleAddTask} variant='outlined'>
                        Agregar otra tarea
                    </Button>

                    {error && <Alert severity='error'>{error}</Alert>}

                    <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
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