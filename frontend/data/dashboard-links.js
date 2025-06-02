import { ACCOUNT_TYPE } from './../src/utils/constants';

export const sidebarLinks = [
  {
    id: 1,
    name: "My Profile",
    path: "/dashboard/my-profile",
    icon: "VscAccount",
  },
  {
    id: 2,
    name: "Dashboard",
    path: "/dashboard/instructor",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscDashboard",
  },
  {
    id: 3,
    name: "My Courses",
    path: "/dashboard/my-courses",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscVm",
  },
  {
    id: 4,
    name: "Add Course",
    path: "/dashboard/add-course",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscAdd",
  },
  {
    id: 5,
    name: "Enrolled Courses",
    path: "/dashboard/enrolled-courses",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscMortarBoard",
  },
  {
    id: 6,
    name: "Purchase History",
    path: "/dashboard/purchase-history",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscHistory",
  },
  {
    id: 7,
    name: "Create Category",
    path: "/dashboard/create-category",
    type: ACCOUNT_TYPE.ADMIN || ACCOUNT_TYPE.OWNER,
    icon: "VscNewFolder",
  },
  {
    id: 8,
    name: "All Students",
    path: "/dashboard/all-students",
    type: ACCOUNT_TYPE.ADMIN || ACCOUNT_TYPE.OWNER,
    icon: "VscBook",
  },
  {
    id: 9,
    name: "All Instructors",
    path: "/dashboard/all-instructors",
    type: ACCOUNT_TYPE.ADMIN || ACCOUNT_TYPE.OWNER,
    icon: "VscNotebook",
  },
  {
    id: 12,
    name: "Admin Management",
    path: "/dashboard/all-admins",
    type: ACCOUNT_TYPE.OWNER,
    icon: "VscShield",
  },
  {
    id: 10,
    name: "Chat",
    path: "/dashboard/chat",
    icon: "VscComment",
  },
  {
    id: 11,
    name: "Quản lý lịch học",
    path: "/dashboard/schedule",
    icon: "VscCalendar",
  }
];
