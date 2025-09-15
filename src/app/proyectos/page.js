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
} from '@mui/material';

function calcProgress(tasks = []) {
  const total = tasks.length || 1;
  const done = tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / total) * 100);
}

export default function ProyectosPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/projects').then((res) => setProjects(res.data || []));
  }, []);

  return (
    <Stack spacing={3}>
      <Typography variant='h4' fontWeight={700}>
        Mis proyectos
      </Typography>

      <Grid container spacing={2}>
        {projects.map((p) => {
          const progress = calcProgress(p.tasks);
          return (
            <Grid key={p.id} xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardActionArea
                  onClick={() => router.push(`/proyectos/${p.id}`)}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant='h6' fontWeight={700}>
                        {p.name}
                      </Typography>

                      <Typography variant='body2' color='text.secondary'>
                        Inicio: {p.startDate} • Fin estimada:{' '}
                        {p.estimatedEndDate}
                      </Typography>

                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Avance: {progress}%
                        </Typography>
                        <LinearProgress
                          variant='determinate'
                          value={progress}
                        />
                      </Box>

                      <Typography variant='caption' color='text.secondary'>
                        Equipo:{' '}
                        {p.developers?.map((d) => d.name).join(', ') || '—'}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
