import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAllStudentsData } from '../../../services/operations/adminApi'
import { Table, Th, Thead, Tr, Td, Tbody } from 'react-super-responsive-table';
import IconBtn from '../../common/IconBtn';

import { VscAdd } from 'react-icons/vsc';
import user_logo from "../../../assets/Images/user.png";

import axios from 'axios';

const AllStudents = () => {
  const { token } = useSelector((state) => state.auth);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [allCourses, setAllCourses] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    // Fetch all students
    const fetchStudents = async () => {
      try {
        const res = await getAllStudentsData(token);
        setStudents(res.allStudentsDetails || []);
        // Collect all unique courses
        const courses = new Set();
        (res.allStudentsDetails || []).forEach(student => {
          (student.courses || []).forEach(course => {
            courses.add(JSON.stringify({ _id: course._id, courseName: course.courseName }));
          });
        });
        setAllCourses(Array.from(courses).map(c => JSON.parse(c)));
      } catch (err) {
        setStudents([]);
      }
    };
    if (token) fetchStudents();
  }, [token]);

  useEffect(() => {
    let filtered = students;
    if (search) {
      filtered = filtered.filter(s =>
        s.firstName.toLowerCase().includes(search.toLowerCase()) ||
        s.lastName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (courseFilter) {
      filtered = filtered.filter(s =>
        (s.courses || []).some(c => c._id === courseFilter)
      );
    }
    setFilteredStudents(filtered);
  }, [search, courseFilter, students]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Danh sách học viên</h2>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          className="border p-2 rounded w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
        >
          <option value="">Tất cả khóa học</option>
          {allCourses.map(course => (
            <option key={course._id} value={course._id}>{course.courseName}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Tên</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Khóa học đã tham gia</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-4">Không có học viên nào.</td></tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student._id}>
                  <td className="border px-4 py-2">{student.firstName} {student.lastName}</td>
                  <td className="border px-4 py-2">{student.email}</td>
                  <td className="border px-4 py-2">
                    {(student.courses || []).length === 0 ? (
                      <span className="text-gray-400">Chưa tham gia khóa học nào</span>
                    ) : (
                      <ul className="list-disc ml-4">
                        {student.courses.map(course => {
                          // Log dữ liệu từng course để debug chi tiết
                          console.log('Student:', student.email, 'Course:', JSON.stringify(course, null, 2));
                          const courseId = course._id;
                          // Lấy sectionId và subSectionId từ mảng courseContent (dạng ID string)
                          const courseSections = course.courseContent || course.sections;
                          const sectionId = Array.isArray(courseSections) && courseSections.length > 0 ? courseSections[0] : '';
                          const subSectionId = sectionId; // Nếu không có subSection thực, dùng luôn sectionId
                          return (
                            <li key={courseId}>
                              <a
                                href={`/view-course/${courseId}/section/${sectionId}/sub-section/${subSectionId}`}
                                className="text-blue-600 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {course.courseName}
                              </a>
                              {course.createdAt && (
                                <span className="ml-2 text-xs text-gray-500">(Tham gia: {new Date(course.createdAt).toLocaleDateString()})</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllStudents;