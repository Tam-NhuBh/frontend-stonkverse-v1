"use client";

import AllUsers from "@/components/admin-pages/users-page/all-users";
import CourseUsers from "@/components/admin-pages/users-page/course-user";

import ProtectedPage from "@/components/protected-page";
import { useMount } from "@/hooks/useMount";
import { NextPage } from "next";

interface Props { }

const UsersPage: NextPage<Props> = () => {
  const hasMounted = useMount();

  if (!hasMounted) return null;

  return (
    <ProtectedPage>

      <div className="space-y-8">
        <div>
          <AllUsers />
        </div>
        <div>
          <CourseUsers />
        </div>
      </div>
    </ProtectedPage>
  );
};

export default UsersPage;
