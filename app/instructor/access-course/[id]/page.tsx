"use client";

import AccessCourse from "@/components/instructor-page/access-course-page/page";
import InstructorProtectedPage from "@/components/instructor-protected-page";
import { useMount } from "@/hooks/useMount";
import { NextPage } from "next";

interface Props {}

const EditCoursePage: NextPage<Props> = () => {
  const hasMounted = useMount();

  if (!hasMounted) return null;

  return (
    <InstructorProtectedPage>
      <AccessCourse />
    </InstructorProtectedPage>
  );
};

export default EditCoursePage;
