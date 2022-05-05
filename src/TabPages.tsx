import * as React from 'react';

import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { WalletContext } from './ethereum/WalletProvider';
import Step0 from './step0';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './step4';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TabPages() {
  const { endFreezing, updateProposalState } = React.useContext(WalletContext);
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 2, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label='Step 0 : You make Messiah System' {...a11yProps(0)} />
          <Tab label='Step 1 : Expelled from paradise' {...a11yProps(1)} />
          <Tab label='Step 2 : Eden life' {...a11yProps(2)} />
          <Tab label='Step 3 : Wizard of Creation' {...a11yProps(3)} />
          <Tab label='Step 4 : Apple Eat' {...a11yProps(4)} />
          <Button
            onClick={() => {
              endFreezing();
              updateProposalState();
            }}
          />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Step0 />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Step1 />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Step2 />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Step3 />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Step4 />
      </TabPanel>
    </Box>
  );
}
