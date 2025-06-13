const Schedule = require('../models/schedule');
const Course = require('../models/course');
const User = require('../models/user');

// Tạo lịch học
exports.createSchedule = async (req, res) => {
  try {
    const { title, startDateTime, endDateTime, courseId, teacherId } = req.body;

    // Lấy danh sách học sinh từ khóa học
    const course = await Course.findById(courseId).populate('studentsEnrolled');
    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại' });
    }

    const schedule = new Schedule({
      title,
      startDateTime,
      endDateTime,
      course: courseId,
      teacher: teacherId,
      students: course.studentsEnrolled.map(student => student._id),
    });

    await schedule.save();
    res.status(201).json({ message: 'Lịch học đã được tạo thành công', schedule });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: 'Lỗi khi tạo lịch học', error: error.message || error });
  }
};

// Lấy danh sách lịch học
exports.getSchedules = async (req, res) => {
  try {
    const userId = req.user.id;
    const accountType = req.user.accountType;

    let schedules;
    if (accountType === 'Admin') {
      // Admin gets all schedules
      schedules = await Schedule.find({}).populate('course teacher students');
    } else {
      // Other users get schedules where they are student or teacher
      schedules = await Schedule.find({
        $or: [
          { students: userId },
          { teacher: userId }
        ]
      }).populate('course teacher students');
    }

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách lịch học', error });
  }
};

// Xóa lịch học
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Schedule.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy lịch học' });
    res.status(200).json({ message: 'Đã xóa lịch học thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa lịch học', error });
  }
};

// Sửa lịch học
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updated = await Schedule.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy lịch học' });
    res.status(200).json({ message: 'Đã cập nhật lịch học', schedule: updated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật lịch học', error });
  }
};
