import { BigNumber } from 'ethers';
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
import { ProposalState } from './ethereum/contractVariables';
import { WalletContext } from './ethereum/WalletProvider';

type appleEatItem = {
  id: BigNumber;
  title: string;
  reward: string;
  appleEater: string;
};

function BasicTable(props: { data: appleEatItem[] }) {
  const { claimReward } = React.useContext(WalletContext);

  const claimPressed = async (proposalId: BigNumber) => {
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
  const { getProposals, getTally, getSubmissions } =
    React.useContext(WalletContext);
  const [appleEatData, setAppleEatData] = React.useState<appleEatItem[]>([]);

  const loadProposalData = React.useCallback(async () => {
    const proposalData = await getProposals(1).then(proposals =>
      proposals.filter(x => x.state === ProposalState.DEVELOPING)
    );
    // console.log(proposalData);
    if (!proposalData) return;

    const newAppleEatData: appleEatItem[] = [];
    for (let i = 0; i < proposalData.length; i++) {
      await getSubmissions(proposalData[i].id, 1).then(async submissions => {
        // console.log('submissions:', submissions);
        if (!submissions.length) return;
        let winner: MessiahSystem.SubmissionStructOutput | null = null;
        let winnerFor = 2;
        for (let j = 0; j < submissions.length; j++) {
          const tally = await getTally(submissions[j].id);
          // console.log('tally:', tally);
          if (tally && tally.totalFor.toNumber() >= winnerFor) {
            winner = submissions[j];
            winnerFor = tally.totalFor.toNumber();
          }
        }
        if (winner) {
          newAppleEatData.push({
            id: winner.id,
            title: proposalData[i].title,
            reward: proposalData[i].reward.toString(),
            appleEater: winner.submitter,
          });
        }
      });
    }
    setAppleEatData(newAppleEatData);
  }, [getProposals, getSubmissions, getTally]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      loadProposalData();
    }, 1000);
    return () => clearInterval(timer);
  }, [loadProposalData]);

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
