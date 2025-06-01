import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

const Schedule = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [form, setForm] = useState({
    title: "",
    startDateTime: "",
    endDateTime: "",
    course: "",
    teacher: "",
    students: [],
    startTime: "",
    endTime: "",
    startDate: "",
    endDate: "",
  });
  const [schedules, setSchedules] = useState([]);
  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    // Lấy danh sách khóa học
    axios.get("/api/v1/course/getAllCourses").then(res => setCourses(res.data.data));
    // Lấy danh sách giáo viên (chỉ gọi nếu có token)
    if (token) {
      axios.get("/api/v1/auth/all-instructors", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setTeachers(res.data.allInstructorsDetails || []))
        .catch(() => setTeachers([]));
    } else {
      setTeachers([]);
    }
    // Lấy danh sách lịch học
    // TODO: Sửa endpoint này nếu backend đã có API cho schedules, ví dụ: /api/v1/user/schedule
    // axios.get("/api/v1/user/schedule").then(res => setSchedules(res.data));
  }, [token]);

  useEffect(() => {
    if (selectedCourse && token) {
      axios.get(`/api/v1/course/${selectedCourse}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setStudents(res.data.students || []);
        setForm(prev => ({ ...prev, students: (res.data.students || []).map(s => s._id) }));
      }).catch(() => {
        setStudents([]);
        setForm(prev => ({ ...prev, students: [] }));
      });
    } else {
      setStudents([]);
      setForm(prev => ({ ...prev, students: [] }));
    }
  }, [selectedCourse, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "course") setSelectedCourse(e.target.value);
  };

  const handleDateTimeChange = (type, value) => {
    setForm(prev => {
      const newForm = { ...prev, [type]: value };
      if (type === "startDate" || type === "startTime") {
        newForm.startDateTime =
          (newForm.startDate || "") + "T" + (newForm.startTime || "07:00");
      }
      if (type === "endDate" || type === "endTime") {
        newForm.endDateTime =
          (newForm.endDate || "") + "T" + (newForm.endTime || "07:00");
      }
      return newForm;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/schedules", {
      title: form.title,
      startDateTime: form.startDateTime,
      endDateTime: form.endDateTime,
      course: form.course,
      teacher: form.teacher,
      students: form.students,
    });
    alert("Tạo lịch học thành công!");
    setForm({
      title: "",
      startDateTime: "",
      endDateTime: "",
      course: "",
      teacher: "",
      students: [],
      startTime: "",
      endTime: "",
      startDate: "",
      endDate: "",
    });
    setSelectedCourse("");
    axios.get("/api/schedules").then(res => setSchedules(res.data));
  };

  const renderTimeOptions = () => {
    const times = [];
    for (let h = 7; h <= 20; h++) {
      times.push(
        <option key={h} value={`${h}:00`}>{`${h}:00`}</option>,
        <option key={h + "-30"} value={`${h}:30`}>{`${h}:30`}</option>
      );
    }
    return times;
  };

  const renderScheduleTable = () => {
    const week = [[], [], [], [], [], []];
    schedules.forEach((sch) => {
      const day = new Date(sch.startDateTime).getDay();
      if (day >= 1 && day <= 6) week[day - 1].push(sch);
    });
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
        <thead>
          <tr>
            {weekdays.map((d, idx) => (
              <th key={idx} style={{ border: "1px solid #ccc", padding: 8 }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {week.map((day, idx) => (
              <td key={idx} style={{ border: "1px solid #ccc", verticalAlign: "top", padding: 8 }}>
                {day.length === 0
                  ? <span style={{ color: "#888" }}>Không có lịch</span>
                  : day.map((sch, i) => (
                    <div key={i} style={{ marginBottom: 12, background: "#f0f7ff", borderRadius: 6, padding: 8 }}>
                      <b>{sch.title}</b><br />
                      {new Date(sch.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(sch.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br />
                      GV: {sch.teacher?.name || "N/A"}
                    </div>
                  ))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Quản lý lịch học</h1>
      <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 8, padding: 24, marginBottom: 32, boxShadow: "0 2px 8px #eee" }}>
        <div style={{ marginBottom: 16 }}>
          <label>Tiêu đề</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Khóa học</label>
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", marginTop: 4 }}
          >
            <option value="">-- Chọn khóa học --</option>
{courses.map((c) => (
  <option key={c._id} value={c._id}>{c.courseName}</option>
))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Giáo viên</label>
          <select
            name="teacher"
            value={form.teacher}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", marginTop: 4 }}
          >
            <option value="">-- Chọn giáo viên --</option>
{teachers.map((t) => (
  <option key={t._id} value={t._id}>{t.firstName + " " + t.lastName}</option>
))}
          </select>
        </div>
        <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Ngày bắt đầu</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={e => handleDateTimeChange("startDate", e.target.value)}
              required
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", marginTop: 4 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Giờ bắt đầu</label>
            <select
              name="startTime"
              value={form.startTime}
              onChange={e => handleDateTimeChange("startTime", e.target.value)}
              required
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", marginTop: 4 }}
            >
              <option value="">-- Chọn giờ --</option>
              {renderTimeOptions()}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Ngày kết thúc</label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={e => handleDateTimeChange("endDate", e.target.value)}
              required
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", marginTop: 4 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Giờ kết thúc</label>
            <select
              name="endTime"
              value={form.endTime}
              onChange={e => handleDateTimeChange("endTime", e.target.value)}
              required
              style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", marginTop: 4 }}
            >
              <option value="">-- Chọn giờ --</option>
              {renderTimeOptions()}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Danh sách học sinh</label>
          <ul style={{ marginLeft: 20, marginTop: 4 }}>
            {students.length === 0
              ? <li style={{ color: "#888" }}>Chưa có học sinh đăng ký</li>
              : students.map((s) => <li key={s._id}>{s.name} ({s.email})</li>)
            }
          </ul>
        </div>
        <div style={{ textAlign: "right" }}>
          <button type="submit" style={{ background: "#2563eb", color: "#fff", padding: "8px 24px", border: "none", borderRadius: 4, fontWeight: 600 }}>
            Tạo lịch học
          </button>
        </div>
      </form>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Thời khoá biểu tuần</h2>
      {renderScheduleTable()}
    </div>
  );
};

export default Schedule;