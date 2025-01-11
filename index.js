const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

const db =process.env.db;
const JWT_SECRET = process.env.JWT_SECRET;
mongoose
  .connect(db)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });


  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
  });

  
// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  tasks: { type: Number, default: 0 },
});
const User = mongoose.model("users", UserSchema);



// Task Schema
const TaskSchema = new mongoose.Schema({
  event_id: { type: String, required: true },
  email: { type: String, required: true },
  title: { type: String, required: true },
  priority: { type: Number, required: true, min: 1, max: 5 },
  status: { type: String, default: "Pending" },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
});
const Task = mongoose.model("tasks", TaskSchema);



//Attendee services 
const attendeeSchema = new mongoose.Schema({
  task_id:String,
  name: String,
  email: String,
  mobile: String,
});

const Attendee = mongoose.model("Attendee", attendeeSchema);


// Controller for fetching tasks by event ID
app.get("/tasks/:eventId", async (req, res) => {
  const { eventId } = req.params;
  try {
    const tasks = await Task.find({ event_id: eventId });
    res.json(tasks);
  } catch (error) {
    res.status(500).send("Error fetching tasks for event.");
  }
});



app.get("/tasks/:task_id/attendees", async (req, res) => {
  const { task_id } = req.params;
  const attendees = await Attendee.find({ task_id });
  res.json(attendees);
});

app.post("/tasks/:task_id/attendees", async (req, res) => {
  const { task_id } = req.params;
  const attendee = new Attendee({ ...req.body, task_id });
  await attendee.save();
  res.status(201).json(attendee);
});

app.put("/tasks/:task_id/attendees/:id", async (req, res) => {
  const { id } = req.params;
  const attendee = await Attendee.findByIdAndUpdate(id, req.body, { new: true });
  res.json(attendee);
});

app.delete("/tasks/:task_id/attendees/:id", async (req, res) => {
  const { id } = req.params;
  await Attendee.findByIdAndDelete(id);
  res.status(204).send();
});

// User Authentication Middleware
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Routes

// Register
app.post("/register", async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ email, name, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Add Task
app.post("/tasks", authenticateUser, async (req, res) => {
  const { event_id,title, priority, status, start, end } = req.body;
  console.log(event_id);
  console.log("yes");
  const email = req.user.email;
  const startTime = new Date(start);
  const endTime = new Date(end);
  if (!title || !priority || !startTime || !endTime) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const newTask = new Task({
      event_id,
      email,
      title,
      priority,
      status: status || "Pending",
      start_time: new Date(startTime),
      end_time: new Date(endTime),
    });
    await newTask.save();
    await User.findOneAndUpdate({ email }, { $inc: { tasks: 1 } });
    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ message: "Failed to add task", error: error.message });
  }
});






// Task Statistics
app.get("/tasks/statistics", authenticateUser, async (req, res) => {
  const email = req.user.email;

  try {
    const tasks = await Task.find({ email });

    if (tasks.length === 0) {
      return res.status(200).json({ message: "No tasks found for this user", statistics: {} });
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === "Finished").length;
    const pendingTasks = totalTasks - completedTasks;
    const taskCompletionPercentage = ((completedTasks / totalTasks) * 100).toFixed(2);
    const taskPendingPercentage = ((pendingTasks / totalTasks) * 100).toFixed(2);

    const completedTaskTimes = tasks
      .filter((task) => task.status === "Finished")
      .map((task) => (new Date(task.end_time) - new Date(task.start_time)) / 3600000); // Time in hours
    const averageTimePerCompletedTask = completedTaskTimes.length > 0
    ? (
        completedTaskTimes
          .filter((time) => time > 0) // Ensure only positive times are included
          .reduce((sum, time) => sum + time, 0) / completedTaskTimes.length
      ).toFixed(2)
    : 0;
  

    const pendingTaskTimes = tasks
      .filter((task) => task.status === "Pending")
      .map((task) => (Date.now() - new Date(task.start_time)) / 3600000); // Time lapsed in hours for pending tasks

    const totalPendingTime = pendingTaskTimes.reduce((sum, time) => sum + time, 0).toFixed(2);

    const estimatedCompletionTimes = tasks
      .filter((task) => task.status === "Pending")
      .map((task) => (new Date(task.end_time) - Date.now()) / 3600000); // Estimated time to finish in hours

    const totalEstimatedCompletionTime = estimatedCompletionTimes.reduce((sum, time) => sum + Math.max(time, 0), 0).toFixed(2);

    const prioritySummary = {};
    tasks.forEach((task) => {
      const priority = task.priority;
      if (!prioritySummary[priority]) {
        prioritySummary[priority] = {
          pending: 0,
          timeLapsed: 0,
          timeToFinish: 0,
        };
      }
      if (task.status === "Pending") {
        prioritySummary[priority].pending += 1;
        prioritySummary[priority].timeLapsed += (Date.now() - new Date(task.start_time)) / 3600000; // Time in hours
        prioritySummary[priority].timeToFinish += Math.max(
          (new Date(task.end_time) - Date.now()) / 3600000,
          0
        ); // Time in hours
      }
    });

    res.status(200).json({
      statistics: {
        totalTasks,
        completedTasks,
        pendingTasks,
        taskCompletionPercentage,
        taskPendingPercentage,
        averageTimePerCompletedTask,
        totalPendingTime,
        totalEstimatedCompletionTime,
        prioritySummary,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch task statistics", error: error.message });
  }
});




// Endpoint to fetch tasks assigned to a specific user for a given event
app.get('/tasksassigned/:event_id', authenticateUser, async (req, res) => {
  
  const event_id = req.params.event_id;
  const email = req.user.email;
  if (!event_id) {
    return res.status(400).json({ message: 'Event ID is required' });
  }

  try {
    // Fetch tasks assigned to the specified user for the given event
    const assigned_tasks = await Attendee.find({ email: email });


    const taskIds = assigned_tasks
      .filter(item => item.task_id) // Filter items that have a task_id
      .map(item => item.task_id);

    const tasks = await Task.find({ _id: { $in: taskIds }, event_id: event_id });


    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});


// Get Tasks
app.get("/tasks", authenticateUser, async (req, res) => {
  const email = req.user.email;
  const { event_id } = req.query
  try {
    const tasks = await Task.find({ event_id });
    
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
});

// Update Task
app.put("/tasks/:id", authenticateUser, async (req, res) => {
  const {id} = req.params;
  const { event_id,title, priority, status, start, end} = req.body;
  const email = req.user.email;
  const startTime = new Date(start);
  const endTime = new Date(end);
  if (!title || !priority || !startTime || !endTime) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const task = await Task.findOneAndUpdate(
      { _id:id,email },
      {title, priority, status, start_time:startTime, end_time:endTime },
      { new: true }
      );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
});

// Delete Task
app.delete("/tasks/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const email = req.user.email;
  try {
    const task = await Task.findOneAndDelete({ _id: id, email:email });
    if (!task) {
      
      return res.status(404).json({ message: "Task not found" });
    }
    await User.findOneAndUpdate({ email }, { $inc: { tasks: -1 } });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
});

app.get('/',(req,res)=>{
  res.status(200).json({status:"success"});
})




// Server
const PORT = 5000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// module.exports = app;

