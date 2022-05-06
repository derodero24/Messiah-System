import * as React from 'react';

import {
  Add,
  AddPhotoAlternate,
  FollowTheSigns,
  HowToVote,
  Person,
  Send,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Fab,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

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

  const handleClose = (value: string) => {
    setOpen(false);
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
        onClose={handleClose}
      />
    </div>
  );
}

function CandidateTable(props: { data: MessiahSystem.SubmissionStruct[] }) {
  const { voteForSubmission } = React.useContext(WalletContext);

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
            {props.data.map(row => (
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
  onClose: (value: string) => void;
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
    const res = await submitProduct(
      id,
      commitProps.github,
      commitProps.comment
    );
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommitProps({
      ...commitProps,
      [event.target.name]: event.target.value,
    });
  };

  const handleClose = () => {
    onClose(title);
  };

  const handleListItemClick = (value: string) => {
    onClose(value);
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
  candidate: undefined | MessiahSystem.SubmissionStruct[];
};

function Step3() {
  const { getProposals, getSubmissions } = React.useContext(WalletContext);
  const [proposalData, setProposalData] = React.useState<
    MessiahSystem.ProposalStruct[]
  >([]);
  const [candidateData, setCandidateData] = React.useState<candidateProps[]>(
    []
  );
  const [developingStateIds, setDevelopingStateIds] = React.useState([]);

  const loadProposalData = async () => {
    const data = await getProposals(1);
    console.log(data);

    if (!data) {
      return 0;
    }

    //filter developing state
    //setDevelopingStateIds();

    const developingData = data.filter(
      x => x.state === ProposalState.DEVELOPING
    );

    setProposalData(developingData);
  };

  const loadSubmissionData = async () => {
    const tmp: candidateProps[] = Array.from(
      { length: proposalData.length },
      (_, idx) => ({ proposal: proposalData[idx], candidate: [] })
    );

    for (let i = 0; i < proposalData.length; i++) {
      getSubmissions(proposalData[i].id, 1).then(submissionData => {
        console.log(submissionData);
        if (submissionData) {
          tmp[i].candidate = submissionData;
          setCandidateData(tmp);
        }
      });
    }
  };

  React.useEffect(() => {
    loadProposalData();
  }, []);

  React.useEffect(() => {
    loadSubmissionData();
  }, [proposalData]);

  return (
    <div>
      <Grid container alignItems='center' justifyContent='center'>
        <Box mt={5} mb={5}>
          <Typography variant='h2' gutterBottom component='div'>
            Decided Proposal
          </Typography>
        </Box>
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
