const Schedule = require('../models/schedule');
const Course = require('../models/course');
const User = require('../models/user');

// Tạo lịch học
exports.createSchedule = async (req, res) => {
  try {
    const { title, startDateTime, endDateTime, courseId, teacherId } = req.body;

    // Lấy danh sách học sinh từ khóa học
    const course = await Course.findById(courseId).populate('students');
    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại' });
    }

    const schedule = new Schedule({
      title,
      startDateTime,
      endDateTime,
      course: courseId,
      teacher: teacherId,
      students: course.students.map(student => student._id),
    });

    await schedule.save();
    res.status(201).json({ message: 'Lịch học đã được tạo thành công', schedule });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo lịch học', error });
  }
};

// Lấy danh sách lịch học
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('course teacher students');
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách lịch học', error });
  }
};
