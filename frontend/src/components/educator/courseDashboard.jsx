import React from 'react'
import SideNav from "./SideNav/SideNav"
import { Box } from '@mui/system'


const CourseDashboard = () => {
    
    return (
        <>
        <Box sx={{ display: 'flex' }}>
         <SideNav />
         <h1>Course Dashboard</h1>
       </Box>
         </>
    )
}

export default CourseDashboard