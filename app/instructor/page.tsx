"use client";

import Heading from "@/components/heading";
import { NextPage } from "next";
import { useMount } from "@/hooks/useMount";
import InstructorProtectedPage from "@/components/instructor-protected-page";
import DashboardComp from "@/components/instructor-page/dashboard-page/dashboard-comp";
import CourseUsers from "@/components/instructor-page/users-page/course-users";

interface Props {}

const InstructorPage: NextPage<Props> = () => {
  const hasMounted = useMount();

  if (!hasMounted) return null;

  return (
    <InstructorProtectedPage>
      <Heading
        title="Instructor Dashboard"
      />

      <DashboardComp isDashboard />
    </InstructorProtectedPage>
  );
};

export default InstructorPage;
