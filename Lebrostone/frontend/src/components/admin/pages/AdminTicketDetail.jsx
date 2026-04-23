import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AdminTicketDetail = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const getAdminToken = () => {
    return localStorage.getItem('adminToken');
  };

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      if (!token) return;

      const response = await axios.get(
        `http://localhost:5001/api/support/admin/${ticketId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setTicket(response.data.data.ticket);
        setMessages(response.data.data.messages);
        setSelectedStatus(response.data.data.ticket.status);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) return;

    try {
      setSending(true);
      const token = getAdminToken();
      
      const response = await axios.post(
        `http://localhost:5001/api/support/admin/${ticketId}/reply`,
        { 
          message: replyMessage,
          status: selectedStatus
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setReplyMessage('');
        fetchTicketDetails(); // Refresh messages and ticket data
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === ticket.status) return;

    try {
      setUpdatingStatus(true);
      const token = getAdminToken();
      
      const response = await axios.put(
        `http://localhost:5001/api/support/admin/${ticketId}/status`,
        { status: selectedStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        fetchTicketDetails(); // Refresh ticket data
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      return 'bg-gray-100 text-gray-800';
    }
  };

  const isUserMessage = (senderType) => senderType === 'user';

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Ticket not found</h2>
          <p className="text-gray-500">The requested ticket could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Ticket Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.subject}</h1>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {ticket.ticketId}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {ticket.category}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                {ticket.priority}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
              <div className="flex space-x-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Open">Open</option>
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || selectedStatus === ticket.status}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">User Information</h3>
            <p className="text-sm text-gray-600">Name: {ticket.userId?.name || 'N/A'}</p>
            <p className="text-sm text-gray-600">Email: {ticket.userId?.email || 'N/A'}</p>
            <p className="text-sm text-gray-600">Phone: {ticket.userId?.phoneNumber || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Ticket Details</h3>
            <p className="text-sm text-gray-600">Created: {new Date(ticket.createdAt).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Last Activity: {new Date(ticket.lastActivity).toLocaleString()}</p>
            {ticket.resolvedAt && (
              <p className="text-sm text-gray-600">Resolved: {new Date(ticket.resolvedAt).toLocaleString()}</p>
            )}
            {ticket.closedAt && (
              <p className="text-sm text-gray-600">Closed: {new Date(ticket.closedAt).toLocaleString()}</p>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Assignment</h3>
            <p className="text-sm text-gray-600">
              Assigned to: {ticket.assignedTo?.email || 'Unassigned'}
            </p>
          </div>
        </div>

        {ticket.description && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Conversation</h2>
        </div>
        
        <div className="p-6">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${isUserMessage(message.senderType) ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isUserMessage(message.senderType)
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {isUserMessage(message.senderType) ? `${ticket.userId?.name || 'User'}` : 'You (Support)'}
                    </div>
                    <div className="whitespace-pre-wrap">{message.message}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleString()}
                    </div>
                    {message.attachment && (
                      <div className="mt-2">
                        <a
                          href={`http://localhost:5001${message.attachment}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs underline ${
                            isUserMessage(message.senderType) ? 'text-blue-600' : 'text-blue-200'
                          }`}
                        >
                          📎 Attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Send Reply</h3>
        </div>
        <form onSubmit={handleSendReply} className="p-6">
          <div className="mb-4">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your response here..."
              required
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Current status: <span className={`font-medium ${getStatusClass(selectedStatus)}`}>{selectedStatus}</span>
            </div>
            <button
              type="submit"
              disabled={sending || !replyMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {sending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Reply
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTicketDetail;