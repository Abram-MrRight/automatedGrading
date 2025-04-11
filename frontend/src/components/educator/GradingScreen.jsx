
import React from 'react';
import SideNav from "./SideNav/SideNav"
import { Box } from '@mui/system'

const GradingScreen = () => {
    return (
        <>
        <Box sx={{ display: 'flex' }}>
         <SideNav />
         <h1>Grading Screen</h1>
       </Box>
         </>
    );
    }

export default GradingScreen;