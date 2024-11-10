import { type ReactElement } from 'react';
import { Typography } from '@mui/material';

interface HeadingProps {
  title: string | undefined;
  testId?: string;
}

export const Heading = ({ title, testId }: HeadingProps): ReactElement => {
  return (
    <>
      <Typography variant="h3" fontWeight={700} color="#fff" sx={{ mb: 2 }} data-testid={testId}>
        {title}
      </Typography>
    </>
  );
};
