import _ from 'lodash';
import * as React from 'react';

import { HowToVote, Send } from '@mui/icons-material';
import ReplayIcon from '@mui/icons-material/Replay';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { MessiahSystem } from '../typechain-types';
import { Option, ProposalState } from './ethereum/contractVariables';
import { WalletContext } from './ethereum/WalletProvider';

function ProposalTable(props: { proposals: MessiahSystem.ProposalStruct[] }) {
  const { voteForProposal, getTally, endVoting } =
    React.useContext(WalletContext);
  const [voteCounts, setVoteCounts] = React.useState<number[]>([]);

  React.useEffect(() => {
    // 1秒ごとに票数更新
    const timer = setInterval(() => {
      for (let i = 0; i < props.proposals.length; i++) {
        getTally(props.proposals[i].id).then(tally => {
          if (tally) {
            console.log(tally);
            setVoteCounts(prev => {
              const newVoteCounts = _.cloneDeep(prev);
              newVoteCounts[i] = tally.totalFor.toNumber();
              return newVoteCounts;
            });
          }
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [props.proposals, getTally]);

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell align='right'>Title</TableCell>
            <TableCell align='right'>Description</TableCell>
            <TableCell align='right'>Reward</TableCell>
            <TableCell align='right'>Vote</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.proposals.map((row, idx) => (
            <TableRow
              key={row.id.toString()}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align='right'>
                <Button onClick={async () => endVoting(row.id)}>{'　'}</Button>
                {row.title}
              </TableCell>
              <TableCell align='right'>{row.description}</TableCell>
              <TableCell align='right'>{row.reward.toString()}</TableCell>
              <TableCell align='right'>
                <Button
                  onClick={async () => voteForProposal(row.id, Option.FOR)}
                >
                  <HowToVote />
                </Button>
                {voteCounts[idx]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

type ProposalProfile = {
  title: string;
  description: string;
  reward: string;
};

const TextFieldItem = (props: {
  type: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <Grid item xs={12}>
    <TextField
      type={props.type}
      name={props.name}
      label={props.name}
      value={props.value}
      placeholder={props.placeholder}
      onChange={props.onChange}
      fullWidth
      variant='outlined'
      required
    />
  </Grid>
);

function Step2() {
  const { submitProposal, getProposals } = React.useContext(WalletContext);
  const [proposals, setProposals] = React.useState<
    MessiahSystem.ProposalStruct[]
  >([]);
  const [proposal, setProposal] = React.useState<ProposalProfile>({
    title: '',
    description: '',
    reward: '',
  });

  const submitProposalPressed = async () => {
    if (proposal.title && proposal.description && proposal.reward) {
      await submitProposal(
        proposal.title,
        proposal.description,
        Number(proposal.reward)
      );
    }
  };

  const updateProposalData = React.useCallback(() => {
    // ページロード時にProposal一覧を更新
    getProposals(1).then(data => {
      console.log('proposals:', data);
      setProposals(data.filter(item => item.state === ProposalState.VOTING));
    });
  }, [getProposals]);

  React.useEffect(() => {
    updateProposalData();
  }, [updateProposalData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProposal({
      ...proposal,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div>
      <Grid container justifyContent='center'>
        <Typography variant='h2' mt={5} mb={5}>
          Proposal List
        </Typography>
        <IconButton onClick={updateProposalData}>
          <ReplayIcon sx={{ fontSize: '2rem' }} />
        </IconButton>
      </Grid>

      <ProposalTable proposals={proposals} />

      <Box sx={{ height: '64px' }} />

      <Paper elevation={3} sx={{ p: 2, pt: 4 }}>
        <Grid container justifyContent={'center'} spacing={1}>
          <Typography variant='h4' gutterBottom>
            Submit Proposal
          </Typography>
          <TextFieldItem
            type='string'
            name='title'
            value={proposal.title}
            onChange={handleChange}
            placeholder='hogehoge'
          />
          <TextFieldItem
            type='string'
            name='description'
            value={proposal.description}
            onChange={handleChange}
            placeholder='hogehoge'
          />
          <TextFieldItem
            type='number'
            name='reward'
            value={proposal.reward}
            onChange={handleChange}
            placeholder='2000'
          />
          <Grid item xs={12}>
            <Button
              variant='contained'
              onClick={submitProposalPressed}
              startIcon={<Send />}
              fullWidth
              type='button'
              sx={{ py: 1.5, fontSize: '1rem' }}
            >
              Submit Proposal
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}

export default Step2;
