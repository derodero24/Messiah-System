import * as React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import {Grid, TextField, MenuItem, Box, Button, Typography, Fab, Paper} from "@mui/material";
import {Send, AddPhotoAlternate, HowToVote} from "@mui/icons-material";
import { WalletContext } from './ethereum/WalletProvider';
import { MessiahSystem} from '../typechain-types';



function BasicTable(props: { data: any[]; }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="right">Title</TableCell>
            <TableCell align="right">Description</TableCell>
            <TableCell align="right">Reward</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((row) => (
            <TableRow
              key={Number(row.id)}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="right">{row.title}</TableCell>
              <TableCell align="right">{row.description}</TableCell>
              <TableCell align="right">{Number(row.reward)}</TableCell>
              <TableCell align="right"><Button><HowToVote/></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


type ProposalProfile = {
    "title":string;
    "description": string;
    "reward": string;
}

function Step2(){
    const {getProposals, submitProposal} = React.useContext(WalletContext);
    const [proposal, setProposal] = React.useState<ProposalProfile>({title: "", description:"", reward:""});
    const [proposalData, setProposalData] = React.useState<MessiahSystem.ProposalStruct[]>([]);

    const submitProposalPressed = async() => {
      const res = await submitProposal(proposal.title, proposal.description, Number(proposal.reward));
    };

    React.useEffect(()=>{
      loadProposalData();
    },[]);

    const loadProposalData = async()=>{
      const data = await getProposals(1);
      console.log(data);

      if(!data){
        return 0;
      }
      setProposalData(data);
    }

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

        <BasicTable data={proposalData}/>

        <Grid container justifyContent={"center"}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>Submit Proposal</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="text"
              name="title"
              value={proposal.title}
              onChange={handleChange}
              label="title"
              placeholder="hogehoge"
              fullWidth
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="text"
              name="description"
              value={proposal.description}
              onChange={handleChange}
              label="description"
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
              label="Reward"
              placeholder="2000"
              fullWidth
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={submitProposalPressed} startIcon={<Send />} fullWidth type="button">Submit Proposal</Button>
          </Grid>
        </Grid>
      </div>
    )
}

export default Step2;