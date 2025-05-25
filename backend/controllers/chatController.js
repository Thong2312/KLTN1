const Course = require('../models/course');
const ChatMessage = require('../models/chatMessage');

// New API: Get list of students enrolled in a course
exports.getStudentsInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate('studentsEnrolled');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, students: course.studentsEnrolled });
  } catch (error) {
    console.error('Error fetching students in course:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Modified getChatMessages to accept studentId param for instructor
exports.getChatMessages = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const studentId = req.query.studentId;

    const course = await Course.findById(courseId).populate('instructor studentsEnrolled');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isStudent = course.studentsEnrolled.some(student => student._id.toString() === userId);
    const isInstructor = course.instructor._id.toString() === userId;

    if (!isStudent && !isInstructor) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let filter = { course: courseId };

    if (isStudent) {
      filter.student = userId;
    } else if (isInstructor) {
      if (!studentId) {
        return res.status(400).json({ success: false, message: 'studentId query parameter is required for instructor' });
      }
      filter.student = studentId;
    }

    const messages = await ChatMessage.find(filter).sort({ sentAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Implement sendMessage to save message to DB
exports.sendMessage = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const course = await Course.findById(courseId).populate('instructor studentsEnrolled');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Determine sender type
    let senderType = '';
    const isInstructor = course.instructor._id.toString() === userId;
    const isStudent = course.studentsEnrolled.some(student => student._id.toString() === userId);

    if (isInstructor) {
      senderType = 'instructor';
    } else if (isStudent) {
      senderType = 'student';
    } else {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const newMessage = new ChatMessage({
      course: courseId,
      student: senderType === 'student' ? userId : null,
      instructor: course.instructor._id,
      sender: senderType,
      message,
      sentAt: new Date()
    });

    await newMessage.save();

    res.status(201).json({ success: true, message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Placeholder for getEnrolledCourses
exports.getEnrolledCourses = async (req, res) => {
  res.status(200).json({ success: true, message: 'getEnrolledCourses placeholder' });
};
