"use client";

import CourseUsers from "@/components/instructor-page/users-page/course-users";
import InstructorProtectedPage from "@/components/instructor-protected-page";
import { useMount } from "@/hooks/useMount";
import { NextPage } from "next";

interface Props {}

const CourseUsersPage: NextPage<Props> = () => {
  const hasMounted = useMount();

  if (!hasMounted) return null;

  return (
    <InstructorProtectedPage>
      <CourseUsers />
    </InstructorProtectedPage>
  );
};

export default CourseUsersPage; 