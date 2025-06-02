"use client";

import Heading from "@/components/heading";
import CreateCourseForm from "@/components/instructor-page/create-course-page/create-course-form";
import InstructorProtectedPage from "@/components/instructor-protected-page";
import { useMount } from "@/hooks/useMount";
import { NextPage } from "next";

interface Props {}

const CreateCoursePage: NextPage<Props> = () => {
  const hasMounted = useMount();

  if (!hasMounted) return null;

  return (
    <InstructorProtectedPage>
      <Heading
        title="Create Courses"
     />
      <CreateCourseForm />
    </InstructorProtectedPage>
  );
};

export default CreateCoursePage;
