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

import { Option, WalletContext } from './ethereum/WalletProvider';
import GET_TRANSFERS from './graphql/subgraph';

ChartJS.register(ArcElement, Tooltip, Legend);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'https://api.studio.thegraph.com/query/26120/testgraph/v0.0.5',
});

function BasicTable(props: {
  data: any[];
  funcVote: (address: string) => void;
}) {
  return (
    <TableContainer component={Paper}>
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
          {props.data.map(row => (
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const dummy_symbol = 'MSH';

const dummy_balance = [
  {
    wallet: '0xE3D094a5C68732C9E5D6574AC4071dC0d8bE151E',
    balance: 2142,
    ratio: 70.0,
  },
  { wallet: '0x42275925858', balance: 212, ratio: 9.5 },
  { wallet: '0x54275925803', balance: 42, ratio: 4.0 },
  { wallet: '0x89275925835', balance: 22, ratio: 2.8 },
  { wallet: '0x99275925875', balance: 32, ratio: 3.2 },
  { wallet: '0x09275925863', balance: 242, ratio: 10.5 },
];

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
    <div>
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
    </div>
  );
}

function Step1() {
  const [data, setData] = React.useState([{}]);
  const [blacklist, setBlacklist] = React.useState<string[]>([]);
  const { voteForBlacklist } = React.useContext(WalletContext);

  const claimPressed = () => {};

  const submitBlacklist = () => {
    console.log(blacklist);
  };

  const vote = (address: string) => {
    // const tmp = blacklist;
    // tmp.push(address);
    // setBlacklist(tmp);
    console.log(address);
    voteForBlacklist(address, Option.FOR);
  };

  React.useEffect(() => {
    dummy_balance.sort(function (a, b) {
      if (a.balance < b.balance) {
        return 1;
      } else {
        return -1;
      }
    });
    setData(dummy_balance);
  }, []);

  return (
    <div>
      <Grid container alignItems='center' justifyContent='center'>
        <Box mt={5} mb={5}>
          <Typography variant='h2' gutterBottom component='div'>
            Expelled From Paradice
          </Typography>
        </Box>
      </Grid>

      <ApolloProvider client={client}>
        <TokenBalanceGraph />
      </ApolloProvider>

      <BasicTable data={data} funcVote={vote} />

      <Typography variant='h4' gutterBottom>
        Blacklist
      </Typography>
      {blacklist.map(item => {
        return (
          <div key={item}>
            <p>{item}</p>
          </div>
        );
      })}
      <Button onClick={submitBlacklist}>submit Blacklist</Button>

      <Typography variant='h4' gutterBottom>
        Go Eden
      </Typography>
      <Button onClick={claimPressed}>Claim new coin</Button>
    </div>
  );
}

export default Step1;
