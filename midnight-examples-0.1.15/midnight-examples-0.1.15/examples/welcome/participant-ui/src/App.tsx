import { type ReactElement } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';

import { MainLayout } from './components';
import { AppProvider, ErrorProvider, AlertProvider } from './contexts';
import { ParticipantWelcomeView } from './pages';
import { type Logger } from 'pino';

const App = ({ logger }: { logger: Logger }): ReactElement => {
  return (
    <Box sx={{ background: '#000', minHeight: '100vh' }}>
      <Router>
        <ErrorProvider>
          <AlertProvider>
            <AppProvider logger={logger}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route path="/participant-welcome-view" element={<ParticipantWelcomeView />} />
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
