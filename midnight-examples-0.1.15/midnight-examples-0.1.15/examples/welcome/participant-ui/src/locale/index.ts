export const MISC = {
  yes: 'Yes',
  no: 'No',
  pleaseWait: 'Please wait',
};

export const CHECK_IN_PAGE = {
  title: (maybeParticipantId: string | null) =>
    maybeParticipantId === null ? 'Welcome to Midnight.' : `Welcome ${maybeParticipantId}.`,
  checkedIn: `You're checked in. Have fun.`,
  notCheckedIn: 'Enter your GitHub username to check in.',
  checkIn: 'Check In',
  checkInConfirmationTitle: 'Are you sure you want to check in?',
};
