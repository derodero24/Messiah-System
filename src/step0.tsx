import * as React from "react";

import {Grid, TextField, Box, Button, Typography, Paper} from "@mui/material";
import {ThumbDownOffAlt, ThumbUpOffAlt, HowToVote} from "@mui/icons-material";


function Step0(){
    const votePressed=(vote)=>{

    }

    return(
        <div>
            <Typography variant="h3" gutterBottom>Do you want to creating Eden ? </Typography>
            <Button onClick={()=>{votePressed("yes")}}><ThumbUpOffAlt/></Button>
            <Button onClick={()=>{votePressed("no")}}><ThumbDownOffAlt/></Button>
        </div>

    );
}

export default Step0;