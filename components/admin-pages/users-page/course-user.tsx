"use client";

import { formatShortDate } from "@/lib/format-data";
import { useGetCourseUsersQuery } from "@/store/user/user-api";
import { Box } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { FC, JSX } from "react";
import { AiOutlineMail } from "react-icons/ai";
import DataTable from "../data-table";
import { FaChalkboardTeacher } from "react-icons/fa";

interface Props { }

const CourseUsers: FC<Props> = (props): JSX.Element => {
  const { isLoading, data } = useGetCourseUsersQuery({}, { refetchOnMountOrArgChange: true });

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 0.5,
    },
    // {
    //   field: "role",
    //   headerName: "Role",
    //   flex: 0.5,
    // },
    // {
    //   field: "courses",
    //   headerName: "Enrolled Courses",
    //   flex: 0.5,
    //   renderCell: (params: any) => {
    //     return `${params.row.courses.length} ${
    //       params.row.courses.length > 1 ? "courses" : "course"
    //     }`;
    //   },
    // },
    {
      field: "course_name",
      headerName: "Course Name",
      flex: 0.5,
      renderCell: (params: any) => {
        return `${params.row.course_name}`;
      },
    },
    {
      field: "score",
      headerName: "Score",
      flex: 0.5,
      renderCell: (params: any) => {
        return `${params.row.score}`;
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      renderCell: (params: any) => {
        return `${params.row.status}`;
      },
    },
    {
      field: "created_at",
      headerName: "Joined At",
      flex: 0.5,
    },
    {
      field: " ",
      headerName: "Email",
      flex: 0.25,
      renderCell: (params: any) => {
        return (
          <>
            <a href={`mailto:${params.row.email}`} className="text-center">
              <AiOutlineMail
                size={20}
                className="dark:text-dark_text text-slate-700"
              />
            </a>
          </>
        );
      },
    },
  ];

  let rows = [];

  if (data) {
    rows = data.users.map((item: any) => ({
      id: `${item._id}`,
      name: `${item.name}`,
      email: item.email,
      role: item.role[0].toUpperCase() + item.role.substring(1),
      courses: item.courses,
      course_name: item.courseName,
      score: item.score?.finalScore || 0,
      status: item.score?.testCourseStatus || "Not Started",
      created_at: formatShortDate(item.createdAt),
    }));
  }

  return (
    <div className="mt-3 w-[90%] mx-auto">
      <div className="flex items-center gap-2 -mb-3">
        <div className="p-1.5 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full">
          <FaChalkboardTeacher size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          LEARNERS
        </h2>
      </div>

      <DataTable rows={rows} columns={columns} isLoading={isLoading} />
    </div>
  );
};

export default CourseUsers; 