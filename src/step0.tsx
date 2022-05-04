import { ThumbDownOffAlt, ThumbUpOffAlt } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';

function Step0() {
  const votePressed = vote => {};

  return (
    <div>
      <Typography variant='h3' gutterBottom>
        Do you want to create Eden ?{' '}
      </Typography>
      <Button
        onClick={() => {
          votePressed('yes');
        }}
      >
        <ThumbUpOffAlt />
      </Button>
      <Button
        onClick={() => {
          votePressed('no');
        }}
      >
        <ThumbDownOffAlt />
      </Button>
    </div>
  );
}

export default Step0;
