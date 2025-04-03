import { Check, Delete } from '@mui/icons-material';
import { Box, Button, Container, IconButton, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { Task } from '../index';

const TodoPage = () => {
  const api = useFetch();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editedTasks, setEditedTasks] = useState<{ [key: number]: string }>({});

  const handleFetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      // Vérification du format de la réponse :
      // Si la réponse est un tableau, on l'utilise directement
      // Sinon, si c'est un objet avec une propriété "tasks", on l'extrait
      const tasksArray = Array.isArray(response)
        ? response
        : response.tasks
          ? response.tasks
          : [];
      setTasks(tasksArray);
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches :', error);
      setTasks([]);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      handleFetchTasks();
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche :', error);
    }
  };

  const handleSave = async () => {
    const taskName = prompt("Veuillez saisir le nom de la tâche :");
    if (taskName) {
      try {
        await api.post('/tasks', { name: taskName });
        handleFetchTasks();
      } catch (error) {
        console.error("Erreur lors de l'ajout de la tâche :", error);
      }
    }
  };

  const handleUpdate = async (id: number, newName: string) => {
    try {
      await api.patch(`/tasks/${id}`, { name: newName });
      setEditedTasks(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      handleFetchTasks();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche :', error);
    }
  };

  useEffect(() => {
    handleFetchTasks();
  }, []);

  return (
    <Container>
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h2">HDM Todo List</Typography>
      </Box>

      <Box display="flex" flexDirection="column" justifyContent="center" mt={5}>
        {Array.isArray(tasks) && tasks.map((task) => {
          const currentValue = editedTasks[task.id] !== undefined ? editedTasks[task.id] : task.name;
          const isChanged = editedTasks[task.id] !== undefined && editedTasks[task.id] !== task.name;
          return (
            <Box
              key={task.id}
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={2}
              gap={1}
              width="100%"
            >
              <TextField
                size="small"
                value={currentValue}
                fullWidth
                sx={{ maxWidth: 350 }}
                onChange={(e) => setEditedTasks({ ...editedTasks, [task.id]: e.target.value })}
              />
              <Box>
                <IconButton
                  color="success"
                  disabled={!isChanged}
                  onClick={() => handleUpdate(task.id, currentValue)}
                >
                  <Check />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(task.id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          );
        })}

        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <Button variant="outlined" onClick={handleSave}>
            Ajouter une tâche
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default TodoPage;
