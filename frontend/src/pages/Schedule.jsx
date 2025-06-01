import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    if (token) {
      axios.get("/api/v1/user/schedule", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setSchedules(res.data))
        .catch(() => setSchedules([]));
    }
  }, [token]);

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
              flex: 1,
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
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Lịch học của tôi</h1>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Schedule;
