import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import cartoon from '../assets/images/cartoon.jpg';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Connect with Skilled Labourers
              </h1>
              <p className="lead mb-4">
                Find reliable and skilled labourers for your projects.
                Our platform connects employers with verified workers
                across various categories.
              </p>
              <div className="d-flex gap-4 flex-wrap">
                <Button as={Link} to="/labourers" variant="outline-light" size="lg">
                  Show All Workers
                </Button>
                <Button as={Link} to="/register" variant="outline-light" size="lg">
                  Join as Labourer
                </Button>
              </div>
            </Col>

            <Col lg={6}>
              <img
                src={cartoon}
                alt="Labour Connect"
                className="img-fluid rounded"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <Container className="py-5">
        <Row>
          <Col lg={12} className="text-center mb-5">
            <h2 className="h1 fw-bold mb-3">Why Choose Labour Connect?</h2>
            <p className="lead">We make it easy to find and hire skilled labourers</p>
          </Col>
        </Row>

        <Row>
          <Col md={4} className="mb-4">
            <Card className="feature-card h-100 text-center p-4">
              <Card.Body>
                <div className="mb-3">
                  <i className="fas fa-users fa-3x text-primary"></i>
                </div>
                <Card.Title>Verified Labourers</Card.Title>
                <Card.Text>
                  All labourers are verified with proper documentation
                  and skill assessment.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="feature-card h-100 text-center p-4">
              <Card.Body>
                <div className="mb-3">
                  <i className="fas fa-calendar-check fa-3x text-success"></i>
                </div>
                <Card.Title>Easy Booking</Card.Title>
                <Card.Text>
                  Book labourers with just a few clicks. Select date,
                  time, and location for your project.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="feature-card h-100 text-center p-4">
              <Card.Body>
                <div className="mb-3">
                  <i className="fas fa-star fa-3x text-warning"></i>
                </div>
                <Card.Title>Rating System</Card.Title>
                <Card.Text>
                  Read reviews and ratings from previous employers
                  to make informed decisions.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Categories Section */}
      <section className="bg-light py-5">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="h1 fw-bold mb-3">Labour Categories</h2>
              <p className="lead">Find skilled workers across various categories</p>
            </Col>
          </Row>

          <Row>
            {[
              'General Helper',
              'Construction Labour',
              'Factory Worker',
              'Loader/Unloader',
              'Cleaning Staff'
            ].map((category, index) => (
              <Col md={6} lg={4} className="mb-3" key={index}>
                <Card className="text-center p-3">
                  <Card.Body>
                    <Card.Title>{category}</Card.Title>
                    <Button
                      as={Link}
                      to={`/labourers?category=${encodeURIComponent(category)}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      Find Workers
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}

            {/* Special "And More" Card that links to the full list */}
            <Col md={6} lg={4} className="mb-3">
              <Card className="text-center p-3">
                <Card.Body>
                  <Card.Title>All Categories</Card.Title>
                  <Button
                    as={Link}
                    to="/labourers"
                    variant="primary"
                    size="sm"
                  >
                    Show All Workers
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <Container className="py-5">
        <Row>
          <Col lg={12} className="text-center">
            <h2 className="h1 fw-bold mb-4">Ready to Get Started?</h2>
            <p className="lead mb-4">
              Join thousands of employers and labourers using our platform
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Button as={Link} to="/register" variant="primary" size="lg">
                Register Now
              </Button>
              <Button as={Link} to="/labourers" variant="outline-primary" size="lg">
                Browse Labourers
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
