import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BsSend } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import Layout from '../layout/Layout';

const MessageBox = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [newConversationEmail, setNewConversationEmail] = useState('');
  const [employees, setEmployees] = useState([]);
  const selectedConversationRef = useRef(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in');
      return;
    }

    socketRef.current = io('http://localhost:5000', {
      auth: { token }
    });

    socketRef.current.on('error', ({ message }) => {
      toast.error(message);
    });

    socketRef.current.on('receive_message', ({ conversationId, message }) => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return { ...conv, messages: [...conv.messages, message], lastMessage: message.text };
        }
        return conv;
      }));

      if (selectedConversationRef.current?.id === conversationId) {
        setSelectedConversation(prev => ({
          ...prev,
          messages: [...prev.messages, message],
          lastMessage: message.text
        }));
      }
    });


    socketRef.current.on('new_message_notification', ({ conversationId, message }) => {
      fetchConversations();
    });

    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/employee/getEmployee', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(response.data.filter(emp => emp.status === 'Active'));
      } catch (error) {

        // toast.error('Failed to fetch employees');
      }
    };

    fetchEmployees();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const fetchConversations = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data.conversations);
    } catch (error) {
      toast.error('Failed to fetch conversations');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      socketRef.current.emit('join_conversation', { conversationId: selectedConversation.id });
    }
  }, [selectedConversation]);

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    socketRef.current.emit('send_message', {
      conversationId: selectedConversation.id,
      text: messageInput
    });

    setMessageInput('');
  };

  const handleStartConversation = async () => {
    const token = localStorage.getItem('token');
    const selectedEmployee = employees.find(emp => emp.email === newConversationEmail);
    if (!selectedEmployee) {
      toast.error('Employee not found');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/messages/conversation',
        { receiverId: selectedEmployee.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchConversations();
      setNewConversationEmail('');
      toast.success('Conversation started');
    } catch (error) {
      console.error('Start conversation error:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to start conversation');
    }
  };

  return (
    <Layout>
      <div className="flex h-screen bg-gray-100">
        <div className="w-1/3 border-r border-gray-300 bg-white overflow-y-auto">
          <h2 className="text-xl font-semibold p-4 border-b border-gray-300">Messages</h2>
          <div className="p-4 border-b">
            <input
              type="email"
              value={newConversationEmail}
              onChange={(e) => setNewConversationEmail(e.target.value)}
              placeholder="Enter employee email"
              className="w-full border px-4 py-2 rounded-md"
            />
            <button
              onClick={handleStartConversation}
              className="mt-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Start New Conversation
            </button>
          </div>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                selectedConversation?.id === conv.id ? 'bg-gray-200' : ''
              }`}
              onClick={() => setSelectedConversation(conv)}
            >
              <h3 className="font-semibold">
                {conv.participants.find(p => p.id !== localStorage.getItem('userId'))?.name || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
            </div>
          ))}
        </div>

        <div className="w-2/3 p-6 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="border-b pb-2 mb-4">
                <h2 className="text-xl font-bold">
                  {selectedConversation.participants.find(p => p.id !== localStorage.getItem('userId'))?.name || 'Unknown'}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {selectedConversation.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === localStorage.getItem('userId')
                        ? 'bg-blue-500 text-white self-end ml-auto'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <BsSend className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 m-auto">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MessageBox;