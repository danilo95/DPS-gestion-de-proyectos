'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getTheme } from './theme';

export default function Providers({ children }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(prefersDark ? 'dark' : 'light');

  useEffect(() => {
    setMode(prefersDark ? 'dark' : 'light');
  }, [prefersDark]);

  const theme = getTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
