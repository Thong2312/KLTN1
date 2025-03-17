import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyPayment, fetchEnrolledCourses } from "../../../services/operations/studentFeaturesAPI";

function EnrolledCourses() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [courses, setCourses] = useState([]);

  // Handle PayPal redirect
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentId = queryParams.get("paymentId");
    const PayerID = queryParams.get("PayerID");
    const coursesId = JSON.parse(localStorage.getItem("purchasedCourses")) || [];

    if (paymentId && PayerID && coursesId.length > 0) {
      const bodyData = {
        paymentId,
        PayerID,
        coursesId
      };
      verifyPayment(bodyData, token, navigate, dispatch);
      localStorage.removeItem("purchasedCourses");
    }
  }, []);

  // Fetch enrolled courses
  useEffect(() => {
    async function loadCourses() {
      const enrolled = await fetchEnrolledCourses(token);
      setCourses(enrolled);
    }
    loadCourses();
  }, [token]);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Enrolled Courses</h2>

      {courses.length === 0 ? (
        <p>You have not enrolled in any course yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {courses.map(course => (
            <div key={course._id} className="border p-4 rounded shadow">
              <h3 className="font-bold text-lg">{course.courseName}</h3>
              <p>{course.courseDescription}</p>
              <p className="text-sm">Instructor: {course.instructor.firstName} {course.instructor.lastName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EnrolledCourses;
