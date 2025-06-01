import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Schedule.css';

const Schedule = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [title, setTitle] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Fetch courses and teachers
    axios.get('/api/v1/course/getAllCourses').then(res => setCourses(res.data.data));
    axios.get('/api/v1/auth/all-instructors').then(res => setTeachers(res.data.allInstructorsDetails || []));
  }, []);

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    const res = await axios.get(`/api/v1/course/${courseId}/students`);
    setStudents(res.data.students || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const scheduleData = {
      title,
      startDateTime,
      endDateTime,
      courseId: selectedCourse,
      teacherId: selectedTeacher,
    };
    // TODO: Sửa endpoint này nếu backend đã có API cho schedule, ví dụ: /api/v1/user/schedule
    // await axios.post('/api/v1/user/schedule', scheduleData);
    alert('Lịch học đã được tạo thành công!');
  };

  return (
    <div className="text-black">
      <h1>Quản lý lịch học</h1>
      <form onSubmit={handleSubmit}>
        <label>Tiêu đề:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Ngày và giờ bắt đầu:</label>
        <input type="datetime-local" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} required />

        <label>Ngày và giờ kết thúc:</label>
        <input type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} required />

        <label>Khóa học:</label>
        <select
          className="w-full p-2 rounded border border-gray-300 bg-white select-black-text"
          value={selectedCourse}
          onChange={(e) => handleCourseChange(e.target.value)}
          required
        >
          <option value="" className="select-black-text">Chọn khóa học</option>
          {courses.map(course => (
            <option key={course._id} value={course._id} className="select-black-text">{course.courseName}</option>
          ))}
        </select>

        <label>Giáo viên:</label>
        <select
          className="w-full p-2 rounded border border-gray-300 bg-white select-black-text"
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          required
        >
          <option value="" className="select-black-text">Chọn giáo viên</option>
          {teachers.map(teacher => (
            <option key={teacher._id} value={teacher._id} className="select-black-text">{teacher.name}</option>
          ))}
        </select>

        <label>Danh sách học sinh:</label>
        <ul>
          {students.map(student => (
            <li key={student._id}>{student.name}</li>
          ))}
        </ul>

        <button type="submit">Tạo lịch học</button>
      </form>
    </div>
  );
};

export default Schedule;
