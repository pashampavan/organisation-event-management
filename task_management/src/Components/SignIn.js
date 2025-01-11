import React, { useEffect, useState, useContext } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import context from '../Context/useContext';
import { Snackbar} from '@mui/material';
const SignIn = ({ type }) => {

  const {handleClose,handleClick, login, setLogin, open, setOpen,message, setMessage,severity, setSeverity} = useContext(context);
  const navigate = useNavigate();
  
  // Check if token exists on mount
  useEffect(() => {
    setName("");
        setEmail("");
        setPassword("");
    if (localStorage.getItem('token')) {
      navigate('/events'); // Redirect if already logged in
    }
  }, [type]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle SignIn / SignUp logic
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (type === "signin") {
      try {
        const response = await axios.post("http://localhost:5000/login/", {
          email: email,
          password: password
        });

        // Save JWT token to localStorage after successful login
        const token = response.data.token;
        localStorage.setItem("token", token);
        setSuccess("SignIn successful!");
        handleClick('success','SignIn successful!');
        setLogin(true);  // Update login context
        navigate('/dashboard');
      } catch (err) {
        // setError(err.response?.data?.message || "Invalid email or Password");
        handleClick('error',"Invalid email or Password")
      }
    } else {
      try {
        const response = await axios.post("http://localhost:5000/register/", {
          email: email,
          name: name,
          password: password
        });

        setSuccess("SignUp successful!");
        handleClick('success','SignUp successful!');
        navigate("/dashboard");
      } catch (err) {
        handleClick('error',err.response?.data?.message || "SignUp failed");
        setError(err.response?.data?.message || "SignUp failed");
      }
    }
  };

  return (
    <>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 8,
        gap: 2,
      }}
    >
      <Typography variant="h4">
        {type === "signin" ? <>SignIn</> : <>SignUp</>}
      </Typography>

      {/* Error/Success Messages */}
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      {/* SignIn Form */}
      {
        !(type === "signin")?<>
        <Box
        component="form"
        onSubmit={handleSignIn}
        sx={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        <TextField
          type="text"
          label="Email ID"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
   
          <TextField
            label="Name"
            type="text"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)
            }
            inputProps={{
              minLength: 6,
            }}
            helperText="Name must be at least 6 characters long"
          />


<TextField
  label="Password"
  type="password"
  variant="outlined"
  fullWidth
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  inputProps={{
    minLength: 5,
  }}
  helperText="Password must be at least 5 characters long"
/>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          {type === "signin" ? <>SignIn</> : <>SignUp</>}
        </Button>
      </Box>
        </>
        :
        <>
        <Box
        component="form"
        onSubmit={handleSignIn}
        sx={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        <TextField
          type="text"
          label="Email ID"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
   
<TextField
  label="Password"
  type="password"
  variant="outlined"
  fullWidth
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          {type === "signin" ? <>SignIn</> : <>SignUp</>}
        </Button>
      </Box>
        </>
      }
      
    </Box>
    </>
  );
};

export default SignIn;
