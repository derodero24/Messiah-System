import * as React from 'react';

import {
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { MessiahSystem } from '../typechain-types';
import { WalletContext } from './ethereum/WalletProvider';

function BasicTable(props: { data: any[] }) {
  const { claimReward } = React.useContext(WalletContext);
  const claimPressed = async (proposalId: string) => {
    await claimReward(proposalId);
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell align='right'>appleEater</TableCell>
            <TableCell align='right'>title</TableCell>
            <TableCell align='right'>reward</TableCell>
            <TableCell align='right'>Claim</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map(row => (
            <TableRow
              key={Number(row.id)}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align='right'>{row.appleEater}</TableCell>
              <TableCell align='right'>{row.title}</TableCell>
              <TableCell align='right'>{row.reward.toString()}</TableCell>
              <TableCell align='right'>
                <Button onClick={() => claimPressed(row.id)}>
                  Claim Reward
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function Step4() {
  const { getProposals, getTally, getSubmissions, getMessiahTokenAddress } =
    React.useContext(WalletContext);
  const [appleEatData, setAppleEatData] = React.useState([]);

  const [proposalData, setProposalData] = React.useState<
    MessiahSystem.ProposalStruct[]
  >([]);

  const loadProposalData = async () => {
    const proposalData = await getProposals(1);
    console.log(proposalData);
    if (!proposalData) {
      return 0;
    }

    const tmp = [];
    for (let i = 0; i < proposalData.length; i++) {
      await getSubmissions(proposalData[i].id, 1).then(async submissions => {
        console.log('submissions:', submissions);
        if (!submissions.length) return;
        let winner: MessiahSystem.SubmissionStructOutput | null = null;
        let winnerFor = 2;
        for (let j = 0; j < submissions.length; j++) {
          await getTally(submissions[j].id).then(res => {
            console.log('tally:', res);
            if (Number(res?.totalFor) >= winnerFor) {
              winner = submissions[j];
              winnerFor = Number(res?.totalFor);
            }
          });
        }
        if (winner) {
          tmp.push({
            id: winner.id,
            title: proposalData[i].title,
            reward: proposalData[i].reward.toString(),
            appleEater: winner.submitter,
          });
        }
      });
    }
    setAppleEatData(tmp);

    // proposalData.map(async x => {
    //   const submissions = await getSubmissions(x.id, 1);
    //   let winner = '';
    //   let winnerFor = 0;
    //   submissions.map(async candidate => {
    //     const res = await getTally(candidate.id);

    //     if (Number(res?.totalFor) >= winnerFor) {
    //       winner = candidate.submitter;
    //       winnerFor = Number(res?.totalFor);
    //     }
    //     tmp.push({
    //       proposal: x.id,
    //       reward: x.reward.toString(),
    //       appleEater: winner,
    //     });
    //   });
    // });

    setAppleEatData(tmp);
  };

  React.useEffect(() => {
    loadProposalData();
    getMessiahTokenAddress().then(res => console.log(res));
  }, []);

  return (
    <div>
      <Grid container alignItems='center' justifyContent='center'>
        <Box mt={5} mb={5}>
          <Typography variant='h2' gutterBottom component='div'>
            Apple Eating
          </Typography>
        </Box>
      </Grid>

      <BasicTable data={appleEatData} />
    </div>
  );
}

export default Step4;
