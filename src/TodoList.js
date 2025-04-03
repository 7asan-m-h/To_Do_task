import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Checkbox,
  IconButton,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useTheme,
  FormControlLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [collaborativeTasks, setCollaborativeTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const theme = useTheme();

  const getAllTasks = (snapshot) => {
    const allTasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const userEmail = auth.currentUser?.email;
    setTasks(allTasks.filter((task) => task.createdBy === userEmail));
    setCollaborativeTasks(allTasks.filter((task) => task.collaborators?.includes(userEmail)));
  };

  useEffect(() => {
    const tasksRef = collection(db, 'tasks');
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const userTasks = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((task) => task.createdBy === auth.currentUser?.email);
      setTasks(userTasks);

      const collabTasks = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((task) => task.collaborators?.includes(auth.currentUser?.email));
      setCollaborativeTasks(collabTasks);
    });
    return unsubscribe;
  }, []);

  const addTask = async () => {
    if (newTask.trim() && dueDate && dueTime) {
      await addDoc(collection(db, 'tasks'), {
        title: newTask,
        dueDate: Timestamp.fromDate(new Date(`${dueDate}T${dueTime}`)),
        completed: false,
        collaborators: [],
        createdBy: auth.currentUser.email,
      });
      setNewTask('');
      setDueDate('');
      setDueTime('');
    }
  };

  const addCollaborator = async (taskId) => {
    if (collaboratorEmail.trim()) {
      const taskRef = doc(db, 'tasks', taskId);
      const task = [...tasks, ...collaborativeTasks].find((task) => task.id === taskId);

      if (task) {
        const updatedCollaborators = [...(task.collaborators || []), collaboratorEmail];
        await updateDoc(taskRef, { collaborators: updatedCollaborators });

        await addDoc(collection(db, 'notifications'), {
          receiverEmail: collaboratorEmail,
          message: `You have been added to the task: ${task.title}`,
          taskId: taskId,
          read: false,
          timestamp: Timestamp.now(),
        });

        setCollaboratorEmail('');
      }
    }
  };

  const toggleComplete = async (task) => {
    const taskRef = doc(db, 'tasks', task.id);
    await updateDoc(taskRef, { completed: !task.completed });
  };

  const deleteTask = async (id) => {
    const taskRef = doc(db, 'tasks', id);
    await deleteDoc(taskRef);
  };

  const openEditDialog = (task) => {
    setEditingTask(task);
    setNewTask(task.title);
    setDueDate(new Date(task.dueDate.seconds * 1000).toISOString().split('T')[0]);
    setDueTime(new Date(task.dueDate.seconds * 1000).toISOString().split('T')[1].split('.')[0]);
    setOpenDialog(true);
  };

  const saveEditedTask = async () => {
    if (newTask.trim() && dueDate && dueTime) {
      const taskRef = doc(db, 'tasks', editingTask.id);
      await updateDoc(taskRef, {
        title: newTask,
        dueDate: Timestamp.fromDate(new Date(`${dueDate}T${dueTime}`)),
      });
      setOpenDialog(false);
      setEditingTask(null);
    }
  };

  const handleSelectTask = (id) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTasks([]);
    } else {
      const allTaskIds = tasks.filter((task) => task.completed).map((task) => task.id);
      setSelectedTasks(allTaskIds);
    }
    setSelectAll(!selectAll);
  };

  const deleteSelectedTasks = () => {
    selectedTasks.forEach(async (id) => {
      await deleteTask(id);
    });
    setSelectedTasks([]);
  };

  const cardStyle = {
    backgroundColor: theme.palette.mode === 'light' ? '#f4f6f8' : '#1e1e1e'
  };
  

  return (
    <Box>
      <Card sx={{ marginBottom: '2rem', ...cardStyle }}>

        <CardContent>
          <Typography variant="h5" gutterBottom>
            Add a New Task
          </Typography>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            <TextField
              label="Task Title"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              fullWidth
            />
            <TextField
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              fullWidth
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={addTask}
            disabled={!newTask.trim() || !dueDate || !dueTime}
            sx={{ marginTop: '1rem' }}
          >
            Add Task
          </Button>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Active Tasks
              </Typography>
              {tasks.filter((task) => !task.completed).length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Collaborators</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tasks
                        .filter((task) => !task.completed)
                        .map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>
                              <Checkbox
                                checked={task.completed}
                                onChange={() => toggleComplete(task)}
                              />
                            </TableCell>
                            <TableCell>{task.title}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <AccessTimeIcon fontSize="small" color="action" />
                                {new Date(task.dueDate.seconds * 1000).toLocaleString()}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {task.collaborators?.join(', ') || 'No Collaborators'}
                              <Box mt={1}>
                                <TextField
                                  label="Add Collaborator"
                                  value={collaboratorEmail}
                                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                                  size="small"
                                  fullWidth
                                />
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => addCollaborator(task.id)}
                                  sx={{ marginTop: '0.5rem' }}
                                >
                                  Add
                                </Button>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <IconButton color="primary" onClick={() => openEditDialog(task)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton color="secondary" onClick={() => deleteTask(task.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>No active tasks found.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Collaborative Tasks
              </Typography>
              {collaborativeTasks.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Creator Email</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {collaborativeTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>
                            {new Date(task.dueDate.seconds * 1000).toLocaleString()}
                          </TableCell>
                          <TableCell>{task.createdBy}</TableCell>
                          <TableCell>
                            <IconButton color="primary" onClick={() => openEditDialog(task)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="secondary" onClick={() => deleteTask(task.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>No Collaborative Tasks Found</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Completed Tasks
              </Typography>
              {tasks.filter((task) => task.completed).length > 0 ? (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    }
                    label="Select All"
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={deleteSelectedTasks}
                    disabled={selectedTasks.length === 0}
                    sx={{ marginBottom: '1rem' }}
                  >
                    Delete Selected
                  </Button>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Select</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Collaborators</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tasks.filter((task) => task.completed).map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedTasks.includes(task.id)}
                                onChange={() => handleSelectTask(task.id)}
                              />
                            </TableCell>
                            <TableCell>{task.title}</TableCell>
                            <TableCell>{new Date(task.dueDate.seconds * 1000).toLocaleString()}</TableCell>
                            <TableCell>{task.collaborators?.join(', ') || 'No Collaborators'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography>No completed tasks found.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Task Title"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ marginBottom: '1rem' }}
          />
          <TextField
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '1rem' }}
          />
          <TextField
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '1rem' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={saveEditedTask} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TodoList;
