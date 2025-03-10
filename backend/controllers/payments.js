const paypal = require("../config/paypal");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
require("dotenv").config();

const User = require("../models/user");
const Course = require("../models/course");
const CourseProgress = require("../models/courseProgress");

const { default: mongoose } = require("mongoose");

// ================ Capture the payment and Initiate PayPal order ================
exports.capturePayment = async (req, res) => {
    const { coursesId } = req.body;
    const userId = req.user.id;

    if (!coursesId || coursesId.length === 0) {
        return res.status(400).json({ success: false, message: "Please provide Course Id" });
    }

    let totalAmount = 0;
    for (const course_id of coursesId) {
        try {
            const course = await Course.findById(course_id);
            if (!course) {
                return res.status(404).json({ success: false, message: "Could not find the course" });
            }

            const uid = new mongoose.Types.ObjectId(userId);
            if (course.studentsEnrolled.includes(uid)) {
                return res.status(400).json({ success: false, message: "Student is already Enrolled" });
            }

            totalAmount += course.price;
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // Create PayPal order
    const paymentJson = {
        intent: "sale",
        payer: { payment_method: "paypal" },
        transactions: [{
            amount: { total: totalAmount.toFixed(2), currency: "USD" },
            description: `Payment for courses: ${coursesId.join(", ")}`,
        }],
        redirect_urls: {
            return_url: "http://localhost:3000/payment-success",
            cancel_url: "http://localhost:3000/payment-cancel",
        },
    };

    paypal.payment.create(paymentJson, (error, payment) => {
        if (error) {
            console.error("PayPal Payment Error:", error);
            return res.status(500).json({ success: false, message: "Could not create PayPal payment" });
        }

        const approvalUrl = payment.links.find(link => link.rel === "approval_url");
        res.json({
            success: true,
            approval_url: approvalUrl.href,
            currency: "USD",  // Trả về currency như Razorpay
            amount: totalAmount.toFixed(2)  // Trả về số tiền như Razorpay
        });
    });
};


// ================ Verify PayPal Payment ================
exports.verifyPayment = async (req, res) => {
    const { paymentId, PayerID, coursesId } = req.body;
    const userId = req.user.id;

    if (!paymentId || !PayerID || !coursesId || !userId) {
        console.log("❌ DEBUG: Thiếu dữ liệu xác thực thanh toán", req.body);
        return res.status(400).json({ success: false, message: "Payment Failed, data not found" });
    }

    paypal.payment.execute(paymentId, { payer_id: PayerID }, async (error, payment) => {
        if (error) {
            console.error("PayPal Execution Error:", error);
            return res.status(500).json({ success: false, message: "Payment execution failed" });
        }

        console.log("✅ DEBUG: Thanh toán PayPal thành công:", payment);
        await enrollStudents(coursesId, userId, res);
        return res.status(200).json({ success: true, message: "Payment Verified" });
    });
};


// ================ Enroll Students to course after payment ================
const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
        return res.status(400).json({ success: false, message: "Please Provide data for Courses or UserId" });
    }

    for (const courseId of courses) {
        try {
            console.log(`DEBUG: Enrolling user ${userId} to course ${courseId}`);

            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                { $push: { studentsEnrolled: userId } },
                { new: true },
            );

            if (!enrolledCourse) {
                console.log("❌ DEBUG: Không tìm thấy khóa học - ID:", courseId);
                return res.status(500).json({ success: false, message: "Course not Found" });
            }

            console.log("✅ DEBUG: Updated course:", enrolledCourse);

            const courseProgress = await CourseProgress.create({
                courseID: courseId,
                userId: userId,
                completedVideos: [],
            });

            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        courses: courseId,
                        courseProgress: courseProgress._id,
                    },
                },
                { new: true }
            );

            console.log("✅ DEBUG: Enrolled student:", enrolledStudent);
        } catch (error) {
            console.log("❌ DEBUG: Lỗi khi enroll sinh viên:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};


// ================ Send Payment Success Email ================
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user.id;

    if (!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({ success: false, message: "Please provide all the fields" });
    }

    try {
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            `Payment of $${amount} for Order ID: ${orderId} with Payment ID: ${paymentId} was successful.`
        );
    } catch (error) {
        console.log("Error in sending mail", error);
        return res.status(500).json({ success: false, message: "Could not send email" });
    }
};
