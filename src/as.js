import React, { useState, useEffect } from 'react';
import { auth, db, messaging } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import Auth from './Auth';
import TodoList from './TodoList';
import Welcome from './welcome'; // واجهة الترحيب
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
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const App = () => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [notifications, setNotifications] = useState([]); // حالة الإشعارات
  const [drawerOpen, setDrawerOpen] = useState(false); // حالة فتح/إغلاق قائمة الإشعارات

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  // جلب بيانات المستخدم والتحقق من تسجيل الدخول
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserName(docSnap.data().name);
        } else {
          setUserName('User');
        }
      } else {
        setUser(null);
        setUserName('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // جلب FCM Token للإشعارات
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const currentToken = await getToken(messaging, {
          vapidKey: 'BDPFV4f-r47-hJzFoVPnfLVCS90fGcLyH2Oi0MJy_VohSo6BNxKblQOmOu7mbIc3KY6aA0VkvIx1A7GrmE8xg7A',
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

  // التعامل مع الإشعارات الفورية
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

  // إنهاء عرض واجهة الترحيب
  const handleEnter = () => {
    setShowWelcome(false);
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
      ) : (
        <>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Task Manager
              </Typography>
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                inputProps={{ 'aria-label': 'toggle dark mode' }}
              />
              <IconButton
                color="inherit"
                onClick={() => setDrawerOpen(true)}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          >
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
          <Box textAlign="center" padding="2rem">
            {user ? (
              <>
                <Typography variant="h5" gutterBottom>
                  Welcome, {userName}!
                </Typography>
                <TodoList />
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => auth.signOut()}
                  style={{ marginTop: '1rem' }}
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