import { Check, Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { Task } from '../index';

interface EditedTask {
  name: string;
  priority: string;
}

const TodoPage = () => {
  const api = useFetch();
  const [tasks, setTasks] = useState<Task[]>([]);
  // Pour stocker les valeurs éditées pour chaque tâche (nom et priorité)
  const [editedTasks, setEditedTasks] = useState<{ [key: number]: EditedTask }>({});
  // Pour ajouter une nouvelle tâche (nom et priorité)
  const [newTask, setNewTask] = useState<{ name: string; priority: string }>({
    name: '',
    priority: 'MEDIUM',
  });

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      const ts = Array.isArray(res) ? res : res.tasks ? res.tasks : [];
      setTasks(ts);
      const init: { [key: number]: EditedTask } = {};
      ts.forEach((t: Task) => {
        init[t.id] = { name: t.name, priority: t.priority };
      });
      setEditedTasks(init);
    } catch (err) {
      console.error(err);
      setTasks([]);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const addTask = async () => {
    if (!newTask.name.trim()) return;
    try {
      await api.post('/tasks', newTask);
      setNewTask({ name: '', priority: 'MEDIUM' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTask = async (id: number) => {
    const e = editedTasks[id];
    const orig = tasks.find(t => t.id === id);
    if (!orig || (e.name === orig.name && e.priority === orig.priority)) return;
    try {
      await api.patch(`/tasks/${id}`, { name: e.name, priority: e.priority });
      setEditedTasks(prev => {
        const upd = { ...prev };
        delete upd[id];
        return upd;
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <Container>
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h2">HDM Todo List</Typography>
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
        {tasks.map(task => {
          const cur = editedTasks[task.id] || { name: task.name, priority: task.priority };
          const changed = cur.name !== task.name || cur.priority !== task.priority;
          return (
            <Box key={task.id} display="flex" alignItems="center" mt={2} gap={1}>
              <TextField
                id={`task-name-${task.id}`}
                name="taskName"
                size="small"
                value={cur.name}
                onChange={e =>
                  setEditedTasks({ ...editedTasks, [task.id]: { ...cur, name: e.target.value } })
                }
                sx={{ maxWidth: 350 }}
              />
              <Select
                id={`task-priority-${task.id}`}
                name="taskPriority"
                value={cur.priority}
                onChange={e =>
                  setEditedTasks({ ...editedTasks, [task.id]: { ...cur, priority: e.target.value as string } })
                }
                size="small"
                sx={{ maxWidth: 150 }}
              >
                <MenuItem value="HIGH">Haute</MenuItem>
                <MenuItem value="MEDIUM">Moyenne</MenuItem>
                <MenuItem value="LOW">Basse</MenuItem>
              </Select>
              <Box>
                <IconButton color="success" disabled={!changed} onClick={() => updateTask(task.id)}>
                  <Check />
                </IconButton>
                <IconButton color="error" onClick={() => deleteTask(task.id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          );
        })}
        <Box display="flex" alignItems="center" mt={2} gap={1}>
          <TextField
            id="new-task-name"
            name="newTaskName"
            size="small"
            value={newTask.name}
            onChange={e => setNewTask({ ...newTask, name: e.target.value })}
            placeholder="Nom de la tâche"
          />
          <Select
            id="new-task-priority"
            name="newTaskPriority"
            value={newTask.priority}
            onChange={e => setNewTask({ ...newTask, priority: e.target.value as string })}
            size="small"
            sx={{ maxWidth: 150 }}
          >
            <MenuItem value="HIGH">Haute</MenuItem>
            <MenuItem value="MEDIUM">Moyenne</MenuItem>
            <MenuItem value="LOW">Basse</MenuItem>
          </Select>
          <Button variant="outlined" onClick={addTask}>
            Ajouter une tâche
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default TodoPage;
