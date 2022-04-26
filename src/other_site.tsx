import * as React from "react";

import {Grid, TextField, Box, Button, Typography, Paper} from "@mui/material";
import {ThumbDownOffAlt, ThumbUpOffAlt, HowToVote} from "@mui/icons-material";


function OtherSite(){
    const [erc20Address, setERC20Address] = React.useState("");

    const createLink=()=>{

    }

    const handleChange =(e)=>{
        setERC20Address(e.target.value);

    }

    return(
        <div>
            <Typography variant="h4" gutterBottom>Please Input ERC-20 Token Address</Typography>
            <TextField
              type="text"
              name="ERC-20 Token Address"
              value={erc20Address}
              onChange={handleChange}
              label="ERC-20 Token Address"
              placeholder="0x742982..."
              fullWidth
              variant="outlined"
              required
            />
            <Button onClick={()=>{createLink()}}>Create Messiah System</Button>
        </div>

    );
}

export default OtherSite;