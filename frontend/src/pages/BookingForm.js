import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BookingForm.css';

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const labourerIdFromURL = queryParams.get('labourerId');

  const [labourers, setLabourers] = useState([]);
  const [selectedLabourer, setSelectedLabourer] = useState(labourerIdFromURL || '');
  const [bookingData, setBookingData] = useState({
    workType: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    additionalNotes: ''
  });
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLabourers();
  }, []);

  useEffect(() => {
    if (selectedLabourer) {
      fetchLabourerDetails(selectedLabourer);
    }
  }, [selectedLabourer]);

  useEffect(() => {
    const calculateTotalCost = () => {
      if (bookingData.startDate && bookingData.endDate && bookingData.startTime && bookingData.endTime && selectedLabourer) {
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

        const startTime = new Date(`2000-01-01T${bookingData.startTime}`);
        const endTime = new Date(`2000-01-01T${bookingData.endTime}`);
        const hoursDiff = (endTime - startTime) / (1000 * 60 * 60);

        const labourer = labourers.find(w => w._id === selectedLabourer);
        const hourlyRate = labourer ? labourer.hourlyRate : 0;

        const total = daysDiff * hoursDiff * hourlyRate;
        setTotalCost(total > 0 ? total : 0);
      } else {
        setTotalCost(0);
      }
    };

    calculateTotalCost();
  }, [bookingData, selectedLabourer, labourers]);

  const fetchLabourers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://labourconnect-a3xg.onrender.com/api/labourers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const labourersData = await response.json();
        setLabourers(labourersData);
      } else {
        console.error('Failed to fetch labourers');
      }
    } catch (error) {
      console.error('Error fetching labourers:', error);
    }
  };

  const fetchLabourerDetails = async (labourerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://labourconnect-a3xg.onrender.com/api/labourers/${labourerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const labourerData = await response.json();
        setLabourers(prev => prev.map(l => l._id === labourerId ? { ...l, ...labourerData } : l));
        setBookingData(prev => ({
          ...prev,
          workType: labourerData.category || labourerData.skills?.[0] || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching labourer details:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      const locationField = name.split('.')[1];
      setBookingData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!bookingData.startTime || !bookingData.endTime) {
    alert('Start time and End time are required!');
    return;
  }

  setLoading(true);

  try {
    const token = localStorage.getItem('token');

    const startTime = new Date(`2000-01-01T${bookingData.startTime}`);
    const endTime = new Date(`2000-01-01T${bookingData.endTime}`);
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);

    if (durationHours <= 0) {
      alert('End time must be later than Start time.');
      setLoading(false);
      return;
    }

    const bookingPayload = {
      workType: bookingData.workType,
      date: bookingData.startDate,
      timeSlot: {
        startTime: bookingData.startTime,
        endTime: bookingData.endTime
      },
      duration: durationHours,
      location: bookingData.location,
      additionalNotes: bookingData.additionalNotes,
      totalCost
    };

    console.log('Payload:', bookingPayload);

    const response = await fetch(`https://labourconnect-a3xg.onrender.com/api/bookings/labourer/${selectedLabourer}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingPayload)
    });

    if (response.ok) {
      alert('Booking created successfully!');
      navigate('/dashboard');
    } else {
      const error = await response.json();
      console.log('error is ', error);
      alert(`Failed to create booking: ${error.message || 'Validation Error'}`);
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    alert('Error creating booking. Please try again.');
  } finally {
    setLoading(false);
  }
};


  const selectedLabourerData = labourers.find(l => l._id === selectedLabourer);

  return (
    <div className="booking-form-container">
      <div className="booking-header">
        <h1>Book a Labourer</h1>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">Back to Dashboard</button>
      </div>

      {selectedLabourerData && (
        <div className="form-section selected-labourer-info">
          <h3>Selected Labourer</h3>
          <div className="labourer-card selected">
            <h4>{selectedLabourerData.name}</h4>
            <p><strong>Category:</strong> {selectedLabourerData.category}</p>
            <p><strong>Hourly Rate:</strong> ₹{selectedLabourerData.hourlyRate}</p>
            <p><strong>Skills:</strong> {selectedLabourerData.skills?.join(', ')}</p>
            <p><strong>Rating:</strong> {selectedLabourerData.rating || 'N/A'} ⭐</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3>Schedule</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date:</label>
              <input type="date" id="startDate" name="startDate" value={bookingData.startDate} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date:</label>
              <input type="date" id="endDate" name="endDate" value={bookingData.endDate} onChange={handleInputChange} min={bookingData.startDate || new Date().toISOString().split('T')[0]} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time:</label>
              <input type="time" id="startTime" name="startTime" value={bookingData.startTime} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time:</label>
              <input type="time" id="endTime" name="endTime" value={bookingData.endTime} onChange={handleInputChange} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Location</h3>
          <div className="form-group">
            <label htmlFor="location.address">Address:</label>
            <textarea id="location.address" name="location.address" value={bookingData.location.address} onChange={handleInputChange} rows="3" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location.city">City:</label>
              <input type="text" id="location.city" name="location.city" value={bookingData.location.city} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="location.state">State:</label>
              <input type="text" id="location.state" name="location.state" value={bookingData.location.state} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="location.pincode">Pincode:</label>
              <input type="text" id="location.pincode" name="location.pincode" value={bookingData.location.pincode} onChange={handleInputChange} pattern="[0-9]{6}" required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label htmlFor="additionalNotes">Additional Notes:</label>
            <textarea id="additionalNotes" name="additionalNotes" value={bookingData.additionalNotes} onChange={handleInputChange} rows="4" placeholder="Any specific requirements or instructions..." />
          </div>
        </div>

        {selectedLabourerData && totalCost > 0 && (
          <div className="cost-summary">
            <h3>Cost Summary</h3>
            <div className="cost-details">
              <p>Hourly Rate: ₹{selectedLabourerData.hourlyRate}</p>
              <p className="total-cost">Total Estimated Cost: ₹{totalCost}</p>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading || !selectedLabourer}>
            {loading ? 'Creating Booking...' : 'Book Labourer'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
