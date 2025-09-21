'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    LinearProgress,
    Stack,
    Typography,
    Grid,
    Button,
    Chip,
} from '@mui/material';

function calcProgress(tasks = []) {
    const total = tasks.length || 1;
    const done = tasks.filter((t) => t.status === 'done').length;
    return Math.round((done / total) * 100);
}

/////////////////////////////////////////////////////////////////////////////////
function progressBadge(progress) {
  if (progress === 100) return { label: 'Completado', color: 'success' };
  if (progress > 50) return { label: 'En progreso', color: 'primary' };
  return { label: 'Pendiente', color: 'warning' };
}

export default function ProyectosPage() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // cargar usuario logueado
    useEffect(() => {
        const raw = localStorage.getItem('auth_user');
        if (!raw) return;
        try {
            const u = JSON.parse(raw);
            setUser(u);
            setIsAdmin(u.role === 'admin' || u.role === 'administrador');
        } catch {}
    }, []);

    // cargar proyectos
    useEffect(() => {
        api.get('/projects').then((res) => setProjects(res.data || []));
    }, []);

    if (!user) return null;

    return (
        <Stack spacing={3}>

            <Typography variant='h4' fontWeight={700}>
                Mis proyectos
            </Typography>

            <Grid container spacing={2}>
                {projects.map((p) => {
                    const progress = calcProgress(p.tasks);
                    /////////////////////////////////////////////
                    const badge =progressBadge(progress);

                    return (
                        <Grid item key={p.id} xs={12} sm={6} md={4}>
                            
                            <Card>

                                <CardActionArea
                                    onClick={() => router.push(`/proyectos/${p.id}`)}
                                >
                                    <CardContent>
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                            <Typography variant='h6' fontWeight={700}>
                                                {p.name}
                                            </Typography>
                                            
                                        </Stack>
                                            

                                            <Typography variant='body2' color='text.secondary'>
                                                Inicio: {p.startDate} • Fin estimada: {p.estimatedEndDate}
                                            </Typography>

                                            <Box>
                                                <Typography variant='caption' color='text.secondary'>
                                                    Avance: {progress}%
                                                </Typography>
                                                <LinearProgress variant='determinate' value={progress}
                                                sx={{
                                                    mt:0.5,
                                                    height:8,
                                                    borderRadius:8,
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: 8,
                                                        backgroundColor: progress === 100 ? 'success.main' : 'primary.main',
                                                    },
                                                }}
                                                />
                                            </Box>

                                            <Typography variant='caption' color='text.secondary'>
                                                Equipo: {p.developers?.map((d) => d.name).join(', ') || '—'}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </CardActionArea>


                                {isAdmin && (
                                    <Box sx={{ p: 1 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            onClick={() => router.push(`/proyectos/${p.id}/editar`)}
                                        >
                                            Editar
                                        </Button>
                                    </Box>
                                )}
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Stack>
    );
}
