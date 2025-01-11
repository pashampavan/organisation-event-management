import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "react-router-dom";

export default function Attendees() {
  const { task_id } = useParams(); // Get task_id from route params
  const [attendees, setAttendees] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchAttendees = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/tasks/${task_id}/attendees`);
      setAttendees(response.data);
    } catch (error) {
      console.error("Error fetching attendees:", error);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [task_id]);

  const handleSubmit = async () => {
    try {
      if (editId) {
        // Update attendee
        await axios.put(`http://localhost:5000/tasks/${task_id}/attendees/${editId}`, formData);
      } else {
        // Add new attendee
        await axios.post(`http://localhost:5000/tasks/${task_id}/attendees`, formData);
      }
      setOpen(false);
      setFormData({ name: "", email: "", mobile: "" });
      setEditId(null);
      fetchAttendees();
    } catch (error) {
      console.error("Error adding/updating attendee:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${task_id}/attendees/${id}`);
      fetchAttendees();
    } catch (error) {
      console.error("Error deleting attendee:", error);
    }
  };

  const handleEdit = (attendee) => {
    setEditId(attendee._id);
    setFormData({
      name: attendee.name,
      email: attendee.email,
      mobile: attendee.mobile,
    });
    setOpen(true);
  };

  return (
    <div>
      <Box sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h4">Attendees for Task {task_id}</Typography>
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{
              fontSize: { xs: "0.8rem", sm: "1rem" },
            }}
            onClick={() => setOpen(true)}
          >
            + Add Attendee
          </Button>
        </Stack>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendees.map((attendee) => (
                <TableRow key={attendee._id}>
                  <TableCell>{attendee.name}</TableCell>
                  <TableCell>{attendee.email}</TableCell>
                  <TableCell>{attendee.mobile}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(attendee)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(attendee._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editId ? "Edit Attendee" : "Add Attendee"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Mobile"
              value={formData.mobile}
              onChange={(e) =>
                setFormData({ ...formData, mobile: e.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
