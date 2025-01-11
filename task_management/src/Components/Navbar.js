import React, { useContext, useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Alert, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import context from '../Context/useContext';
import { Snackbar } from '@mui/material';
import MenuIcon from "@mui/icons-material/Menu";

const Navbar = () => {
  const { handleClick, login, setLogin, open, setOpen, message, setMessage, severity, setSeverity } = useContext(context);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // localStorage.removeItem("token");
    if (localStorage.getItem('token')) {
      setLogin(true);
    } else {
      setLogin(false);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
      <div>
        <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
      </div>

      <AppBar position="static" color="primary">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Left Section (Logo and Links) */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <img style={{ height: "50px", width: "100px" }} src="https://cdn.vectorstock.com/i/1000x1000/98/01/windmill-event-management-logo-vector-29969801.webp" alt="Logo" />
            
            {/* Desktop/Tablet Links */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
              <Typography variant="h6" component="div" sx={{ cursor: "pointer" }}>
                <Link to='/' style={{ textDecoration: "none", color: "white" }}>
                  Home
                </Link>
              </Typography>
              {/* <Typography variant="h6" component="div" sx={{ cursor: "pointer" }}>
                <Link to='/dashboard' style={{ textDecoration: "none", color: "white" }}>
                  Dashboard
                </Link>
              </Typography> */}
              {/* <Typography variant="h6" component="div" sx={{ cursor: "pointer" }}>
                <Link to='/tasklist' style={{ textDecoration: "none", color: "white" }}>
                  Task List
                </Link>
              </Typography> */}
              {/* <Typography variant="h6" component="div" sx={{ cursor: "pointer" }}>
                <Link to='/tasklist' style={{ textDecoration: "none", color: "white" }}>
                  Task List
                </Link>
              </Typography> */}
              <Typography variant="h6" component="div" sx={{ cursor: "pointer" }}>
                <Link to='/events' style={{ textDecoration: "none", color: "white" }}>
                  Events
                </Link>
              </Typography>
            </Box>
          </Box>

          {/* Hamburger Icon for Mobile */}
          <IconButton
            sx={{ display: { xs: 'block', sm: 'none' } }}
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* Right Section (Sign Out or Sign Up) */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            {login ? (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => {
                  localStorage.removeItem("token");
                  setLogin(false);
                  handleClick('success', 'SignOut successfully!');
                  navigate('/');
                }}
              >
                <span>Sign Out</span>
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => navigate('/signup')}
              >
                <span>Sign Up</span>
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for Mobile Menu */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            <ListItem button>
              <ListItemText primary={<Link to="/" style={{ textDecoration: 'none' }}>Home</Link>} />
            </ListItem>
            {/* <ListItem button>
              <ListItemText primary={<Link to="/dashboard" style={{ textDecoration: 'none' }}>Dashboard</Link>} />
            </ListItem> */}
            {/* <ListItem button>
              <ListItemText primary={<Link to="/tasklist" style={{ textDecoration: 'none' }}>Task List</Link>} />
            </ListItem> */}
            {login ? (
              <ListItem button>
                <ListItemText
                  primary="Sign Out"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setLogin(false);
                    handleClick('success', 'SignOut successfully!');
                    navigate('/');
                  }}
                />
              </ListItem>
            ) : (
              <ListItem button>
                <ListItemText
                  primary="Sign Up"
                  onClick={() => navigate('/signup')}
                />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
