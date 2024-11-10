import { type ReactElement } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';

import { MainLayout } from './components';
import { AppProvider, ErrorProvider, AlertProvider } from './contexts';
import { Initialize, OrganizerWelcomeView } from './pages';
import { type Logger } from 'pino';

const App = ({ logger }: { logger: Logger }): ReactElement => {
  const theme = useTheme();
  return (
    <Box sx={{ background: theme.palette.secondary.main, minHeight: '100vh' }}>
      <Router>
        <ErrorProvider>
          <AlertProvider>
            <AppProvider logger={logger}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route path="/organizer-welcome-view" element={<OrganizerWelcomeView />} />
                  <Route path="/initialize" element={<Initialize />} />
                  <Route path="/" element={<Navigate to="/initialize" replace />} />
                </Route>
              </Routes>
            </AppProvider>
          </AlertProvider>
        </ErrorProvider>
      </Router>
    </Box>
  );
};

export default App;
