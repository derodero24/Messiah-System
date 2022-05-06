import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import * as React from 'react';
import { Doughnut } from 'react-chartjs-2';

import HowToVoteIcon from '@mui/icons-material/HowToVote';
import {
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { Option } from './ethereum/contractVariables';
import { WalletContext } from './ethereum/WalletProvider';
import tokenBalanceData from "./token_balance.json";

ChartJS.register(ArcElement, Tooltip, Legend);

type Balance = {
  id: string;
  balance: number;
};

function BasicTable(props: {
  data: Balance[];
  funcVote: (address: string) => void;
}) {
  const { getTally } = React.useContext(WalletContext);
  const [voteCounts, setVoteCounts] = React.useState(
    Array.from({ length: props.data.length }, () => 0)
  );

  React.useEffect(() => {
    // 1秒ごとに票数更新
    const newVoteCounts = Array.from({ length: props.data.length }, () => 0);
    const timer = setInterval(() => {
      for (let i = 0; i < props.data.length; i++) {
        getTally(props.data[i].id).then(tally => {
          if (tally) {
            newVoteCounts[i] = tally.totalFor.toNumber();
            setVoteCounts(newVoteCounts);
          }
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [props.data, getTally]);

  return (
    <TableContainer component={Paper} sx={{ my: 4 }}>
      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell align='right'>Wallet</TableCell>
            <TableCell align='right'>Balance</TableCell>
            <TableCell align='right'>Vote</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((row, idx) => (
            <TableRow
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align='right'>{row.id}</TableCell>
              <TableCell align='right'>{row.balance}</TableCell>
              <TableCell align='right'>
                <Button
                  onClick={() => {
                    props.funcVote(row.id);
                  }}
                >
                  <HowToVoteIcon />
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

const first: any = {
  labels: [],
  datasets: [
    {
      label: '# of Votes',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    },
  ],
};

function TokenBalanceGraph() {
  const [graphData, setGraphData] = React.useState(first);

  React.useEffect(()=>{
    makeGraphData(tokenBalanceData);
  }, []);

  const makeGraphData = async (source: any) => {
    const labels: any[] = [];
    const values: number[] = [];
    const bac_list: string[] = [];
    const boc_list: string[] = [];
    console.log(source);

    source.forEach((tokenHolder: { id: any; balance: number }) => {
      const r = String(Math.floor(Math.random() * 256));
      const g = String(Math.floor(Math.random() * 256));
      const b = String(Math.floor(Math.random() * 256));
      const bac = `rgba(${r}, ${g}, ${b}, 0.2)`;
      const boc = `rgba(${r}, ${g}, ${b}, 1)`;

      labels.push(tokenHolder.id);
      values.push(tokenHolder.balance);
      bac_list.push(bac);
      boc_list.push(boc);
    });

    const tmp = {
      labels: labels,
      datasets: [
        {
          label: '# of Votes',
          data: values,
          backgroundColor: bac_list,
          borderColor: boc_list,
          borderWidth: 1,
        },
      ],
    };

    setGraphData(tmp);
    console.log(tmp);
  };

  return (
    <Grid container alignItems="center">
      <Grid item xs={12}>
        <Box sx={{ width: '50%' }}>
          <Doughnut data={graphData} />
        </Box>
      </Grid>
    </Grid>
  );
}

function Step1() {
  const [data, setData] = React.useState<Balance[]>([]);
  const [blacklist, setBlacklist] = React.useState<string[]>([]);
  const { voteForBlacklist, claimMessiahToken, getBlacklist } =
    React.useContext(WalletContext);

  const claimPressed = () => {
    claimMessiahToken();
  };

  const updateBlacklist = React.useCallback(async () => {
    await getBlacklist(1).then(res => setBlacklist(res));
  }, [getBlacklist]);

  const vote = async (address: string) => {
    await voteForBlacklist(address, Option.FOR);
  };

  React.useEffect(() => {
    // 降順に並び替え
    tokenBalanceData.sort((a, b) => {
      if (a.balance < b.balance) return 1;
      else return -1;
    });
    setData(tokenBalanceData);
  }, []);

  React.useEffect(() => {
    // 1秒おきにブラックリスト更新
    const timer = setInterval(() => updateBlacklist(), 1000);
    return () => clearInterval(timer);
  }, [updateBlacklist]);

  return (
    <div>
      <Grid container justifyContent='center'>
        <Typography variant='h2' mt={5} mb={5}>
          Expelled From Paradice
        </Typography>
      </Grid>

      <TokenBalanceGraph />

      <BasicTable data={data} funcVote={vote} />

      <Box sx={{ my: 4 }}>
        <Typography variant='h4'>Blacklist</Typography>
        {blacklist.map(item => {
          return (
            <div key={item} style={{ textIndent: '2em' }}>
              <p>{item}</p>
            </div>
          );
        })}
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant='h4' gutterBottom>
          Go Eden
        </Typography>
        <Button sx={{
              mt: 2,
              backgroundColor: 'mediumblue',
              '&:hover': { background: 'blueviolet' },
            }}
            variant='contained'
             onClick={claimPressed}>
          Claim new token
        </Button>
      </Box>
    </div>
  );
}

export default Step1;
