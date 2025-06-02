"use client";

import DataTable from "@/components/admin-pages/data-table";
import { formatShortDate } from "@/lib/format-data";
import {
  useGetAllUsersQuery,
} from "@/store/user/user-api";
import { Box, Button, Modal } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { FC, JSX, useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineMail } from "react-icons/ai";

interface Props {}

const AllUsers: FC<Props> = (props): JSX.Element => {
  const { isLoading, data, refetch } = useGetAllUsersQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );

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
    {
      field: "role",
      headerName: "Role",
      flex: 0.5,
    },
    {
      field: "courses",
      headerName: "Purchased",
      flex: 0.5,
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
      id: item._id,
      name: item.name,
      email: item.email,
      role: item.role[0].toUpperCase() + item.role.substring(1),
      courses: `${item.courses.length} ${
        item.courses.length > 1 ? "courses" : "course"
      }`,
      created_at: formatShortDate(item.createdAt),
    }));
  }

  return (
    <div className="mt-8 w-[90%] mx-auto ">
      <DataTable rows={rows} columns={columns} isLoading={isLoading} />;
    {/* XEM LẠI API XEM DANH SÁCH SINH VIEN ĐANG KÝ HỌC KHÓA CỦA MMINHF VÀ BIỂU ĐỒ 
    LEARNING RATES */}
    </div>
  );
};

export default AllUsers;
