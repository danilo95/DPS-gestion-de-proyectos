'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function ProyectosLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  // menu móvil (xs/sm)
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  useEffect(() => {
    const raw = localStorage.getItem('auth_user');
    if (!raw) {
      router.replace('/');
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      router.replace('/');
    }
  }, [router]);

  // acepta "admin" o "administrador"
  const isAdmin = useMemo(
    () => user?.role === 'admin' || user?.role === 'administrador',
    [user]
  );

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    router.push('/');
  };

  const goCreateUser = () => {
    closeMenu();
    if (pathname !== '/proyectos/usuarios/nuevo') {
      router.push('/proyectos/usuarios/nuevo');
    }
  };

  const goCreateProject = () => {
    closeMenu();
    if (pathname !== '/proyectos/nuevo') {
      router.push('/proyectos/nuevo');
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f3f3f3' }}>
      <AppBar position='sticky' sx={{ bgcolor: '#111' }} elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, mr: 2, cursor: 'pointer' }}
            onClick={() => router.push('/proyectos')}
          >
            Proyectos
          </Typography>

          {/* Acciones de admin  */}
          {isAdmin && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button
                color='inherit'
                startIcon={<PersonAddAlt1Icon />}
                onClick={goCreateUser}
                disabled={pathname === '/proyectos/usuarios/nuevo'}
              >
                Crear usuario
              </Button>

              <Button
                color='inherit'
                startIcon={<AddCircleOutlineIcon />}
                onClick={goCreateProject}
                disabled={pathname === '/proyectos/nuevo'}
              >
                Crear proyecto
              </Button>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Acciones de admin - versión móvil */}
          {isAdmin && (
            <Box sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
              <Tooltip title='Más'>
                <IconButton color='inherit' onClick={openMenu} size='small'>
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={closeMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem
                  onClick={goCreateUser}
                  disabled={pathname === '/proyectos/usuarios/nuevo'}
                >
                  <PersonAddAlt1Icon
                    fontSize='small'
                    style={{ marginRight: 8 }}
                  />
                  Crear usuario
                </MenuItem>
                <MenuItem
                  onClick={goCreateProject}
                  disabled={pathname === '/proyectos/nuevo'}
                >
                  <AddCircleOutlineIcon
                    fontSize='small'
                    style={{ marginRight: 8 }}
                  />
                  Crear proyecto
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* Perfil y logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
            <AccountCircleIcon fontSize='small' />
            <Typography variant='body2' sx={{ mr: 1 }}>
              {user?.name ?? user?.username} {isAdmin ? '(admin)' : ''}
            </Typography>

            <Tooltip title='Cerrar sesión'>
              <IconButton color='inherit' onClick={handleLogout} size='small'>
                <LogoutRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth='lg' sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
