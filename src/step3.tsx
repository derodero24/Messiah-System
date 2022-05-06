import _ from 'lodash';
import * as React from 'react';

import { FollowTheSigns, HowToVote, Send } from '@mui/icons-material';
import ReplayIcon from '@mui/icons-material/Replay';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
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

function ProposalTable(props: { data: MessiahSystem.ProposalStruct[] }) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState({
    title: '',
    id: '',
  });

  const handleClickOpen = (title: string, id: string) => {
    setSelectedValue({ title, id });
    setOpen(true);
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell align='right'>Title</TableCell>
              <TableCell align='right'>Reward</TableCell>
              <TableCell align='right'>Submit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.data.map(row => (
              <TableRow
                key={row.id.toString()}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align='right'>{row.title}</TableCell>
                <TableCell align='right'>{row.reward.toString()}</TableCell>
                <TableCell align='right'>
                  <Button
                    onClick={() => {
                      handleClickOpen(row.title, row.id.toString());
                    }}
                  >
                    <FollowTheSigns />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <SimpleDialog
        title={selectedValue.title}
        id={selectedValue.id}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

function CandidateTable(props: { data: MessiahSystem.SubmissionStruct[] }) {
  const { voteForSubmission, getTally } = React.useContext(WalletContext);
  const [voteCounts, setVoteCounts] = React.useState<number[]>([]);

  React.useEffect(() => {
    // 1秒ごとに票数更新
    const timer = setInterval(() => {
      for (let i = 0; i < props.data.length; i++) {
        getTally(props.data[i].id).then(tally => {
          if (tally) {
            // console.log(tally);
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
  }, [props.data, getTally]);

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell align='right'>Submitter</TableCell>
              <TableCell align='right'>Github</TableCell>
              <TableCell align='right'>Comment</TableCell>
              <TableCell align='right'>Vote</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.data.map((row, idx) => (
              <TableRow
                key={row.submitter}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align='right'>{row.submitter}</TableCell>
                <TableCell align='right'>{row.url}</TableCell>
                <TableCell align='right'>{row.comment}</TableCell>
                <TableCell align='right'>
                  <Button
                    onClick={() => {
                      voteForSubmission(row.id, Option.FOR);
                    }}
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
    </div>
  );
}

export interface SimpleDialogProps {
  open: boolean;
  title: string;
  id: string;
  onClose: () => void;
}

type commitProfile = {
  github: string;
  comment: string;
};

function SimpleDialog(props: SimpleDialogProps) {
  const { submitProduct } = React.useContext(WalletContext);
  const { onClose, title, id, open } = props;
  const [commitProps, setCommitProps] = React.useState<commitProfile>({
    github: '',
    comment: '',
  });

  const submitGithubPressed = async (id: string) => {
    await submitProduct(id, commitProps.github, commitProps.comment);
    setCommitProps({ github: '', comment: '' });
    onClose();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommitProps({
      ...commitProps,
      [event.target.name]: event.target.value,
    });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>
        {title} {id}
      </DialogTitle>
      <Grid container justifyContent={'center'}>
        <Grid item xs={12}>
          <TextField
            type='text'
            name='github'
            value={commitProps.github}
            onChange={handleChange}
            label='https://github/repo'
            placeholder='https://github/repo'
            fullWidth
            variant='outlined'
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            type='text'
            name='comment'
            value={commitProps.comment}
            onChange={handleChange}
            label='comment'
            placeholder='good point'
            fullWidth
            variant='outlined'
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant='contained'
            onClick={() => {
              submitGithubPressed(id);
            }}
            startIcon={<Send />}
            fullWidth
            type='button'
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Dialog>
  );
}

type candidateProps = {
  proposal: MessiahSystem.ProposalStruct;
  candidate: MessiahSystem.SubmissionStruct[];
};

function Step3() {
  const { getProposals, getSubmissions } = React.useContext(WalletContext);
  const [proposalData, setProposalData] = React.useState<
    MessiahSystem.ProposalStruct[]
  >([]);
  const [candidateData, setCandidateData] = React.useState<candidateProps[]>(
    []
  );

  const updateProposalData = React.useCallback(() => {
    // Proposal一覧取得
    getProposals(1).then(proposals => {
      console.log('proposals:', proposals);
      if (!proposals) return;
      setProposalData(
        proposals.filter(x => x.state === ProposalState.DEVELOPING)
      );
    });
  }, [getProposals]);

  React.useEffect(() => {
    updateProposalData();
  }, [updateProposalData]);

  React.useEffect(() => {
    // Candidate一覧を1秒おきに更新取得
    const newCandidateData: candidateProps[] = Array.from(
      { length: proposalData.length },
      (_, idx) => ({ proposal: proposalData[idx], candidate: [] })
    );
    const timer = setInterval(() => {
      for (let i = 0; i < proposalData.length; i++) {
        getSubmissions(proposalData[i].id, 1).then(submissionData => {
          if (submissionData) {
            newCandidateData[i].candidate = submissionData;
            setCandidateData(newCandidateData);
          }
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [proposalData, getSubmissions]);

  return (
    <div>
      <Grid container alignItems='center' justifyContent='center'>
        <Typography variant='h2' gutterBottom mt={5} mb={5}>
          Decided Proposal
        </Typography>
        <IconButton onClick={updateProposalData}>
          <ReplayIcon sx={{ fontSize: '2rem' }} />
        </IconButton>
      </Grid>
      <ProposalTable data={proposalData} />

      <Box m={5}>
        <Typography variant='h3' gutterBottom>
          Candidate
        </Typography>
        {candidateData.map(row => {
          return (
            <div key={row.proposal.id.toString()}>
              <Box m={5}>
                <Typography variant='h5' gutterBottom>
                  {row.proposal.title} {row.proposal.reward.toString()}
                </Typography>
                <CandidateTable data={row.candidate} />
              </Box>
            </div>
          );
        })}
      </Box>
    </div>
  );
}

export default Step3;
