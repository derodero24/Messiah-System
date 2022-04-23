import * as React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { Button, Typography } from "@mui/material";


function BasicTable(props: { data: any[]; funcVote:(address:string)=>void; }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="right">Wallet</TableCell>
            <TableCell align="right">Balance ({dummy_symbol})</TableCell>
            <TableCell align="right">Ratio (%)</TableCell>
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
              <TableCell align="right">{row.balance}</TableCell>
              <TableCell align="right">{row.ratio}</TableCell>
              <TableCell align="right"><Button onClick={()=>{props.funcVote(row.wallet)}}><HowToVoteIcon/></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const dummy_symbol = "MSH";

const dummy_balance = [
    {"wallet":"0x79275925802", "balance":2142, "ratio":70.0},
    {"wallet":"0x42275925858", "balance":212, "ratio":9.5},
    {"wallet":"0x54275925803", "balance":42, "ratio":4.0},
    {"wallet":"0x89275925835", "balance":22, "ratio":2.8},
    {"wallet":"0x99275925875", "balance":32, "ratio":3.2},
    {"wallet":"0x09275925863", "balance":242, "ratio":10.5},
];

function Step1(){
    const [data, setData] = React.useState([{}]);
    const [blacklist, setBlacklist] = React.useState<string[]>([]);

    const claimPressed=()=>{

    }

    const submitBlacklist=()=>{
      console.log(blacklist);
    }

    const vote=(address:string)=>{
      const tmp = blacklist;
      tmp.push(address);
      setBlacklist(tmp);
    }

    React.useEffect(()=>{
        dummy_balance.sort(function(a, b) {
            if (a.balance < b.balance) {
              return 1;
            } else {
              return -1;
            }
        })
        setData(dummy_balance)
    },[])

    return(
      <div>
        <Typography variant="h3" gutterBottom>Expelled From Paradise</Typography>

        <BasicTable data={data} funcVote={vote}/>

        <Typography variant="h4" gutterBottom>Blacklist</Typography>
        {blacklist.map(item=>{
          return(
            <div key={item}>
              <p>{item}</p>
            </div>
          );
        })}
        <Button onClick={submitBlacklist}>submit Blacklist</Button>

        <Typography variant="h4" gutterBottom>Go Eden</Typography>
        <Button onClick={claimPressed}>Claim new coin</Button>
      </div>
    )
}

export default Step1;