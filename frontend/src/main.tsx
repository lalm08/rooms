import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material' // Добавили это
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/context/auth'

// Создаем конфиг темы в стиле твоего скриншота "как надо"
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Тот самый синий цвет кнопок
    },
    background: {
      default: '#f8fafc', // Светло-серый фон страницы
      paper: '#ffffff',   // Белый фон карточек
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  shape: {
    borderRadius: 12, // Скругление углов у всех карточек и кнопок
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none', // Чтобы текст на кнопках не был капсом
      fontWeight: 600,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}> {/* Добавили обертку темой */}
      <CssBaseline /> {/* Сбрасывает лишние отступы браузера */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)