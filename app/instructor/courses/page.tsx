"use client";

import AllCourses from "@/components/instructor-page/courses-page/all-courses";
import InstructorProtectedPage from "@/components/instructor-protected-page";
import { useMount } from "@/hooks/useMount";
import { NextPage } from "next";

interface Props {}

const AllCoursesPage: NextPage<Props> = () => {
  const hasMounted = useMount();

  if (!hasMounted) return null;

  return (
    <InstructorProtectedPage>
      <AllCourses />
    </InstructorProtectedPage>
  );
};

export default AllCoursesPage;
