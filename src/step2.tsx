import * as React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import {Grid, TextField, MenuItem, Box, Button, Typography, Fab, Paper} from "@mui/material";
import {Send, AddPhotoAlternate, HowToVote} from "@mui/icons-material";



function BasicTable(props: { data: any[]; }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="right">Proposal</TableCell>
            <TableCell align="right">Reward</TableCell>
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
              <TableCell align="right">{row.reward}</TableCell>
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
    "reward": string;
}

const dummy_proposal = [
    {"proposal":"hogehoge1", "reward":"2000 USDC"},
    {"proposal":"hogehoge2", "reward":"100 USDC"},
    {"proposal":"hogehoge3", "reward":"2500 USDC"},
    {"proposal":"hogehoge4", "reward":"20500 USDC"},
    {"proposal":"hogehoge5", "reward":"23000 USDC"}
];

function Step2(){
    const [proposal, setProposal] = React.useState<ProposalProfile>({proposal: "", reward:""});

    const submitProposal = () => {
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProposal({
        ...proposal,
        [event.target.name]: event.target.value,
        });
    };

    return(
        <div>
          <Grid container alignItems="center" justifyContent="center">
              <Box mt={5} mb={5}>
                  <Typography variant="h2" gutterBottom component="div">Proposal List</Typography>
              </Box>
          </Grid>

        <BasicTable data={dummy_proposal}/>

        <Grid container justifyContent={"center"}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>Submit Proposal</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="text"
              name="proposal"
              value={proposal.proposal}
              onChange={handleChange}
              label="hogehoge"
              placeholder="hogehoge"
              fullWidth
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="text"
              name="reward"
              value={proposal.reward}
              onChange={handleChange}
              label="2000USDC"
              placeholder="2000USDC"
              fullWidth
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={submitProposal} startIcon={<Send />} fullWidth type="button">Submit Proposal</Button>
          </Grid>
        </Grid>
      </div>
    )
}

export default Step2;