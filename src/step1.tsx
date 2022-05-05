import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import * as React from 'react';
import { Doughnut } from 'react-chartjs-2';

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  useQuery,
} from '@apollo/client';
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
import GET_TRANSFERS from './graphql/subgraph';

type Balance = {
  wallet: string;
  balance: number;
  ratio: number;
};

const dummy_symbol = 'MSH';

const dummyBalance: Balance[] = [
  {
    wallet: '0xE3D094a5C68732C9E5D6574AC4071dC0d8bE151E',
    balance: 2142,
    ratio: 70.0,
  },
  {
    wallet: '0xab13accfc85a69d6ce95b0d91e1184f4cd56783b',
    balance: 212,
    ratio: 9.5,
  },
  {
    wallet: '0x28efa0ab047a40afe6bd3f00dea09e88f644080b',
    balance: 42,
    ratio: 4.0,
  },
  {
    wallet: '0xcee78947980f5d06bfe05f02f116080e14adb8c1',
    balance: 22,
    ratio: 2.8,
  },
  {
    wallet: '0x4b8619890fa9c3cf11c497961eb4b970d440127f',
    balance: 32,
    ratio: 3.2,
  },
];

ChartJS.register(ArcElement, Tooltip, Legend);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'https://api.studio.thegraph.com/query/26120/testgraph/v0.0.5',
});

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
        getTally(props.data[i].wallet).then(tally => {
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
            <TableCell align='right'>Balance ({dummy_symbol})</TableCell>
            <TableCell align='right'>Ratio (%)</TableCell>
            <TableCell align='right'>Vote</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((row, idx) => (
            <TableRow
              key={row.wallet}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align='right'>{row.wallet}</TableCell>
              <TableCell align='right'>{row.balance}</TableCell>
              <TableCell align='right'>{row.ratio}</TableCell>
              <TableCell align='right'>
                <Button
                  onClick={() => {
                    props.funcVote(row.wallet);
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
  // Read more about useDapp on https://usedapp.io/

  const { loading, error: subgraphQueryError, data } = useQuery(GET_TRANSFERS);
  const [tokenHolders, setTokenHolders] = React.useState([]);
  const [graphData, setGraphData] = React.useState(first);

  React.useEffect(() => {
    if (!loading && !subgraphQueryError && data) {
      setTokenHolders(data.accountTokenBalances);
      makeGraphData(data.accountTokenBalances);
    }
  }, [loading, subgraphQueryError, data]);

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
    <Grid container>
      <Grid item xs={6}>
        {tokenHolders.map((tokenHolder: any) => (
          <div key={tokenHolder.id} style={{ margin: '20px' }}>
            <div>アドレス： {tokenHolder.id}</div>
            <div>残高： {tokenHolder.balance}</div>
          </div>
        ))}
      </Grid>
      <Grid item xs={6}>
        <Box sx={{ width: '75%' }}>
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
    dummyBalance.sort((a, b) => {
      if (a.balance < b.balance) return 1;
      else return -1;
    });
    setData(dummyBalance);
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

      <ApolloProvider client={client}>
        <TokenBalanceGraph />
      </ApolloProvider>

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
        <Button variant='contained' onClick={claimPressed}>
          Claim new token
        </Button>
      </Box>
    </div>
  );
}

export default Step1;
