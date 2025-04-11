
import React from 'react'
import { Box } from '@mui/system'
import SideNav from "./SideNav/SideNav"

const ExamScreen = ({ match }) => {

    return (
        <>
        <Box sx={{ display: 'flex' }}>
         <SideNav />
         <h1>Exam Screen</h1>
       </Box>
         </>
    )
}

export default ExamScreen