import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;

// ================ buyCourse (Chuyển sang PayPal) ================
export async function buyCourse(token, coursesId, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Initializing PayPal Payment...");

    try {
        // Gửi request tạo đơn hàng PayPal
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

        // Chuyển hướng người dùng đến PayPal để thanh toán
        window.location.href = orderResponse.data.approval_url;
    }
    catch (error) {
        console.log("PAYPAL PAYMENT API ERROR.....", error);
        toast.error(error.response?.data?.message || "Could not initiate PayPal payment");
    }
    toast.dismiss(toastId);
}

// ================ send Payment Success Email ================
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

// ================ verify payment (Chuyển sang PayPal) ================
async function verifyPayment(bodyData, token, navigate, dispatch) {
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
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }
    catch (error) {
        console.log("PAYPAL PAYMENT VERIFY ERROR....", error);
        toast.error("Could not verify PayPal Payment");
    }
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
}
