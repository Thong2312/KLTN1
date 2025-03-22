import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { profileEndpoints } from "../../../services/apis";

const { GET_USER_ENROLLED_COURSES_API } = profileEndpoints;

const PurchaseHistory = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await apiConnector(
          "GET",
          GET_USER_ENROLLED_COURSES_API,
          null,
          { Authorization: `Bearer ${token}` }
        );

        if (response.data.success) {
          setEnrolledCourses(response.data.data);
        }
      } catch (error) {
        console.log("Error fetching enrolled courses:", error);
      }
    };

    fetchEnrolledCourses();
  }, [token]);

  return (
    <div className="text-white p-8">
      <h2 className="text-3xl mb-6 font-bold">🛒 Purchase History</h2>

      {enrolledCourses.length === 0 ? (
        <p className="text-richblack-200">You have not purchased any course yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full bg-richblack-800 text-left border border-richblack-600">
            <thead className="bg-richblack-700 text-richblack-100 uppercase text-sm">
              <tr>
                <th className="px-6 py-4 border-b border-richblack-600">#</th>
                <th className="px-6 py-4 border-b border-richblack-600">Course Name</th>
                <th className="px-6 py-4 border-b border-richblack-600">Price</th>
              </tr>
            </thead>
            <tbody>
              {enrolledCourses.map((course, index) => (
                <tr key={index} className="hover:bg-richblack-700 transition">
                  <td className="px-6 py-4 border-b border-richblack-600">{index + 1}</td>
                  <td className="px-6 py-4 border-b border-richblack-600">{course.courseName}</td>
                  <td className="px-6 py-4 border-b border-richblack-600">${course.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
