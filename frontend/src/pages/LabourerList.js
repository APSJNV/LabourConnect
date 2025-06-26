import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LabourerList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const categoryFromURL = queryParams.get('category') || '';

  const [labourers, setlabourers] = useState([]);
  const [filteredlabourers, setFilteredlabourers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedlabourer, setSelectedlabourer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    category: categoryFromURL,
    location: '',
    minRating: 0,
    maxRate: 1000,
    availability: 'all',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const labourersPerPage = 6;

  const workCategories = [
    'Construction Labour',
    'General Helper',
    'Factory labourer',
    'Loader/Unloader',
    'Cleaning Staff',
    'Painter',
    'Electrician Helper',
    'Plumber Helper',
    'Gardening',
    'Carpenter',
    'Welder',
    'Mason',
    'Tile Fitter',
    'Painter',
    'Scaffolder',
    'Security Guard',
    'Warehouse labourer',
    'Driver',
    'Housekeeping',
    'Cook',
    'Other'
  ];

  useEffect(() => {
    fetchlabourers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [labourers, filters]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: categoryFromURL
    }));
  }, [categoryFromURL]);

  const fetchlabourers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/labourers');
      const data = await res.json();
      const labourersArray = Array.isArray(data)
        ? data
        : Array.isArray(data.labourers)
          ? data.labourers
          : [];

      const formatted = labourersArray.map(labourer => ({
        ...labourer,
        id: labourer._id,
      }));

      setlabourers(formatted);
    } catch (error) {
      console.error('Error fetching labourers:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = labourers;

    if (filters.category) {
      filtered = filtered.filter(labourer => labourer.category === filters.category);
    }

    if (filters.location) {
      filtered = filtered.filter(labourer =>
        labourer.location?.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        labourer.location?.state?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(labourer => labourer.rating >= filters.minRating);
    }

    if (filters.maxRate < 1000) {
      filtered = filtered.filter(labourer => labourer.hourlyRate <= filters.maxRate);
    }

    if (filters.availability === 'available') {
      filtered = filtered.filter(labourer => labourer.isAvailable);
    } else if (filters.availability === 'unavailable') {
      filtered = filtered.filter(labourer => !labourer.isAvailable);
    }

    setFilteredlabourers(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === "minRating" || name === "maxRate" ? Number(value) : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      minRating: 0,
      maxRate: 1000,
      availability: 'all'
    });
  };

  const viewlabourerDetails = (labourer) => {
    setSelectedlabourer(labourer);
    setShowModal(true);
  };

  const booklabourer = (labourer) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book-labourer?labourerId=${labourer.id}`);
  };

  const totalPages = Math.ceil(filteredlabourers.length / labourersPerPage);
  const paginatedlabourers = filteredlabourers.slice(
    (currentPage - 1) * labourersPerPage,
    currentPage * labourersPerPage
  );

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">

      {/* Filter Section */}
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Filters</h5>
            <Button variant="link" onClick={clearFilters} className="p-0">Clear All</Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select name="category" value={filters.category} onChange={handleFilterChange}>
                  <option value="">All Categories</option>
                  {workCategories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="City or State"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Min Rating</Form.Label>
                <Form.Select name="minRating" value={filters.minRating} onChange={handleFilterChange}>
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Max Rate (₹/hr)</Form.Label>
                <Form.Range
                  name="maxRate"
                  min={50}
                  max={1000}
                  value={filters.maxRate}
                  onChange={handleFilterChange}
                />
                <small className="text-muted">₹{filters.maxRate}</small>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Availability</Form.Label>
                <Form.Select name="availability" value={filters.availability} onChange={handleFilterChange}>
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* labourers List */}
      <Row>
        {paginatedlabourers.length === 0 ? (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <h5>No labourers found</h5>
                <p className="text-muted">Try adjusting your filters to see more results.</p>
                <Button variant="primary" onClick={clearFilters}>Clear Filters</Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          paginatedlabourers.map(labourer => (
            <Col md={6} lg={4} key={labourer.id} className="mb-4">
              <Card className="h-100 shadow-sm labourer-card">
                <Card.Body>
                  <div className="d-flex align-items-start mb-3">
                    <img
                      src={labourer.profileImage}
                      alt={labourer.name}
                      className="rounded-circle me-3"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-1">{labourer.name}</h6>
                      <p className="text-muted mb-1">{labourer.category}</p>
                      <div className="d-flex align-items-center">
                        <Badge bg="warning" text="dark" className="me-2">★ {labourer.rating}</Badge>
                        <small className="text-muted">({labourer.totalJobs} jobs)</small>
                      </div>
                    </div>
                    <Badge bg={labourer.isAvailable ? 'success' : 'secondary'}>
                      {labourer.isAvailable ? 'Available' : 'Busy'}
                    </Badge>
                  </div>

                  <p className="text-muted small mb-2">
                    📍 {labourer.location?.city || 'Unknown'}, {labourer.location?.state || ''}
                  </p>
                  <p className="text-muted small mb-3">
                    💼 {labourer.experience || 'N/A'} experience
                  </p>

                  <div className="mb-3">
                    <small className="text-muted">Skills:</small>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {(labourer.skills || []).slice(0, 3).map((skill, index) => (
                        <Badge key={index} bg="light" text="dark" className="small">{skill}</Badge>
                      ))}
                      {(labourer.skills || []).length > 3 && (
                        <Badge
                          bg="light"
                          text="dark"
                          className="small"
                          style={{ cursor: 'pointer' }}
                          onClick={() => viewlabourerDetails(labourer)}
                        >
                          +{(labourer.skills || []).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="text-primary">₹{labourer.hourlyRate}/hr</strong>
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => viewlabourerDetails(labourer)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!labourer.isAvailable}
                        onClick={() => booklabourer(labourer)}
                      >
                        {labourer.isAvailable ? 'Book Now' : 'Unavailable'}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Pagination */}
      <Row className="mt-3">
        <Col className="d-flex justify-content-center">
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="align-self-center">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline-primary"
            className="ms-2"
            onClick={() =>
              setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Col>
      </Row>

      {/* labourer Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>labourer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedlabourer && (
            <Row>
              <Col md={4} className="text-center">
                <img
                  src={selectedlabourer.profileImage}
                  alt={selectedlabourer.name}
                  className="rounded-circle mb-3"
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                />
                <h5>{selectedlabourer.name}</h5>
                <p className="text-muted">{selectedlabourer.category}</p>
                <Badge bg={selectedlabourer.isAvailable ? 'success' : 'secondary'} className="mb-3">
                  {selectedlabourer.isAvailable ? 'Available' : 'Currently Busy'}
                </Badge>
              </Col>
              <Col md={8}>
                <div className="mb-3"><h6>About</h6><p className="text-muted">{selectedlabourer.description || 'N/A'}</p></div>
                <Row className="mb-3">
                  <Col sm={6}><strong>Rating:</strong> ★ {selectedlabourer.rating}/5</Col>
                  <Col sm={6}><strong>Jobs Completed:</strong> {selectedlabourer.totalJobs}</Col>
                  <Col sm={6}><strong>Experience:</strong> {selectedlabourer.experience}</Col>
                  <Col sm={6}><strong>Hourly Rate:</strong> ₹{selectedlabourer.hourlyRate}</Col>
                </Row>
                <div className="mb-3"><h6>Location</h6><p className="text-muted">📍 {selectedlabourer.location?.city}, {selectedlabourer.location?.state}</p></div>
                <div className="mb-3"><h6>Skills</h6><div className="d-flex flex-wrap gap-2">{(selectedlabourer.skills || []).map((skill, index) => (<Badge key={index} bg="primary" className="me-1">{skill}</Badge>))}</div></div>
                <div className="mb-3"><h6>Languages</h6><p className="text-muted">{(selectedlabourer.languages || []).join(', ') || 'N/A'}</p></div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          {selectedlabourer?.isAvailable && (
            <Button variant="primary" onClick={() => { setShowModal(false); booklabourer(selectedlabourer); }}>
              Book This labourer
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LabourerList;
