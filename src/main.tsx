import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './theme/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import {applyDevAutoLogin} from './lib/devAutoLogin';
import './index.css';

const rootEl = document.getElementById('root')!;

void applyDevAutoLogin().finally(() => {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
});
