import { type ReactElement, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Actions, Roles } from '@midnight-ntwrk/welcome-api';
import { useAppContext } from '../../hooks';
import { StyledTextField } from '../initialize';
import { WELCOME_PAGE } from '../../locale';

export const OrganizerWelcomeView = (): ReactElement | null => {
  const [participantToAdd, setParticipantToAdd] = useState<string>('');
  const [organizerToAdd, setOrganizerToAdd] = useState<string>('');
  const { state, isLoading, contractAddress, dispatch } = useAppContext();

  if (isLoading && state === undefined) {
    return null;
  }

  const isAdded = state !== undefined && state.role === Roles.organizer;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddOrganizer = async (): Promise<void> => {
    if (organizerToAdd === '') {
      return;
    }
    await dispatch({ type: Actions.addOrganizer, payload: organizerToAdd });
    setOrganizerToAdd('');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddParticipant = async (): Promise<void> => {
    if (participantToAdd === '') {
      return;
    }
    await dispatch({ type: Actions.addParticipant, payload: participantToAdd });
    setParticipantToAdd('');
  };

  return (
    <>
      <Typography
        variant="h5"
        color="#fff"
        fontWeight={500}
        data-testid="welcome-title"
        textAlign="center"
        width="50vw"
        mb={2}
      >
        {WELCOME_PAGE.title(isAdded)}
      </Typography>
      <Typography
        variant="h5"
        color="#fff"
        fontWeight={500}
        data-testid="address-title"
        textAlign="center"
        width="50vw"
        mb={2}
      >
        {WELCOME_PAGE.address(contractAddress ?? '')}
      </Typography>
      <Typography
        variant="h5"
        color="#fff"
        fontWeight={500}
        data-testid="address-title"
        textAlign="center"
        width="50vw"
        mb={2}
      >
        {WELCOME_PAGE.publicKey(state === undefined ? 'loading...' : state.publicKey)}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItem: 'center', gap: 2 }}>
          <StyledTextField
            id="organizer-input"
            data-testid="organizer-input"
            label={WELCOME_PAGE.organizer}
            fullWidth
            value={organizerToAdd}
            onChange={(e) => {
              setOrganizerToAdd(e.target.value);
            }}
          />
          <Button
            variant="contained"
            sx={{
              fontSize: '1.5rem',
              px: '2rem',
              py: '0.5rem',
              borderRadius: '1rem',
              background: organizerToAdd.length > 0 ? '#0404fb' : '#222222',
              color: organizerToAdd.length > 0 ? '#fff' : '#000',
              cursor: organizerToAdd.length > 0 ? 'pointer' : 'default',
              textTransform: 'none',
            }}
            onClick={async () => {
              await handleAddOrganizer();
            }}
          >
            {WELCOME_PAGE.add}
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItem: 'center', gap: 2 }}>
          <StyledTextField
            id="participant-input"
            data-testid="participant-input"
            label={WELCOME_PAGE.participant}
            fullWidth
            value={participantToAdd}
            onChange={(e) => {
              setParticipantToAdd(e.target.value);
            }}
          />
          <Button
            variant="contained"
            sx={{
              fontSize: '1.5rem',
              px: '2rem',
              py: '0.5rem',
              borderRadius: '1rem',
              background: participantToAdd.length > 0 ? '#0404fb' : '#222222',
              color: participantToAdd.length > 0 ? '#fff' : '#000',
              cursor: participantToAdd.length > 0 ? 'pointer' : 'default',
              textTransform: 'none',
            }}
            onClick={async () => {
              await handleAddParticipant();
            }}
          >
            {WELCOME_PAGE.add}
          </Button>
        </Box>
      </Box>
    </>
  );
};
