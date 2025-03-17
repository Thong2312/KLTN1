import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";
const { GET_ENROLLED_COURSES_API } = studentEndpoints;
const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;

// ========== BUY COURSE ==========
export async function buyCourse(token, coursesId, userDetails, navigate, dispatch) {
  const toastId = toast.loading("Initializing PayPal Payment...");

  try {
    const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API,
      { coursesId },
      { Authorization: `Bearer ${token}` }
    );

    console.log("DEBUG: PAYPAL PAYMENT API RESPONSE:", orderResponse.data);

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message);
    }

    if (!orderResponse.data.approval_url) {
      throw new Error("Missing approval_url in API response");
    }

    // Save purchased coursesId to localStorage
    localStorage.setItem("purchasedCourses", JSON.stringify(coursesId));

    // Redirect to PayPal
    window.location.href = orderResponse.data.approval_url;
  }
  catch (error) {
    console.log("PAYPAL PAYMENT API ERROR.....", error);
    toast.error(error.response?.data?.message || "Could not initiate PayPal payment");
  }
  toast.dismiss(toastId);
}

// ========== SEND PAYMENT EMAIL ==========
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
      orderId: response.paymentId,
      paymentId: response.payerID,
      amount,
    }, {
      Authorization: `Bearer ${token}`
    });
  }
  catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
  }
}

// ========== VERIFY PAYMENT ==========
export async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying PayPal Payment....");
  dispatch(setPaymentLoading(true));

  try {
    const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("Payment Successful! You are now enrolled in the course.");

    // Optional: Send payment email here if needed

    dispatch(resetCart());
    navigate("/dashboard/enrolled-courses");
  }
  catch (error) {
    console.log("PAYPAL PAYMENT VERIFY ERROR....", error);
    toast.error("Could not verify PayPal Payment");
  }
  toast.dismiss(toastId);
  dispatch(setPaymentLoading(false));
}

export async function fetchEnrolledCourses(token) {
    let result = [];
    try {
      const response = await apiConnector("GET", GET_ENROLLED_COURSES_API, null, {
        Authorization: `Bearer ${token}`,
      });
      if (response.data.success) {
        result = response.data.data;
      }
    } catch (error) {
      console.log("Error fetching enrolled courses", error);
    }
    return result;
  }