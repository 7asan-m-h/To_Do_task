import React from 'react';
import { motion } from 'framer-motion';
import { Typography, Box, Button } from '@mui/material';

const Welcome = ({ onEnter }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1e88e5, #42a5f5)',
        color: '#fff',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            marginBottom: '1rem',
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          Welcome to Task Manager!
        </Typography>
        <Typography
          variant="h5"
          sx={{
            marginBottom: '2rem',
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          Organize your tasks like never before.
        </Typography>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={onEnter}
            sx={{
              fontWeight: 'bold',
              fontSize: '1rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '20px',
            }}
          >
            Get Started
          </Button>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default Welcome;
