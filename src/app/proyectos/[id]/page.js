'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../lib/api';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  Grid,
} from '@mui/material';

const STATUS_LABEL = {
  to_do: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

const STATUS_COLOR = {
  to_do: 'default',
  in_progress: 'warning',
  done: 'success',
};

export default function ProjectDetailPage() {
  const { id } = useParams();

  const [project, setProject] = useState(undefined);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const byId = await api.get(`/projects/${id}`);
        setProject(byId.data ?? null);
      } catch {
        setProject(null);
      }
    })();
  }, [id]);

  const tasksByStatus = useMemo(() => {
    const g = { to_do: [], in_progress: [], done: [] };
    const list = project?.tasks ?? [];
    for (const t of list) {
      const key = ['to_do', 'in_progress', 'done'].includes(t.status)
        ? t.status
        : 'to_do';
      g[key].push(t);
    }
    return g;
  }, [project]);

  if (project === undefined) return <Typography>Cargando…</Typography>;
  if (project === null) return <Typography>Proyecto no encontrado.</Typography>;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant='h4' fontWeight={700}>
          {project.name}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Inicio: {project.startDate} • Fin estimada: {project.estimatedEndDate}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Encargado: {project.owner} • Equipo:{' '}
          {project.developers?.map((d) => d.name).join(', ')}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {['to_do', 'in_progress', 'done'].map((statusKey) => (
          <Grid key={statusKey} xs={12} md={4}>
            <Card elevation={1}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant='subtitle1' fontWeight={700}>
                    {STATUS_LABEL[statusKey]} ({tasksByStatus[statusKey].length}
                    )
                  </Typography>
                  <Divider />
                  {tasksByStatus[statusKey].length === 0 && (
                    <Typography variant='body2' color='text.secondary'>
                      Sin tareas.
                    </Typography>
                  )}
                  {tasksByStatus[statusKey].map((t) => (
                    <Box
                      key={t.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: '#fafafa',
                        border: '1px solid #eee',
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Typography fontWeight={600}>{t.title}</Typography>
                        <Stack
                          direction='row'
                          spacing={1}
                          alignItems='center'
                          flexWrap='wrap'
                        >
                          <Chip
                            size='small'
                            label={STATUS_LABEL[t.status] || t.status}
                            color={STATUS_COLOR[t.status] || 'default'}
                            variant='outlined'
                          />
                          {t.assignees?.map((p) => (
                            <Chip key={p} size='small' label={p} />
                          ))}
                          {t.dueDate && (
                            <Chip
                              size='small'
                              variant='outlined'
                              label={`Vence: ${t.dueDate}`}
                            />
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
