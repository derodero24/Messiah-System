import * as React from 'react';

import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';

import { WalletContext } from './ethereum/WalletProvider';

type messiahProps = {
  erc721Add: string;
  erc20Add: string;
};

function OtherSite() {
  const { deployMessiahSystem, connectMessiahSystem } =
    React.useContext(WalletContext);
  const [createMessiahProps, setCreateMessiahProps] =
    React.useState<messiahProps>({ erc721Add: '', erc20Add: '' });
  const [erc721Address, setERC721Address] = React.useState('');
  const [messiahExists, setMessiahExists] = React.useState(false);
  const [checkFlag, setCheckFlag] = React.useState(false);

  const createMessiahPressed = async () => {
    //contract method
    console.log(createMessiahProps);
    // デプロイTX
    const res = await deployMessiahSystem(
      createMessiahProps.erc721Add,
      createMessiahProps.erc20Add
    );
    if (res) {
      // TX完了まで1秒ごとに更新
      const timer = setInterval(async () => {
        const res = await connectMessiahSystem(createMessiahProps.erc721Add);
        if (res) {
          clearInterval(timer);
          setMessiahExists(true);
        }
      }, 1000);
    }
  };

  const checkMessiahExistsPressed = async () => {
    //contract method
    setMessiahExists(await connectMessiahSystem(erc721Address));
    setCheckFlag(true);
  };

  const handleChange721 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setERC721Address(e.target.value);
  };

  const CreateMessiahHandleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCreateMessiahProps({
      ...createMessiahProps,
      [event.target.name]: event.target.value,
    });
  };

  const createMessiahForm = () => {
    if (messiahExists) {
      return <Typography variant='h4'>You Go Next Step</Typography>;
    } else if (!checkFlag) {
      return (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant='h4'>You Can Check Messiah Exists</Typography>
          <Box sx={{ mt: 4, mx: 2 }}>
            <Typography variant='h5' gutterBottom sx={{ mt: 4 }}>
              Please Input ERC-721 Token Address
            </Typography>
            <TextField
              type='text'
              name='ERC-721 Token Address'
              value={erc721Address}
              onChange={handleChange721}
              label='ERC-721 Token Address'
              placeholder='0x742982...'
              fullWidth
              variant='outlined'
              required
            />
            <Button
              sx={{
                my: 2,
                backgroundColor: 'mediumblue',
                '&:hover': { background: 'blueviolet' },
              }}
              variant='contained'
              onClick={checkMessiahExistsPressed}
              fullWidth
            >
              Check Messiah Exists
            </Button>
          </Box>
        </Paper>
      );
    } else {
      return (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant='h4'>You can make Messiah</Typography>
          <Box sx={{ m: 4 }}>
            <Typography variant='h5' gutterBottom>
              Please Input ERC-721 Token Address
            </Typography>
            <TextField
              type='text'
              name='erc721Add'
              value={createMessiahProps.erc721Add}
              onChange={CreateMessiahHandleChange}
              label='ERC-721 Token Address'
              placeholder='0x742982...'
              fullWidth
              variant='outlined'
              required
            />
          </Box>
          <Box sx={{ m: 4 }}>
            <Typography variant='h5' gutterBottom>
              Please Input ERC-20 Token Address
            </Typography>
            <TextField
              type='text'
              name='erc20Add'
              value={createMessiahProps.erc20Add}
              onChange={CreateMessiahHandleChange}
              label='ERC-20 Token Address'
              placeholder='0x742982...'
              fullWidth
              variant='outlined'
              required
            />
          </Box>
          <Button
            sx={{
              mt: 2,
              backgroundColor: 'mediumblue',
              '&:hover': { background: 'blueviolet' },
            }}
            variant='contained'
            onClick={() => {
              createMessiahPressed();
            }}
            fullWidth
          >
            Create Messiah System
          </Button>
        </Paper>
      );
    }
  };

  return (
    <div>
      <Grid container justifyContent='center'>
        <Typography mt={5} mb={5} variant='h2'>
          Messiah System
        </Typography>
      </Grid>
      {createMessiahForm()}
    </div>
  );
}

export default OtherSite;
