import React, { useEffect, useContext, useState } from "react";
import { Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import context from "../Context/useContext";
import CircularProgress from '@mui/material/CircularProgress';
const Dashboard = () => {
  const navigate = useNavigate();
  const { login, setLogin } = useContext(context);
  const [statistics, setStatistics] = useState(null);
  const [nodata,setNodata] = useState(false);

  useEffect(() => {
    // Check for authentication
    if (!localStorage.getItem("token")) {
      navigate("/");
    } else {
      // Fetch user statistics
      const fetchStatistics = async () => {
        try {
          const response = await fetch("http://localhost:5000/tasks/statistics", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const data = await response.json();
          
          if (response.ok) {
            if(data.message=="No tasks found for this user")
            {
              navigate('/tasklist')
            }
            // Map API data to match the UI structure
            setStatistics({
              summaryData: [
                { label: "Total tasks", value: data.statistics.totalTasks },
                { label: "Tasks completed", value: `${data.statistics.taskCompletionPercentage}%` },
                { label: "Tasks pending", value: `${data.statistics.taskPendingPercentage}%` },
                { label: "Average time per completed task", value: `${data.statistics.averageTimePerCompletedTask} hrs` },
              ],
              pendingSummaryData: [
                { label: "Pending tasks", value: data.statistics.pendingTasks },
                { label: "Total time lapsed", value: `${data.statistics.totalPendingTime} hrs` },
                { label: "Total time to finish", value: `${data.statistics.totalEstimatedCompletionTime} hrs (estimated based on end time)` },
              ],
              taskPriorityData: Object.entries(data.statistics.prioritySummary).map(([priority, details]) => ({
                priority,
                pending: details.pending,
                lapsed: details.timeLapsed,
                finish: details.timeToFinish,
              })),
            });
          } else {
            console.error("Failed to fetch statistics:", data.message);
          }
        } catch (error) {
          console.error("Error fetching statistics:", error.message);
        }
      };

      fetchStatistics();
    }
  }, [login, navigate]);

  return (
    <>
    {
      statistics?<Box sx={{ p: 3 }}>
      {/* Summary Section */}
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Grid container spacing={2}>
          {/* {
            statistics.summaryData
          } */}
          {statistics.summaryData.map((item, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box sx={{ textAlign: "center", p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                <Typography variant="h5" color="primary">
                  {item.value}
                </Typography>
                <Typography variant="body2">{item.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Pending Task Summary Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pending Task Summary
        </Typography>
        <Grid container spacing={2}>
          {statistics.pendingSummaryData.map((item, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Box sx={{ textAlign: "center", p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                <Typography variant="h5" color="primary">
                  {item.value}
                </Typography>
                <Typography variant="body2">{item.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Task Priority Table */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Task Priority Summary
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task Priority</TableCell>
                <TableCell>Pending Tasks</TableCell>
                <TableCell>Time Lapsed (hrs)</TableCell>
                <TableCell>Time to Finish (hrs)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statistics.taskPriorityData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.priority}</TableCell>
                  <TableCell>{row.pending}</TableCell>
                  <TableCell>{row.lapsed}</TableCell>
                  <TableCell>{row.finish}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>:
    <>
     <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
    </Box>

    
    </>

    }

    </>
  );
};

export default Dashboard;
