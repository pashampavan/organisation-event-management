import React, { useEffect, useState } from "react";
import { LinearProgress, Box, Typography } from "@mui/material";
import axios from "axios";

const ProgressBar = ({ eventId }) => {
  const [progress, setProgress] = useState(0);

  const fetchProgress = async () => {
    try {
      // Fetch all tasks for the given event
      const response = await axios.get(`http://localhost:5000/tasks/${eventId}`);
      const tasks = response.data;
    //   alert(JSON.stringify(tasks));
      if (tasks.length === 0) {
        setProgress(0);
        return;
      }

      
      const completedTasks = tasks.filter(task => task.status === "Finished").length;
      const progressPercentage = (completedTasks / tasks.length) * 100;
    //   alert(completedTasks);
      setProgress(progressPercentage);
    } catch (error) {
      console.error("Error fetching task progress:", error);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [eventId]);

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        Task Completion: {progress.toFixed(0)}%
      </Typography>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
};

export default ProgressBar;
