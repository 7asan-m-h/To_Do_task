import React, { useState } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { TextField, Button, Typography, Paper, Box, Alert, Grid } from '@mui/material';

const Login = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // جلب اسم المستخدم من Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      const userName = docSnap.exists() ? docSnap.data().name : 'User';

      // تمرير معلومات المستخدم
      onAuthSuccess(user, userName);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
      <Paper elevation={3} style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login to Your Account
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          <Button variant="contained" color="primary" onClick={handleLogin} fullWidth>
            Login
          </Button>
        </Box>
      </Paper>
    </Grid>
  );
};

export default Login;
