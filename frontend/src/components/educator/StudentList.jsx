import React from 'react'
import SideNav from "./SideNav/SideNav"
import { Box } from '@mui/system'

const StudentList = () => {
    return (
        <>
        <Box sx={{ display: 'flex' }}>
         <SideNav />
         <h1>Student List</h1>
       </Box>
         </>
    )
}

export default StudentList