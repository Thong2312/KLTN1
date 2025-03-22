import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { studentEndpoints } from "../services/apis";
import { toast } from "react-hot-toast";

const { COURSE_VERIFY_API } = studentEndpoints;

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentId = queryParams.get("paymentId");
    const PayerID = queryParams.get("PayerID");

    const storedCourses = JSON.parse(localStorage.getItem("coursesId")); // Đọc coursesId đã lưu
    const token = JSON.parse(localStorage.getItem("token"));


    if (!paymentId || !PayerID || !storedCourses) {
      toast.error("Missing payment information");
      navigate("/dashboard/enrolled-courses");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await apiConnector("POST", COURSE_VERIFY_API, {
          paymentId,
          PayerID,
          coursesId: storedCourses,
        }, {
          Authorization: `Bearer ${token}`
        });

        if (response.data.success) {
          toast.success("Payment Verified Successfully");
          localStorage.removeItem("coursesId");
          navigate("/dashboard/enrolled-courses");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log("Error verifying payment:", error);
        toast.error("Payment verification failed");
      }
    };

    verifyPayment();
  }, [location.search, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-semibold mb-4">Verifying Payment...</h2>
    </div>
  );
};

export default PaymentSuccess;
