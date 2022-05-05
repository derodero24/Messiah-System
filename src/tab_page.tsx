import * as React from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

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
      {value === index && <Typography sx={{ p: 3 }}>{children}</Typography>}
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
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label='basic tabs example'
        >
          <Tab label='Step 0 : You make Messiah System' {...a11yProps(0)} />
          <Tab label='Step 1 : Expelled from paradise' {...a11yProps(1)} />
          <Tab label='Step 2 : Eden life' {...a11yProps(2)} />
          <Tab label='Step 3 : Wizard of Creation' {...a11yProps(3)} />
          <Tab label='Step 4 : Apple Eat' {...a11yProps(4)} />
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
