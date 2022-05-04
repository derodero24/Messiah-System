import * as React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import {Grid, TextField, MenuItem, Box, Button, Typography, Fab, Paper} from "@mui/material";
import {Send, AddPhotoAlternate, HowToVote, FollowTheSigns, Add, Person} from "@mui/icons-material";

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';



function ProposalTable(props: { data: any[]; }) {
    const [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState("");
  
    const handleClickOpen = (value:string) => {
      setSelectedValue(value);
    
      setOpen(true);
    };
  
    const handleClose = (value: string) => {
      setOpen(false);
    };


  return (
      <div>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="right">Proposal</TableCell>
            <TableCell align="right">Reward</TableCell>
            <TableCell align="right">Entry</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((row) => (
            <TableRow
              key={row.proposal}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="right">{row.proposal}</TableCell>
              <TableCell align="right">{row.reward}</TableCell>
              <TableCell align="right"><Button onClick={()=>{handleClickOpen(row.proposal)}}><FollowTheSigns/></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <SimpleDialog
    selectedValue={selectedValue}
    open={open}
    onClose={handleClose}
    /> 
    </div>
  );
}


function CandidateTable(props: { data: any[]; }) {

  return (
      <div>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="right">Wallet</TableCell>
            <TableCell align="right">Github</TableCell>
            <TableCell align="right">Days</TableCell>
            <TableCell align="right">Vote</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((row) => (
            <TableRow
              key={row.wallet}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="right">{row.wallet}</TableCell>
              <TableCell align="right">{row.github}</TableCell>
              <TableCell align="right">{row.days}</TableCell>
              <TableCell align="right"><Button><HowToVote/></Button></TableCell>
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
  selectedValue: string;
  onClose: (value: string) => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, selectedValue, open } = props;
  const [commitProps, setCommitProps] = React.useState<commitProfile>({github: "", times:""});

  const wizardEntry = () => {
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setCommitProps({
      ...commitProps,
      [event.target.name]: event.target.value,
      });
  };

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value: string) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{selectedValue}</DialogTitle>
      <Grid container justifyContent={"center"}>
          <Grid item xs={12}>
            <Typography variant="h3" gutterBottom>Entry</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="text"
              name="github"
              value={commitProps.github}
              onChange={handleChange}
              label="https://github/"
              placeholder="https://github/"
              fullWidth
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="text"
              name="times"
              value={commitProps.times}
              onChange={handleChange}
              label="20 days"
              placeholder="20 days"
              fullWidth
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={wizardEntry} startIcon={<Send />} fullWidth type="button">Entry</Button>
          </Grid>
        </Grid>
      
    </Dialog>
  );
}


type ProposalProfile = {
    "proposal": string;
    "reward": string;
}

const dummy_proposal = [
    {"proposal":"hogehoge1", "reward":"2000 USDC"},
    {"proposal":"hogehoge2", "reward":"100 USDC"},
    {"proposal":"hogehoge5", "reward":"23000 USDC"}
];

const dummy_candidate = [
  {"proposal":"hogehoge1",  "reward":"2000 USDC", "candidate":[{"wallet":"0x820852", "github":"github/noegn", "days":23}]},
  {"proposal":"hogehoge2", "reward":"100 USDC", "candidate":[{"wallet":"0x820852", "github":"github/noegn", "days":14}, {"wallet":"0x432852", "github":"github/whrhr", "days":13}]},
  {"proposal":"hogehoge5", "reward":"23000 USDC", "candidate":[]}
];

type commitProfile = {
    "github":string;
    "times" : string;
}


function Step3(){

    return(
      <div>
        <Grid container alignItems="center" justifyContent="center">
            <Box mt={5} mb={5}>
                <Typography variant="h2" gutterBottom component="div">Proposal Entry</Typography>
            </Box>
        </Grid>
        <ProposalTable data={dummy_proposal}/>

        <Box m={5}>
          <Typography variant="h3" gutterBottom>Candidate</Typography>
          {dummy_candidate.map((row)=>{
            return(
              <div key={row.proposal}>
                <Box m={5}>
                  <Typography variant="h5" gutterBottom>{row.proposal} {row.reward}</Typography>
                  <CandidateTable data={row.candidate}/>
                </Box>
              </div>
            );
          })}
        </Box>
      </div>
    )
}

export default Step3;