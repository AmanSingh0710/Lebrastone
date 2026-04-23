import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const TicketDetail = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
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

  const fetchTicketDetails = async () => {
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
        `http://localhost:5001/api/support/${ticketId}`,
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
        setTicket(response.data.data.ticket);
        setMessages(response.data.data.messages);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      if (error.response?.status === 404) {
        alert('Ticket not found');
        navigate('/support/my-tickets');
      } else if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) return;

    try {
      setSending(true);
      const token = getToken();
      
      // Get user ID from localStorage
      const user = localStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;
      
      if (!userData || !userData._id) {
        alert('Please login to send messages');
        return;
      }
      
      const response = await axios.post(
        `http://localhost:5001/api/support/${ticketId}/message`,
        { 
          message: replyMessage,
          userId: userData._id
        },
        {
          headers: {
            'Authorization': token,
            'x-user-id': userData._id
          }
        }
      );

      if (response.data.success) {
        setReplyMessage('');
        fetchTicketDetails(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
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

  const isUserMessage = (senderType) => senderType === 'user';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ticket details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Ticket not found</h2>
          <button
            onClick={() => navigate('/support/my-tickets')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to My Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/support/my-tickets')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Tickets
          </button>
          
          <div className="bg-white rounded-lg shadow p-6">
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
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>Created: {new Date(ticket.createdAt).toLocaleString()}</div>
                <div>Last Activity: {new Date(ticket.lastActivity).toLocaleString()}</div>
              </div>
            </div>
            
            {ticket.description && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            )}
          </div>
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
                    className={`flex ${isUserMessage(message.senderType) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isUserMessage(message.senderType)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {isUserMessage(message.senderType) ? 'You' : 'Support Team'}
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
                              isUserMessage(message.senderType) ? 'text-blue-200' : 'text-blue-600'
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
        {ticket.status !== 'Closed' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Reply</h3>
            </div>
            <form onSubmit={handleSendMessage} className="p-6">
              <div className="mb-4">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Type your message here..."
                  required
                />
              </div>
              <div className="flex justify-end">
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
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {ticket.status === 'Closed' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">This ticket is closed. Please create a new ticket if you need further assistance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;