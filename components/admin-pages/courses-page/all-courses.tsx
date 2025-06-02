"use client";

import { formatShortDate } from "@/lib/format-data";
import {
  useDeleteCourseMutation,
  useGetAllCoursesAdminQuery,
} from "@/store/course/course-api";
import { Box, Button, Modal } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { FC, JSX, useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import DataTable from "../data-table";
import BtnWithIcon from "@/components/btn-with-icon";
import BtnWithLoading from "@/components/btn-with-loading";
import toast from "react-hot-toast";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";

interface Props { }

const AllCourses: FC<Props> = (props): JSX.Element => {
  const { isLoading, data, refetch } = useGetAllCoursesAdminQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState("");

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "title",
      headerName: "Course Title",
      flex: 1,
    },
    {
      field: "ratings",
      headerName: "Ratings",
      flex: 0.5,
    },
    {
      field: "purchased",
      headerName: "Purchased",
      flex: 0.5,
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 0.5,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.6,
      renderCell: (params: any) => {
        const status = params.row.status;
        let label = "";
        let colorClass = "";
    
        if (status === "APPROVED") {
          label = "Approved";
          colorClass = "bg-green-100 text-green-800";
        } else if (status === "PENDING_REVIEW") {
          label = "Pending Review";
          colorClass = "bg-yellow-100 text-yellow-800";
        } else if (status === "REJECTED") {
          label = "Rejected";
          colorClass = "bg-red-100 text-red-800";
        } else {
          label = "Unknown";
          colorClass = "bg-gray-100 text-gray-800";
        }
    
        return (
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${colorClass}`}
          >
            {label}
          </span>
        );
      },
    },      
    {
      field: "",
      headerName: "Edit",
      flex: 0.2,
      renderCell: (params: any) => {
        return (
          <div className="flex items-center justify-center w-full">
            <Link href={`/admin/edit-course/${params.row.id}`}>
              <FaEdit
                size={18}
                style={{ cursor: "pointer" }}
                className="text-[#475569] dark:text-[#3E4396]" />
            </Link>
          </div>
        );
      },
    },
    {
      field: " ",
      headerName: "Delete",
      flex: 0.2,
      renderCell: (params: any) => {
        return (
          <div className="flex items-center justify-center w-full">
            <Button
              onClick={() => {
                setDeleteModal(true);
                setCurrentCourseId(params.row.id);
              }}
            >
              <AiFillDelete
                size={20}
                style={{ cursor: "pointer" }}
                className="text-[#475569] dark:text-[#3E4396]"
              />
            </Button>
          </div>
        );
      },
    }
  ];

  let rows = [];

  if (data) {
    rows = data.courses.map((item: any) => ({
      id: item._id,
      title: item.name,
      ratings: item.ratings,
      purchased: item.purchased,
      created_at: formatShortDate(item.createdAt),
      status: item.status,

    }));
  }

  const [
    deleteCourse,
    { isLoading: deleteCourseLoading, isSuccess, error: deleteCourseError },
  ] = useDeleteCourseMutation();

  const deleteCourseHandler = async () => {
    await deleteCourse(currentCourseId);
  };

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success("Delete course successfully!");
      setDeleteModal(false);
    }

    if (deleteCourseError) {
      if ("data" in deleteCourseError) {
        const errorData = deleteCourseError as any;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, deleteCourseError]);

  return (
    <div className="mt-3 w-[90%] mx-auto">
      <div className="w-full overflow-x-auto overflow-y-auto">
        <DataTable rows={rows} columns={columns} isLoading={isLoading} />
      </div>
      {deleteModal && (
        <Modal
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box className="modal-content-wrapper">
            <h4 className="form-title">Are you sure to delete this course?</h4>
            <div className="mt-4 w-[70%] flex justify-between mx-auto pb-4">
              <BtnWithIcon
                content="Cancel"
                onClick={() => setDeleteModal(false)}
              />
              <BtnWithLoading
                content="Confirm"
                isLoading={deleteCourseLoading}
                customClasses="!bg-red-700 !w-fit"
                type="button"
                onClick={deleteCourseHandler}
              />
            </div>
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default AllCourses;
