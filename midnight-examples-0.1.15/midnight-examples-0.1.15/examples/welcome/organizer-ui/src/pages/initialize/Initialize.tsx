import { Box, Button, TextField, Typography, styled } from '@mui/material';
import { type ReactElement, useEffect, useState } from 'react';
import { useAlertContext, useAppContext } from '../../hooks';
import { INITIALIZE_PAGE } from '../../locale';

export const StyledTextField = styled(TextField)({
  '& label.Mui-focused': {
    color: '#A0AAB4',
  },
  '& label': {
    color: '#ffffff',
  },
  '& MuiFormLabel-root': {
    color: '#ffffff',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#B2BAC2',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#E0E3E7',
    },
    '&:hover fieldset': {
      borderColor: '#B2BAC2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6F7E8C',
    },
  },
});

export const Initialize = (): ReactElement => {
  const [joinAddress, setJoinAddress] = useState<string>('');
  const [joinAddressFocus, setJoinAddressFocus] = useState(false);
  const [participants, setParticipants] = useState<string>('');
  const [participantsFocus, setParticipantsFocus] = useState(false);
  const { dispatch, contractAddress } = useAppContext();
  const { askForConfirmation } = useAlertContext();

  useEffect(() => {
    if (joinAddress === '' && contractAddress !== null) {
      setJoinAddress(contractAddress);
    }
  }, [joinAddress, contractAddress]);

  const handleDeploy = (): void => {
    if (participants.length > 0) {
      askForConfirmation({
        title: 'Deploy',
        text: 'Do you want to deploy the contract?',
        callback: async () => {
          const initialParticipants = participants.split(' ');
          await dispatch({ type: 'deploy', payload: initialParticipants });
        },
      });
    }
  };

  const handleJoin = (): void => {
    if (joinAddress === '') {
      return undefined;
    }
    askForConfirmation({
      title: 'Join',
      text: 'Do you want to join an existing contract?',
      callback: async () => {
        await dispatch({ type: 'join', payload: joinAddress });
      },
    });
  };

  return (
    <>
      <Typography
        variant="h5"
        color="#fff"
        fontWeight={500}
        data-testid="initialize-title"
        textAlign="center"
        width="50vw"
        mb={2}
      >
        {INITIALIZE_PAGE.title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItem: 'center', gap: 2 }}>
          <StyledTextField
            id="join-address-input"
            data-testid="join-address-input"
            label={INITIALIZE_PAGE.joinAddress}
            fullWidth
            value={joinAddress}
            focused={joinAddressFocus || (joinAddress !== '' && joinAddress.length > 0)}
            onChange={(e) => {
              setJoinAddress(e.target.value);
            }}
            onFocus={() => {
              setJoinAddressFocus(true);
            }}
            onBlur={() => {
              setJoinAddressFocus(false);
            }}
          />
          <Button
            variant="contained"
            sx={{
              fontSize: '1.5rem',
              px: '2rem',
              py: '0.5rem',
              borderRadius: '1rem',
              background: joinAddress.length > 0 ? '#0404fb' : '#222222',
              color: joinAddress.length > 0 ? '#fff' : '#000',
              cursor: joinAddress.length > 0 ? 'pointer' : 'default',
              textTransform: 'none',
            }}
            onClick={() => {
              handleJoin();
            }}
          >
            {INITIALIZE_PAGE.join}
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItem: 'center', gap: 2 }}>
          <StyledTextField
            id="participants-input"
            data-testid="participants-input"
            label={INITIALIZE_PAGE.participants}
            fullWidth
            value={participants}
            focused={participantsFocus || (participants != null && participants.length > 0)}
            onChange={(e) => {
              setParticipants(e.target.value);
            }}
            onFocus={() => {
              setParticipantsFocus(true);
            }}
            onBlur={() => {
              setParticipantsFocus(false);
            }}
          />
          <Button
            variant="contained"
            sx={{
              fontSize: '1.5rem',
              px: '2rem',
              py: '0.5rem',
              borderRadius: '1rem',
              background: participants.length > 0 ? '#0404fb' : '#222222',
              color: participants.length > 0 ? '#fff' : '#000',
              cursor: participants.length > 0 ? 'pointer' : 'default',
              textTransform: 'none',
            }}
            onClick={() => {
              handleDeploy();
            }}
          >
            {INITIALIZE_PAGE.deploy}
          </Button>
        </Box>
      </Box>
    </>
  );
};
