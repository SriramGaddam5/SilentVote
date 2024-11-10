import { Box, Button, Typography } from '@mui/material';
import { type ReactElement, useState, type FormEventHandler } from 'react';
import { Actions } from '@midnight-ntwrk/welcome-api';

import { useAlertContext, useAppContext } from '../../hooks';
import { CHECK_IN_PAGE } from '../../locale';
import { Heading } from '../../components';

export const ParticipantWelcomeView = (): ReactElement | null => {
  const [participantId, setParticipantId] = useState<string>('');
  const { state, isLoading, dispatch } = useAppContext();
  const { askForConfirmation } = useAlertContext();

  if (isLoading && state === undefined) {
    return null;
  }

  const checkIn: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (participantId.length > 0) {
      askForConfirmation({
        title: CHECK_IN_PAGE.checkInConfirmationTitle,
        callback: (confirmed) => {
          if (confirmed) {
            void dispatch({
              type: Actions.checkIn,
              payload: participantId,
            });
          }
        },
      });
    }
  };

  const isCheckedIn = state !== undefined && state.isCheckedIn && state.participantId !== null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
      {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
      <Heading title={CHECK_IN_PAGE.title(isCheckedIn ? state.participantId! : null)} testId="check-in-page-title" />
      <Typography variant="h6" color="#fff" fontWeight={500} data-testid="check-in-title">
        {isCheckedIn ? CHECK_IN_PAGE.checkedIn : CHECK_IN_PAGE.notCheckedIn}
      </Typography>
      <form
        onSubmit={checkIn}
        style={{
          display: isCheckedIn ? 'none' : 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        <input
          value={participantId}
          id="participantId"
          type="text"
          placeholder="username"
          onChange={(e) => {
            setParticipantId(e.target.value);
          }}
          style={{
            fontSize: '1.5rem',
            width: '25vw',
            padding: '1rem 1.5rem',
            borderRadius: '1rem',
            border: 'none',
            background: '#222222',
            color: '#fff',
          }}
        />
        <Button
          variant="contained"
          sx={{
            fontSize: '1.5rem',
            px: '2rem',
            py: '0.5rem',
            borderRadius: '1rem',
            background: participantId.length > 0 ? '#0404fb' : '#222222',
            color: participantId.length > 0 ? '#fff' : '#000',
            cursor: participantId.length > 0 ? 'pointer' : 'default',
            display: isCheckedIn ? 'none' : 'block',
            textTransform: 'none',
          }}
          data-testid={'check-in-button'}
          disableElevation
          type="submit"
        >
          {CHECK_IN_PAGE.checkIn}
        </Button>
      </form>
    </Box>
  );
};
