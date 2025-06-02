"use client";

import { formatShortDate } from "@/lib/format-data";
import { useGetAllUsersQuery, useUpdateUserRoleMutation, useDeleteUserMutation } from "@/store/user/user-api";
import { Box, Button, Modal } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { FC, JSX, useEffect, useState } from "react";
import {
  AiOutlineDelete,
  AiOutlineMail,
  AiOutlinePlusCircle,
} from "react-icons/ai";
import DataTable from "../data-table";
import BtnWithIcon from "@/components/btn-with-icon";
import FormSelect from "@/components/form-select";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import BtnWithLoading from "@/components/btn-with-loading";
import toast from "react-hot-toast";
import { getAllEmail } from "@/lib/fetch-data";

interface Props { }

const schema: any = Yup.object({
  email: Yup.string()
    .email("Your email is invalid")
    .required("Please enter your email"),
  role: Yup.string().required("Please choose role for user"),
});

interface FormValues {
  email: string;
  role: string;
}

const roles = ["ADMIN", "INSTRUCTOR", "USER"];

const AllAdmins: FC<Props> = (props): JSX.Element => {
  const { isLoading, data, refetch } = useGetAllUsersQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );

  const [emails, setEmails] = useState<string[]>([]);
  const [active, setActive] = useState(false);
  const [deleteUser] = useDeleteUserMutation();

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const listEmail = await getAllEmail();
        setEmails(listEmail ?? []);
      }
      catch (error: any) {
        console.error("Failed to fetch emails:", error);
      }
    };
    fetchEmail();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully!");
      refetch();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("An error occurred while deleting user. Please try again later.");
    }
  };

  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      role: "",
    },
    resolver: yupResolver(schema),
  });

  const [
    updateUserRole,
    { isLoading: updateUserRoleLoading, isSuccess, error: updateUserError },
  ] = useUpdateUserRoleMutation();

  const { register, handleSubmit, formState } = form;

  const { errors } = formState;

  const onSubmit = async (data: FormValues) => {
    updateUserRole(data);
  };

  let rows = [];

  if (data) {
    rows = data.users
      .map((admin: any, index: number) => ({
        stt: index + 1,
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role[0].toUpperCase() + admin.role.substring(1),
        courses: `${admin.courses.length} ${admin.courses.length > 1 ? "courses" : "course"
          }`,
        created_at: formatShortDate(admin.createdAt),
      }));
  }

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success("Update user role successfully!");
      setActive(false);
    }

    if (updateUserError) {
      if ("data" in updateUserError) {
        const errorData = updateUserError as any;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, updateUserError]);

  // Define columns
  const columns: GridColDef[] = [
    { field: "stt", headerName: "Index", flex: 0.2 },
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 0.5 },
    { field: "role", headerName: "Role", flex: 0.5 },
    { field: "created_at", headerName: "Joined At", flex: 0.5 },
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
    {
      field: "  ",
      headerName: "Delete",
      flex: 0.25,
      renderCell: (params: any) => {
        return (
          <>
            <Button onClick={() => handleDeleteUser(params.row.id)}>
              <AiOutlineDelete
                size={20}
                className="dark:text-dark_text text-slate-700 mr-4"
              />
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <>
      <div className="mt-8 w-[90%] mx-auto">
        <BtnWithIcon
          content="Assign permissions to users"
          icon={AiOutlinePlusCircle}
          iconSize={20}
          customClasses="!bg-[#475569] dark:!bg-[#3e4396] ml-auto"
          onClick={() => setActive(!active)}
        />
        <div className="w-full overflow-x-auto overflow-y-auto">
          <DataTable rows={rows} columns={columns} isLoading={isLoading} />
        </div>
      </div>

      {active && (
        <Modal
          open={active}
          onClose={() => setActive(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box className="modal-content-wrapper">
            <h4 className="form-title">Assign permissions to users</h4>
            <div className="mt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="pb-6">
                <FormSelect
                  id="email"
                  label="Email"
                  register={register("email")}
                  errorMsg={errors.email?.message}
                  options={emails}
                />
                <FormSelect
                  options={roles}
                  id="role"
                  label="Role"
                  register={register("role")}
                  errorMsg={errors.role?.message}
                />

                <BtnWithLoading
                  content="CONFIRM"
                  isLoading={updateUserRoleLoading}
                  type="submit"
                />
              </form>
            </div>
          </Box>
        </Modal>
      )}
    </>
  );
};

export default AllAdmins;

