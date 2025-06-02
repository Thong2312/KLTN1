import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.profile.user);
  console.log("User in Schedule.jsx:", user);
  console.log("User role in Schedule.jsx:", user?.role);

  const renderTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const hh = hour.toString().padStart(2, "0");
        const mm = min.toString().padStart(2, "0");
        times.push(
          <option key={`${hh}:${mm}`} value={`${hh}:${mm}`}>
            {`${hh}:${mm}`}
          </option>
        );
      }
    }
    return times;
  };

  useEffect(() => {
    // Fetch courses
    axios.get("/api/v1/course/getAllCourses").then(res => setCourses(res.data.data));
    // Fetch teachers if token exists
    if (token) {
      axios.get("/api/v1/auth/all-instructors", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setTeachers(res.data.allInstructorsDetails || []))
        .catch(() => setTeachers([]));
    } else {
      setTeachers([]);
    }
    // Fetch schedules
    axios.get("/api/v1/user/schedule", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setSchedules(res.data))
      .catch(() => setSchedules([]));
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
    await axios.post("/api/v1/user/schedule", {
      title: form.title,
      startDateTime: form.startDateTime,
      endDateTime: form.endDateTime,
      courseId: form.course,
      teacherId: form.teacher,
      students: form.students,
    }, {
      headers: { Authorization: `Bearer ${token}` }
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
    axios.get("/api/v1/user/schedule", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setSchedules(res.data))
      .catch(() => setSchedules([]));
  };

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";

    return (
      <div className="header row flex-middle" style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div className="col col-start">
          <button onClick={prevMonth} style={{ cursor: "pointer" }}>Prev</button>
        </div>
        <div className="col col-center">
          <span>{format(currentMonth, dateFormat)}</span>
        </div>
        <div className="col col-end">
          <button onClick={nextMonth} style={{ cursor: "pointer" }}>Next</button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEEEEE";
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col col-center" key={i} style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="days row" style={{ display: "flex" }}>{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const daySchedules = schedules.filter(sch =>
          isSameDay(new Date(sch.startDateTime), cloneDay)
        );

        days.push(
          <div
            className={`col cell ${!isSameMonth(day, monthStart) ? "disabled" : isSameDay(day, new Date()) ? "selected" : ""}`}
            key={day}
            style={{
              minWidth: 120,
              border: "1px solid #ddd",
              height: 100,
              padding: 8,
              backgroundColor: isSameDay(day, new Date()) ? "#e6f7ff" : "white",
              overflowY: "auto",
              position: "relative"
            }}
          >
            <span className="number" style={{ fontWeight: "bold" }}>{formattedDate}</span>
            <div className="events" style={{ marginTop: 4 }}>
              {daySchedules.map((sch, idx) => (
                <div key={idx} style={{ backgroundColor: "#bae7ff", marginBottom: 4, borderRadius: 4, padding: 2, fontSize: 12, cursor: "pointer" }}>
                  <b>{sch.title}</b><br />
                  {format(new Date(sch.startDateTime), "HH:mm")} - {format(new Date(sch.endDateTime), "HH:mm")}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day} style={{ display: "flex" }}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="body">{rows}</div>;
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24, overflowX: "auto" }}>
      {user?.accountType === "Admin" && (
        <>
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
        </>
      )}
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Thời khoá biểu tháng</h2>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Schedule;