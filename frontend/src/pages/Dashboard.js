import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalEarnings: 0
  });
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState('');

  const [showLabourerModal, setShowLabourerModal] = useState(false);
  const [selectedLabourer, setSelectedLabourer] = useState(null);

  const filterBookings = useCallback(() => {
    if (filter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === filter));
    }
  }, [bookings, filter]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, filter, filterBookings]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const data = await response.json();

      setStats({
        totalBookings: data.totalBookings || 0,
        activeBookings: data.activeBookings || 0,
        completedBookings: data.completedBookings || 0,
        totalEarnings: data.totalEarnings || 0
      });

      setBookings(data.recentBookings || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      completed: 'primary',
      pending: 'warning',
      confirmed: 'info',
      in_progress: 'info',
      cancelled: 'danger'
    };

    const badgeVariant = variants[status.toLowerCase()] || 'secondary';
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    return <Badge bg={badgeVariant}>{formattedStatus}</Badge>;
  };

  const handleAction = (booking, action) => {
    setSelectedBooking(booking);
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    try {
      const newStatus = actionType === 'cancel' ? 'cancelled' : 'completed';

      const response = await fetch(`http://localhost:5000/api/bookings/${selectedBooking._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update booking status');

      const { booking: updatedBooking } = await response.json();

      const updatedBookings = bookings.map(booking =>
        booking._id === updatedBooking._id ? { ...booking, status: updatedBooking.status } : booking
      );

      setBookings(updatedBookings);
      setShowModal(false);
      setSelectedBooking(null);
      setActionType('');
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const viewLabourerDetails = (labourer) => {
    if (labourer) {
      setSelectedLabourer(labourer);
      setShowLabourerModal(true);
    } else {
      alert('No labourer details available.');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h4>Loading dashboard...</h4>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2>Please log in to access your dashboard</h2>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Welcome back, {user.name}!</h2>
          <p className="text-muted">Here's your dashboard overview</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}><Card className="text-center"><Card.Body><Card.Title>{stats.totalBookings}</Card.Title><Card.Text>Total Bookings</Card.Text></Card.Body></Card></Col>
        <Col md={3}><Card className="text-center"><Card.Body><Card.Title>{stats.activeBookings}</Card.Title><Card.Text>Active Bookings</Card.Text></Card.Body></Card></Col>
        <Col md={3}><Card className="text-center"><Card.Body><Card.Title>{stats.completedBookings}</Card.Title><Card.Text>Completed</Card.Text></Card.Body></Card></Col>
        <Col md={3}><Card className="text-center"><Card.Body><Card.Title>₹{stats.totalEarnings}</Card.Title><Card.Text>Total Earnings</Card.Text></Card.Body></Card></Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Form.Select>
        </Col>
        <Col md={8} className="d-flex justify-content-end align-items-center">
          <small className="text-muted">Showing {filteredBookings.length} of {bookings.length} bookings</small>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Bookings</h5>
              <Button variant="outline-primary" size="sm" onClick={() => navigate('/labourers')}>New Booking</Button>
            </Card.Header>
            <Card.Body>
              {filteredBookings.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Work Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking, idx) => (
                      <tr key={idx}>
                        <td>{booking.labourer?.name || 'Unknown'}</td>
                        <td>{booking.labourer?.category || booking.description || 'Unknown'}</td>
                        <td>{new Date(booking.date).toLocaleDateString()}</td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>₹{booking.totalAmount}</td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">Actions</Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => viewLabourerDetails(booking.labourer)}>View Labourer Details</Dropdown.Item>
                              {booking.status === 'pending' && (<Dropdown.Item onClick={() => handleAction(booking, 'cancel')}>Cancel Booking</Dropdown.Item>)}
                              {booking.status === 'confirmed' && (<Dropdown.Item onClick={() => handleAction(booking, 'complete')}>Mark Complete</Dropdown.Item>)}
                              <Dropdown.Item href={`tel:${booking.labourer?.phone}`}>Call Labourer</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-3 text-muted">No bookings found</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{actionType === 'cancel' ? 'Cancel Booking' : 'Mark as Complete'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <>
              <p><strong>Booking:</strong> {selectedBooking.description}</p>
              <p><strong>Client:</strong> {selectedBooking.clientName}</p>
              <p><strong>Date:</strong> {new Date(selectedBooking.date).toLocaleDateString()}</p>

              {actionType === 'cancel' && (
                <Alert variant="warning">Are you sure you want to cancel this booking? This action cannot be undone.</Alert>
              )}

              {actionType === 'complete' && (
                <Alert variant="info">Mark this booking as completed? The labourer will be notified.</Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant={actionType === 'cancel' ? 'danger' : 'primary'} onClick={confirmAction}>
            {actionType === 'cancel' ? 'Cancel Booking' : 'Mark Complete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Labourer Details Modal */}
      <Modal show={showLabourerModal} onHide={() => setShowLabourerModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Labourer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLabourer && (
            <Row>
              <Col md={4} className="text-center">
                <img src={selectedLabourer.profileImage} alt={selectedLabourer.name} className="rounded-circle mb-3" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                <h5>{selectedLabourer.name}</h5>
                <p className="text-muted">{selectedLabourer.category}</p>
                <Badge bg={selectedLabourer.isAvailable ? 'success' : 'secondary'} className="mb-3">
                  {selectedLabourer.isAvailable ? 'Available' : 'Currently Busy'}
                </Badge>
              </Col>
              <Col md={8}>
                <div className="mb-3"><h6>About</h6><p className="text-muted">{selectedLabourer.description || 'N/A'}</p></div>
                <Row className="mb-3">
                  <Col sm={6}><strong>Rating:</strong> ★ {selectedLabourer.rating}/5</Col>
                  <Col sm={6}><strong>Jobs Completed:</strong> {selectedLabourer.totalJobs}</Col>
                  <Col sm={6}><strong>Experience:</strong> {selectedLabourer.experience}</Col>
                  <Col sm={6}><strong>Hourly Rate:</strong> ₹{selectedLabourer.hourlyRate}</Col>
                </Row>
                <div className="mb-3"><h6>Location</h6><p className="text-muted">📍 {selectedLabourer.location?.city}, {selectedLabourer.location?.state}</p></div>
                <div className="mb-3"><h6>Skills</h6><div className="d-flex flex-wrap gap-2">{(selectedLabourer.skills || []).map((skill, index) => (<Badge key={index} bg="primary" className="me-1">{skill}</Badge>))}</div></div>
                <div className="mb-3"><h6>Languages</h6><p className="text-muted">{(selectedLabourer.languages || []).join(', ') || 'N/A'}</p></div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLabourerModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
