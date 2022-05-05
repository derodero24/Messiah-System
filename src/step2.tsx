import * as React from 'react';

import { HowToVote, Send } from '@mui/icons-material';
import { Button, Grid, Paper, TextField, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { MessiahSystem } from '../typechain-types';
import { Option } from './ethereum/contractVariables';
import { WalletContext } from './ethereum/WalletProvider';

function ProposalTable() {
  const { getProposals, voteForProposal, getTally } =
    React.useContext(WalletContext);
  const [proposals, setProposals] = React.useState<
    MessiahSystem.ProposalStruct[]
  >([]);
  const [voteCounts, setVoteCounts] = React.useState<number[]>([]);
  const timer = React.useRef<NodeJS.Timer>();

  React.useEffect(() => {
    // ページロード時にProposal一覧を更新
    getProposals(1).then(data => {
      console.log(data);
      setProposals(data);
    });
  }, [getProposals]);

  React.useEffect(() => {
    // Proposal一覧が更新されたら初期化
    setVoteCounts(Array.from({ length: proposals.length }, () => 0));
  }, [proposals]);

  React.useEffect(() => {
    // 1秒ごとに票数更新
    if (timer.current) clearInterval(timer.current);
    const newVoteCounts = Array.from({ length: proposals.length }, () => 0);
    timer.current = setInterval(() => {
      for (let i = 0; i < proposals.length; i++) {
        getTally(proposals[i].id).then(tally => {
          if (tally) {
            // console.log(tally);
            newVoteCounts[i] = tally.totalFor.toNumber();
            setVoteCounts(newVoteCounts);
          }
        });
      }
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [proposals, getTally]);

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
          {proposals.map((row, idx) => (
            <TableRow
              key={row.id.toString()}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align='right'>{row.title}</TableCell>
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
  const { submitProposal } = React.useContext(WalletContext);
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
      </Grid>

      <ProposalTable />

      <Paper elevation={3} sx={{ my: 4, p: 2, pt: 4 }}>
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
