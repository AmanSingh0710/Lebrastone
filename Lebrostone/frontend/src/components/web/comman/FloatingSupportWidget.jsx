import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FloatingSupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    description: '',
    attachment: null
  });
  const [errors, setErrors] = useState({});

  // Get user token
  const getToken = () => {
    // Check for user session token first
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      return userToken;
    }
    
    // Fallback: check if user exists
    const user = localStorage.getItem('user');
    if (user) {
      return 'active-session'; // Use the session token stored during login
    }
    
    return null;
  };

  // Fetch user's tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      // Get user ID from localStorage
      const user = localStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;
      
      if (!userData || !userData._id) {
        console.error('User not found');
        return;
      }
      
      const response = await axios.get('http://localhost:5001/api/support/my-tickets', {
        headers: {
          'Authorization': token,
          'x-user-id': userData._id
        },
        params: {
          userId: userData._id
        }
      });

      if (response.data.success) {
        setTickets(response.data.data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          attachment: 'File size must be less than 5MB'
        }));
        return;
      }
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          attachment: 'Only images, PDFs, and Word documents are allowed'
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        attachment: file
      }));
      setErrors(prev => ({
        ...prev,
        attachment: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit new ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        alert('Please login to create a ticket');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      if (formData.attachment) {
        formDataToSend.append('attachment', formData.attachment);
      }

      // Get user ID from localStorage
      const user = localStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;
      
      if (!userData || !userData._id) {
        alert('User data not found. Please login again.');
        return;
      }
      
      // Append user ID to form data
      formDataToSend.append('userId', userData._id);
      
      const response = await axios.post(
        'http://localhost:5001/api/support/create',
        formDataToSend,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data',
            'x-user-id': userData._id
          }
        }
      );

      if (response.data.success) {
        alert('Ticket created successfully!');
        setFormData({
          subject: '',
          category: '',
          description: '',
          attachment: null
        });
        setShowForm(false);
        fetchTickets(); // Refresh tickets list
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  // Toggle widget
  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !showForm) {
      fetchTickets();
    }
  };

  // Toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
    setErrors({});
  };

  // Status badge styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main Button */}
      <button
        onClick={toggleWidget}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Widget Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transform transition-all duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <h3 className="font-semibold text-lg">Support Center</h3>
            <p className="text-sm opacity-90">How can we help you today?</p>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            {/* Create Ticket Button */}
            {!showForm && (
              <button
                onClick={toggleForm}
                className="w-full mb-4 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Ticket
              </button>
            )}

            {/* Ticket Creation Form */}
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Brief description of your issue"
                    />
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Order Related">Order Related</option>
                      <option value="Product Inquiry">Product Inquiry</option>
                      <option value="Billing Issue">Billing Issue</option>
                      <option value="Account Issue">Account Issue</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe your issue in detail..."
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.attachment && <p className="text-red-500 text-xs mt-1">{errors.attachment}</p>}
                    <p className="text-xs text-gray-500 mt-1">Max 5MB. JPG, PNG, GIF, PDF, DOC, DOCX</p>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        'Submit Ticket'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={toggleForm}
                      className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Tickets List */}
            {!showForm && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">Your Tickets</h4>
                  <button
                    onClick={fetchTickets}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-500">No tickets yet</p>
                    <p className="text-sm text-gray-400">Create your first support ticket</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.slice(0, 5).map((ticket) => (
                      <div key={ticket._id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm text-gray-800 truncate flex-1 mr-2">
                            {ticket.subject}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>Ticket ID: {ticket.ticketId}</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          Category: {ticket.category}
                        </div>
                      </div>
                    ))}
                    
                    {tickets.length > 5 && (
                      <div className="text-center pt-2">
                        <p className="text-sm text-gray-500">Showing 5 of {tickets.length} tickets</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingSupportWidget;