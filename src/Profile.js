// src/Profile.js
import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  TextField,
  Button,
} from '@mui/material';

const Profile = ({ onBack }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setEditName(data.name || '');
        setPhotoURL(user.photoURL || '');
      }
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user && editName.trim()) {
      setIsSaving(true);
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { name: editName });
      await updateProfile(user, { displayName: editName, photoURL });
      fetchUserData();
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Card sx={{ width: 400, padding: 2 }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar src={photoURL} sx={{ width: 80, height: 80, mb: 2 }}>
              {editName.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {userData?.name || 'User'}
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              {auth.currentUser.email}
            </Typography>

            <TextField
              label="Edit Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />

            <TextField
              label="Photo URL"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={isSaving}
              sx={{ mt: 2 }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={onBack}
              sx={{ mt: 2 }}
            >
              Back
            </Button>

          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
