'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
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

import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';

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

function DraggableTask({ task, children }) {
  const disabled = task.status === 'done';
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task, from: task.status },
      disabled,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!disabled ? listeners : {})}
    >
      {children}
    </div>
  );
}

function DroppableColumn({ statusKey, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: statusKey,
    data: { statusKey },
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        borderRadius: 8,
        outline: isOver ? '2px solid #1976d2' : '2px solid transparent',
        transition: 'outline 120ms ease',
      }}
    >
      {children}
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();

  const [project, setProject] = useState(undefined);
  const [saving, setSaving] = useState(false);

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const persistTasks = useCallback(
    async (nextTasks, prevTasks) => {
      try {
        setSaving(true);
        await api.patch(`/projects/${id}`, { tasks: nextTasks });
      } catch (e) {
        setProject((p) => (p ? { ...p, tasks: prevTasks } : p));
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  const onDragEnd = useCallback(
    ({ active, over }) => {
      if (!project || !active) return;

      const draggedTask = active.data?.current?.task;
      const from = active.data?.current?.from;
      const to = over?.id;

      if (!to || !['to_do', 'in_progress', 'done'].includes(String(to))) return;
      if (from === to) return;

      if (draggedTask?.status === 'done') return;

      const prevTasks = project.tasks || [];
      const nextTasks = prevTasks.map((t) =>
        t.id === draggedTask.id ? { ...t, status: to } : t
      );

      setProject((p) => (p ? { ...p, tasks: nextTasks } : p));

      persistTasks(nextTasks, prevTasks);
    },
    [project, persistTasks]
  );

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
        {saving && (
          <Typography variant='caption' color='text.secondary'>
            Guardando cambios…
          </Typography>
        )}
      </Box>

      <DndContext
        sensors={sensors}
        onDragEnd={onDragEnd}
        collisionDetection={closestCorners}
      >
        <Grid container spacing={2}>
          {['to_do', 'in_progress', 'done'].map((statusKey) => (
            <Grid key={statusKey} xs={12} md={4}>
              <DroppableColumn statusKey={statusKey}>
                <Card elevation={1}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant='subtitle1' fontWeight={700}>
                        {STATUS_LABEL[statusKey]} (
                        {tasksByStatus[statusKey].length})
                      </Typography>
                      <Divider />
                      {tasksByStatus[statusKey].length === 0 && (
                        <Typography variant='body2' color='text.secondary'>
                          Sin tareas.
                        </Typography>
                      )}
                      {tasksByStatus[statusKey].map((t) => (
                        <DraggableTask key={t.id} task={t}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              bgcolor: '#fafafa',
                              border: '1px solid #eee',
                              '&:hover': { borderColor: '#ddd' },
                              userSelect: 'none',
                            }}
                          >
                            <Stack spacing={0.5}>
                              <Typography fontWeight={600}>
                                {t.title}
                              </Typography>
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
                        </DraggableTask>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </DroppableColumn>
            </Grid>
          ))}
        </Grid>
      </DndContext>
    </Stack>
  );
}
