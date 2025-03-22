import React, { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Alert,
  Grid,
} from '@mui/material';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // تخزين الاسم في Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: name,
          email: email,
        });

        onAuthSuccess();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
      <Paper elevation={3} style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <Typography variant="h4" align="center" gutterBottom>
          {isLogin ? 'Login' : 'Create a New Account'}
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box display="flex" flexDirection="column" gap={2}>
          {!isLogin && (
            <TextField
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
          )}
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
          <Button variant="contained" color="primary" onClick={handleAuth} fullWidth>
            {isLogin ? 'Login' : 'Register'}
          </Button>
          <Button
            color="secondary"
            onClick={() => setIsLogin(!isLogin)}
            fullWidth
          >
            {isLogin ? 'Create a New Account' : 'Already have an account? Login'}
          </Button>
        </Box>
      </Paper>
    </Grid>
  );
};

export default Auth;
