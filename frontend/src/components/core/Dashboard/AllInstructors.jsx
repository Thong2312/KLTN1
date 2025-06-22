import { useEffect, useState } from "react";
import { VscAdd } from "react-icons/vsc";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table";

import { getAllInstructorDetails } from "../../../services/operations/adminApi";

import IconBtn from "../../common/IconBtn";




// loading skeleton
const LoadingSkeleton = () => {
  return (<div className="flex p-5 flex-col gap-6 border-b border-2 border-b-richblack-500">
    <div className="flex flex-col sm:flex-row gap-5 items-center mt-7">
      <p className='h-[150px] w-[150px] rounded-full skeleton'></p>
      <div className="flex flex-col gap-2 ">
        <p className='h-4 w-[160px] rounded-xl skeleton'></p>
        <p className='h-4 w-[270px] rounded-xl skeleton'></p>
        <p className='h-4 w-[100px] rounded-xl skeleton'></p>
      </div>
    </div>
    <div className='flex gap-5'>
      <p className="h-7 w-full sm:w-1/2 rounded-xl skeleton"></p>
      <p className="h-7 w-full sm:w-1/2 rounded-xl skeleton"></p>
      <p className="h-7 w-full sm:w-1/2 rounded-xl skeleton"></p>
    </div>
  </div>)
}


function AllInstructors() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [allInstructorDetails, setAllInstructorDetails] = useState([]);
  const [instructorsCount, setInstructorsCount] = useState();
  const [loading, setLoading] = useState(false)



  useEffect(() => {
    const fetchInstructorsData = async () => {
      setLoading(true)
      const { allInstructorsDetails, instructorsCount } = await getAllInstructorDetails(token);
      if (allInstructorsDetails) {
        setAllInstructorDetails(allInstructorsDetails);
        setInstructorsCount(instructorsCount)
      }
      setLoading(false)
    };

    fetchInstructorsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-white">
      <div className="mb-14 flex items-center justify-between text-white">
        <h1 className="text-4xl font-medium text-richblack-5 font-boogaloo text-center sm:text-left">All Instructors Details</h1>

        <IconBtn text="Add Instructor" onclick={() => navigate("")}>
          <VscAdd />
        </IconBtn>
      </div>

      <Table className="min-w-full border">
        <Thead>
          <Tr className="bg-gray-100">
            <Th className="border px-4 py-2 text-white bg-gray-800">Tên</Th>
            <Th className="border px-4 py-2 text-white bg-gray-800">Email</Th>
            <Th className="border px-4 py-2 text-white bg-gray-800">Khóa học đã tạo</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading ? (
            <Tr><Td colSpan={3} className="text-center py-4">Đang tải...</Td></Tr>
          ) : allInstructorDetails.length === 0 ? (
            <Tr><Td colSpan={3} className="text-center py-4">Không có giảng viên nào.</Td></Tr>
          ) : (
            allInstructorDetails.map(instructor => (
              <Tr key={instructor._id}>
                <Td className="border px-4 py-2">{instructor.firstName} {instructor.lastName}</Td>
                <Td className="border px-4 py-2">{instructor.email}</Td>
                <Td className="border px-4 py-2">
                  {(instructor.courses || []).length === 0 ? (
                    <span className="text-gray-400">Chưa tạo khóa học nào</span>
                  ) : (
                    <ul className="list-disc ml-4">
                      {instructor.courses.map(course => {
                        // Log dữ liệu từng course để debug chi tiết
                        console.log('Instructor:', instructor.email, 'Course:', JSON.stringify(course, null, 2));
                        const courseId = course._id;
                        // Lấy sectionId và subSectionId từ mảng courseContent (ID string)
                        const courseSections = course.courseContent || course.sections;
                        const sectionId = Array.isArray(courseSections) && courseSections.length > 0 ? courseSections[0] : '';
                        const subSectionId = sectionId; // Nếu không có subSection thực, dùng luôn sectionId
                        return (
                          <li key={courseId}>
                            <a
                              href={`/view-course/${courseId}/section/${sectionId}/sub-section/${subSectionId}`}
                              className="text-white hover:underline !text-white"
                              style={{ color: 'white' }}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {course.courseName}
                            </a>
                            {course.createdAt && (
                              <span className="ml-2 text-xs text-gray-500">(Tham gia: {new Date(course.createdAt).toLocaleDateString()})</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}

export default AllInstructors;