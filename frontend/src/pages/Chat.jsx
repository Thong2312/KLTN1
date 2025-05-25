import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Chat = () => {
  const { user } = useSelector((state) => state.profile);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch enrolled courses for the student
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/v1/profile/getEnrolledCourses', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log('Fetched courses:', response.data.data);
        setCourses(response.data.data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    if (user && user.accountType === 'Student') {
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    // Fetch chat messages for selected course
    const fetchMessages = async () => {
      if (!selectedCourse) return;
      try {
        const response = await axios.get(`/api/v1/course/${selectedCourse._id}/chat`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(response.data.messages || []);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedCourse, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCourse) return;
    try {
      await axios.post(
        `/api/v1/course/${selectedCourse._id}/chat`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setNewMessage('');
      // Refresh messages
      const response = await axios.get(`/api/v1/course/${selectedCourse._id}/chat`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(response.data.messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-2xl font-semibold mb-4">Chat</h2>
      {user.accountType === 'Student' && (
        <div className="mb-4">
          <label htmlFor="courseSelect" className="block mb-2 font-medium">
            Chọn khóa học:
          </label>
          <select
            id="courseSelect"
            className="w-full p-2 border border-gray-300 rounded"
            value={selectedCourse?._id || ''}
            onChange={(e) => {
              const course = courses.find((c) => c._id === e.target.value);
              setSelectedCourse(course);
            }}
          >
            <option value="">-- Chọn khóa học --</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex-1 overflow-auto border border-gray-300 rounded p-4 mb-4 bg-white">
        {messages.length === 0 ? (
          <p className="text-gray-500">Không có tin nhắn nào.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`mb-2 p-2 rounded ${
                msg.sender === (user.accountType.toLowerCase()) ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'
              } max-w-xs`}
            >
              <p>{msg.message}</p>
              <small className="text-gray-600 text-xs">{new Date(msg.sentAt).toLocaleString()}</small>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-l"
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default Chat;
