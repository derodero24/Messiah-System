import * as React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import {Grid, TextField, MenuItem, Box, Button, Typography, Fab, Paper} from "@mui/material";
import {Send, AddPhotoAlternate, HowToVote} from "@mui/icons-material";



function BasicTable(props: { data: any[]; }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="right">Proposal</TableCell>
            <TableCell align="right">Repository</TableCell>
            <TableCell align="right">Vote</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((row) => (
            <TableRow
              key={row.wallet}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="right">{row.proposal}</TableCell>
              <TableCell align="right">{row.repository}</TableCell>
              <TableCell align="right"><Button><HowToVote/></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


type ProposalProfile = {
    "proposal": string;
    "repo": string;
}

const dummy_proposal_dev = [
    {"proposal":"hogehoge1", "repository":"github/hogehoge1"},
    {"proposal":"hogehoge2", "repository":"github/hogehoge2"},
    {"proposal":"hogehoge5", "repository":"github/hogehoge5"}
];

function Step4(){
    const [proposal, setProposal] = React.useState<ProposalProfile>({proposal: "", repo:""});

    const submitProposal = () => {
    };

    const claimPressed = () =>{

    };


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProposal({
        ...proposal,
        [event.target.name]: event.target.value,
        });
    };

    const handleChangeList = (event: SelectChangeEvent) => {
        setProposal({
            ...proposal,
            [event.target.name]: event.target.value,
            });
      };

    return(
        <div>
          <Typography variant="h3" gutterBottom>Reward Voting</Typography>

        <BasicTable data={dummy_proposal_dev}/>

        <Grid container justifyContent={"center"}>
          <Grid item xs={12}>
            <Typography variant="h3" gutterBottom>Done</Typography>
          </Grid>
          <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Proposal</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={proposal.proposal}
          label="proposal"
          name="proposal"
          onChange={handleChangeList}
        >
          <MenuItem value={"hogehoge1"}>hogehoge1</MenuItem>
          <MenuItem value={"hogehoge3"}>hogehoge3</MenuItem>
          <MenuItem value={"hogehoge4"}>hogehoge4</MenuItem>
        </Select>
      </FormControl>
    </Box>
          <Grid item xs={12}>
            <TextField
              type="text"
              name="repo"
              value={proposal.repo}
              onChange={handleChange}
              label="github/repo"
              placeholder="github/repo"
              fullWidth
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={submitProposal} startIcon={<Send />} fullWidth type="button">Done the mission</Button>
          </Grid>
        </Grid>

        <Button onClick={claimPressed}>Claim Reward</Button>

      </div>
    )
}

export default Step4;