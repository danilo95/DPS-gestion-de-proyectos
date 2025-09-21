'use client';

import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
});

export default theme;


export const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      secondary: { main: '#9c27b0' },
      background: {
        default: mode === 'light' ? '#f5f7fb' : '#f5f7fb',
        paper: mode === 'light' ? '#ffffff' : '#dfe5f1ff',
      },
      typography:{
        h4: { fontWeight: 700, color: '#1e1e1e' },
      }
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            padding: '1rem',
            boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
            backgroundColor: '#f3f3f3ff',
            
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
            },
          },
        },
      },
      
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 8, borderRadius: 8 },
          bar: { borderRadius: 8 },
        },
      },
    },
  });
