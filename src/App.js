// لا تغيير على الاستيرادات الأصلية
import React, { useState, useEffect } from 'react';
import { auth, db, messaging } from './firebase';
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import Profile from './Profile'; // ✅ مستخدم كما هو

import Auth from './Auth';
import TodoList from './TodoList';
import Welcome from './welcome';
import {
  Typography,
  Box,
  Button,
  Switch,
  AppBar,
  Toolbar,
  CssBaseline,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';

const App = () => {
  const [showProfile, setShowProfile] = useState(false); // ✅ عرض الملف الشخصي

  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [collaborativeTasks, setCollaborativeTasks] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const appStyle = {
    backgroundImage: "url('/wallpaper2.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserName(docSnap.data().name || user.displayName || 'User');
        } else {
          setUserName(user.displayName || 'User');
        }
      } else {
        setUser(null);
        setUserName('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const tasksRef = collection(db, 'tasks');
      const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
        const allTasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(allTasks);
        const sharedTasks = allTasks.filter((task) =>
          task.collaborators?.includes(user.email)
        );
        setCollaborativeTasks(sharedTasks);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const currentToken = await getToken(messaging, {
          vapidKey:
            'BDPFV4f-r47-hJzFoVPnfLVCS90fGcLyH2Oi0MJy_VohSo6BNxKblQOmOu7mbIc3KY6aA0VkvIx1A7GrmE8xg7A',
        });
        if (currentToken) {
          console.log('FCM Token:', currentToken);
        } else {
          console.log('No registration token available.');
        }
      } catch (error) {
        console.error('Error retrieving FCM token:', error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    onMessage(messaging, (payload) => {
      console.log('Message received: ', payload);
      setNotifications((prev) => [
        ...prev,
        {
          title: payload.notification.title,
          body: payload.notification.body,
        },
      ]);
    });
  }, []);

  const handleEnter = () => setShowWelcome(false);

  const addCollaborativeTask = async (taskId, email) => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      collaborators: arrayUnion(email),
    });

    const docSnap = await getDoc(taskRef);
    if (docSnap.exists()) {
      setCollaborativeTasks((prev) => [...prev, docSnap.data()]);
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    auth.signOut();
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box textAlign="center" padding="2rem">
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showWelcome ? (
        <Welcome onEnter={handleEnter} />
      ) : showProfile ? ( // ✅ عرض صفحة الملف الشخصي
        <Profile onBack={() => setShowProfile(false)} />
      ) : (
        <>
          <AppBar position="fixed" sx={{ width: '100%', zIndex: 1100 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Task Manager
              </Typography>

              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                inputProps={{ 'aria-label': 'toggle dark mode' }}
              />

              <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {user && (
                <>
                  <IconButton onClick={handleAvatarClick}>
                    <Avatar alt={userName} src={user.photoURL || ''} />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem disabled>{userName}</MenuItem>
                    <MenuItem
                      onClick={() => {
                        setShowProfile(true); // ✅ عند الضغط على "Profile"
                        handleMenuClose();
                      }}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              )}
            </Toolbar>
          </AppBar>

          <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box width="300px" padding="1rem">
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <List>
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={notification.title}
                        secondary={notification.body}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography>No notifications yet</Typography>
                )}
              </List>
            </Box>
          </Drawer>

          <Box textAlign="center" padding="2rem" sx={{ paddingTop: '64px' }}>
            {user ? (
              <>
                <Typography
  variant="h5"
  gutterBottom
  sx={{ color: theme.palette.mode === 'white' ? '#999' : '#fff' ,
    mt: 4, // margin-top
    mb: 3, // margin-bottom

  }}
>
  Welcome, {userName}!
</Typography>
                <TodoList
                  updateCollaborativeTasks={addCollaborativeTask}
                  tasks={tasks}
                  collaborativeTasks={collaborativeTasks}
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleLogout}
                  sx={{ marginTop: '1rem' }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Auth onAuthSuccess={() => setUser(auth.currentUser)} />
            )}
          </Box>
        </>
      )}
    </ThemeProvider>
  );
};

export default App;
