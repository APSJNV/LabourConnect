import React from 'react';
import { Navbar as BSNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderUserNavbar = () => (
    <>
      <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
      <NavDropdown title={user?.name || 'User'} id="user-dropdown">
        <NavDropdown.Item as={Link} to="/profile">
          Profile
        </NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={handleLogout}>
          Logout
        </NavDropdown.Item>
      </NavDropdown>
    </>
  );

  const renderAdminNavbar = () => (
    <>
      <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
      <Nav.Link as={Link} to="/admin-dashboard">Admin Dashboard</Nav.Link>
      <NavDropdown title={user?.name || 'Admin'} id="admin-dropdown">
        <NavDropdown.Item as={Link} to="/profile">
          Profile
        </NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={handleLogout}>
          Logout
        </NavDropdown.Item>
      </NavDropdown>
    </>
  );

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          Labour Connect
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/labourers">Find Labourers</Nav.Link>
          </Nav>

          <Nav className="ms-auto">
            {user ? (
              user.role === 'admin' ? renderAdminNavbar() : renderUserNavbar()
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
