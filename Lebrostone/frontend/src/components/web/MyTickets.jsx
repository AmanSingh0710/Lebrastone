import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

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

  const fetchTickets = async (page = 1) => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user ID from localStorage
      const user = localStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;
      
      if (!userData || !userData._id) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(
        `http://localhost:5001/api/support/my-tickets?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': token,
            'x-user-id': userData._id
          },
          params: {
            userId: userData._id
          }
        }
      );

      if (response.data.success) {
        setTickets(response.data.data.tickets);
        setTotalPages(response.data.data.pagination.totalPages);
        setCurrentPage(response.data.data.pagination.currentPage);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return '🔵';
      case 'Pending': return '🟡';
      case 'Resolved': return '🟢';
      case 'Closed': return '⚫';
      default: return '⚪';
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Support Tickets</h1>
          <p className="text-gray-600">Manage and track all your support requests</p>
        </div>

        {/* Stats Overview */}
        {tickets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {tickets.filter(t => t.status === 'Open').length}
              </div>
              <div className="text-sm text-gray-600">Open Tickets</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">
                {tickets.filter(t => t.status === 'Pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {tickets.filter(t => t.status === 'Resolved').length}
              </div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-600">
                {tickets.filter(t => t.status === 'Closed').length}
              </div>
              <div className="text-sm text-gray-600">Closed</div>
            </div>
          </div>
        )}

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {tickets.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
              <p className="text-gray-500 mb-6">You haven't created any support tickets.</p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-3">Ticket ID & Subject</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Created Date</div>
                  <div className="col-span-2">Last Activity</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Tickets */}
              <div className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <div key={ticket._id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="col-span-3">
                      <div className="font-medium text-gray-900">{ticket.ticketId}</div>
                      <div className="text-sm text-gray-500 truncate">{ticket.subject}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {ticket.category}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
                        {getStatusIcon(ticket.status)} {ticket.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {new Date(ticket.lastActivity).toLocaleDateString()}
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => navigate(`/support/ticket/${ticket.ticketId}`)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTickets;