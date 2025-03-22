import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;

// ================ buyCourse ================ 
export async function buyCourse(token, coursesId, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Redirecting to PayPal...");

    try {
        // 1. Call backend to initiate PayPal order
        const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API,
            { coursesId },
            {
                Authorization: `Bearer ${token}`,
            });

        if (!orderResponse.data.success) {
            throw new Error(orderResponse.data.message);
        }

        const approvalUrl = orderResponse.data.message.approval_url;

        // 2. Save coursesId to localStorage
        localStorage.setItem("coursesId", JSON.stringify(coursesId));

        // 3. Redirect to PayPal
        window.location.href = approvalUrl;
    }
    catch (error) {
        console.log("PAYMENT API ERROR.....", error);
        toast.error(error.response?.data?.message || "Could not initiate payment");
    }
    toast.dismiss(toastId);
}

// ================ send Payment Success Email ================
// (Bạn có thể giữ lại nếu muốn dùng sau, hiện tại PayPal chưa cần hàm này)
export async function sendPaymentSuccessEmail(response, amount, token) {
    try {
        await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount,
        }, {
            Authorization: `Bearer ${token}`
        });
    }
    catch (error) {
        console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
    }
}

// ================ verify payment ================

export async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....");
    dispatch(setPaymentLoading(true));

    try {
        const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("Payment Successful, you are added to the course");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }
    catch (error) {
        console.log("PAYMENT VERIFY ERROR....", error);
        toast.error("Could not verify Payment");
    }
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
}
