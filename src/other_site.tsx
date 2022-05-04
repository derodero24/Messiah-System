import * as React from 'react';

import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';

import { WalletContext } from './ethereum/WalletProvider';

type messiahProps = {
  erc721Add: string;
  erc20Add: string;
};

function OtherSite() {
  const { deployMessiahSystem, checkMessiahExists, updateContract } =
    React.useContext(WalletContext);
  const [createMessiahProps, setCreateMessiahProps] =
    React.useState<messiahProps>({ erc721Add: '', erc20Add: '' });
  const [erc721Address, setERC721Address] = React.useState('');
  const [messiahExists, setMessiahExists] = React.useState(false);
  const [checkFlag, setCheckFlag] = React.useState(false);

  const createMessiahPressed = async () => {
    //contract method
    console.log(createMessiahProps);
    await deployMessiahSystem(
      createMessiahProps.erc721Add,
      createMessiahProps.erc20Add
    );
    const res = await checkMessiahExists(createMessiahProps.erc721Add);

    //const res = "0x0000000000000000000000000000000000000000";
    //const res = "0x0000000000000000000000000000000000000001";

    if (res == '0x0000000000000000000000000000000000000000') {
      setMessiahExists(false);
    } else {
      setMessiahExists(true);
      await updateContract(res);
    }
  };

  const checkMessiahExistsPressed = async () => {
    //contract method
    const res = await checkMessiahExists(erc721Address);

    //const res = "0x0000000000000000000000000000000000000000";
    //const res = "0x0000000000000000000000000000000000000001";

    if (res == '0x0000000000000000000000000000000000000000') {
      setMessiahExists(false);
    } else {
      setMessiahExists(true);
      await updateContract(res);
    }

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
    if (!checkFlag) {
      return (
        <div>
          <Paper>
            <Box sx={{ m: 2 }}>
              <Typography variant='h4' gutterBottom>
                You Can Check Messiah Exists
              </Typography>
              <Box sx={{ m: 4 }}>
                <Typography variant='h5' gutterBottom>
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
                <Box sx={{ mt: 2 }}>
                  <Button
                    sx={{
                      mb: 2,
                      backgroundColor: 'mediumblue',
                      '&:hover': { background: 'blueviolet' },
                    }}
                    variant='contained'
                    onClick={() => {
                      checkMessiahExistsPressed();
                    }}
                    fullWidth
                  >
                    Check Messiah Exists
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </div>
      );
    }
    if (messiahExists) {
      return (
        <Typography variant='h4' gutterBottom>
          You Go Next Step
        </Typography>
      );
    } else {
      return (
        <div>
          <Paper>
            <Box sx={{ m: 2 }}>
              <Typography variant='h4' gutterBottom>
                You can make Messiah
              </Typography>
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
              <Box sx={{ mt: 2 }}>
                <Button
                  sx={{
                    mb: 2,
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
              </Box>
            </Box>
          </Paper>
        </div>
      );
    }
  };

  //<p>erc721: 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D</p>
  //<p>erc20: 0x4d224452801ACEd8B2F0aebE155379bb5D594381</p>

  return (
    <div>
      <Grid container alignItems='center' justifyContent='center'>
        <Box mt={5} mb={5}>
          <Typography variant='h2' gutterBottom component='div'>
            Messiah System
          </Typography>
        </Box>
      </Grid>

      {createMessiahForm()}
    </div>
  );
}

export default OtherSite;
