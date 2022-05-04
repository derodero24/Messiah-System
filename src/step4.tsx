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
import { WalletContext } from './ethereum/WalletProvider';

import { MessiahSystem} from '../typechain-types';


function BasicTable(props: { data: any[]; }) {
    const {claimReward}  = React.useContext(WalletContext);
    const claimPressed = async(proposalId:string) =>{
      const res = await claimReward(proposalId);
    };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="right">title</TableCell>
            <TableCell align="right">reward</TableCell>
            <TableCell align="right">Claim</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((row) => (
            <TableRow
              key={Number(row.id)}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="right">{row.title}</TableCell>
              <TableCell align="right">{row.reward.toString()}</TableCell>
              <TableCell align="right"><Button onClick={()=>claimPressed(row.id.toString())}>Claim Reward</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function Step4(){
    const {getProposals, getTally, getSubmissions}  = React.useContext(WalletContext);
    const [appleEatData, setAppleEatData] = React.useState([]);

    const [proposalData, setProposalData] = React.useState<MessiahSystem.ProposalStruct[]>([]);

    React.useEffect(()=>{
      loadProposalData();
    },[]);

    const loadProposalData = async()=>{
      const data = await getProposals(1);
      console.log(data);

      if(!data){
        return 0;
      }

      const tmp = [];

      data.map(async(x)=>{
        const submissions = await getSubmissions(x.id, 1);
        let winner="";
        let winnerFor = 0;
        submissions.map(async(candidate)=>{
          const res = await getTally(candidate.id);
          if(Number(res?.totalFor) >= winnerFor){
            winner = candidate.submitter;
            winnerFor = Number(res?.totalFor);
          }
        tmp.push({"proposal":x.id, "reward":x.reward.toString(), "appleEater":winner});
        })
      });

      setAppleEatData(tmp);
    }

    return(
        <div>
            <Grid container alignItems="center" justifyContent="center">
                <Box mt={5} mb={5}>
                    <Typography variant="h2" gutterBottom component="div">Apple Eating</Typography>
                </Box>
            </Grid>
            
        <BasicTable data={appleEatData}/>
      </div>
    )
}

export default Step4;