import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider, CssBaseline } from '@mui/material';
import EmotionRegistry from './EmotionRegistry';
import theme from './theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'My App',
  description: 'Next.js + MUI + Axios (JS)',
};

export default function RootLayout({ children }) {
  return (
    <html lang='es'>
      <body className={inter.className}>
        <EmotionRegistry>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
