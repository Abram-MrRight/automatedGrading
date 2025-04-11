
import React from 'react';
import SideNav from "./SideNav/SideNav"
import { Box } from '@mui/system'

const AnalysticsDashboard = () => {
    return (
        <>
       <Box sx={{ display: 'flex' }}>
        <SideNav />
        <h1>Analystics Dashboard</h1>
      </Box>
        </>
        
    );
    }

export default AnalysticsDashboard;