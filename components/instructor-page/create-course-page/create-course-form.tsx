"use client";

import { FC, JSX, useEffect, useState } from "react";
import { useCreateCourseMutation } from "@/store/course/course-api";
import toast from "react-hot-toast";
import { redirect } from "next/navigation";
import useUserInfo from "@/hooks/useUserInfo";
import CourseDataInstructor from "./course-data";
import CourseContentInstructor from "./course-content";
import CoursePreviewInstructor from "./course-preview";
import CourseOptionsInstructor from "./course-options";
import CourseInfomationInstructor from "./course-infomation";

interface Props { }

export type CourseInfoValues = {
  name: string;
  description: string;
  category: string;
  price: string;
  estimatedPrice: string;
  tags: string;
  level: string;
  demoUrl: string;
  thumbnail: string;
  curriculum: string
};

export const initialCourseInfo = {
  name: "",
  description: "",
  category: "",
  price: "",
  estimatedPrice: "",
  tags: "",
  level: "",
  demoUrl: "",
  thumbnail: "",
  curriculum: ""
};

const initialCourseContentData = [
  {
    videoUrl: "",
    title: "",
    description: "",
    videoSection: "",
    videoLength: 0,
    links: [{ title: "", url: "" }],
    suggestion: "",
    quiz: [{title: "", correctAnswer: [""], mockAnswer: [""]}]
  },
];

export type CourseContentDataTypeInstructor = {
  videoUrl: string;
  title: string;
  description: string;
  videoSection: string;
  videoLength: number;
  links: {
    title: string;
    url: string;
  }[];
  suggestion: string;
  quiz: {
    title: string,
    correctAnswer: string[],
    mockAnswer: string[],
  }[];
}[];

const CreateCourseFormInstructor: FC<Props> = (props): JSX.Element => {
  const [active, setActive] = useState(0);
  const user = useUserInfo();

  const [courseInfo, setCourseInfo] = useState(initialCourseInfo);

  const [benefits, setBenefits] = useState([{ title: "" }]);
  const [prerequisites, setPrerequisites] = useState([{ title: "" }]);
  const [forWho, setForWho] = useState([{ title: "" }]);

  const [courseContentData, setCourseContentData] = useState(
    initialCourseContentData
  );

  const [courseData, setCourseData] = useState({});

  const submitHandler = async () => {
    const data = {
      ...courseInfo,
      totalVideos: courseContentData.length,
      benefits,
      prerequisites,
      forWho,
      courseData: courseContentData,
      createdBy: user._id, 

    };

    setCourseData(data);
  };

  const [createCourse, { isLoading, isSuccess, error }] =
    useCreateCourseMutation();

  const createCourseHandler = async () => {
    const data = courseData;
    if (!isLoading) {
      await createCourse(data);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Created Course Successfully!");
      redirect("/instructor/courses");
    }

    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  }, [isLoading, isSuccess, error]);

  return (
    <div className="flex">
      <div className="w-[80%]">
        {active === 0 && (
          <CourseInfomationInstructor
            active={active}
            setActive={setActive}
            courseInfo={courseInfo}
            setCourseInfo={setCourseInfo}
          />
        )}

        {/* {active === 1 && (
          <CourseCurriculumn
            active={active}
            setActive={setActive}
            courseInfo={courseInfo}
            setCourseInfo={setCourseInfo}
          />
        )} */}
        
        {active === 1 && (
          <CourseDataInstructor
            active={active}
            setActive={setActive}
            benefits={benefits}
            setBenefits={setBenefits}
            prerequisites={prerequisites}
            setPrerequisites={setPrerequisites}
            forWho={forWho}
            setForWho={setForWho}
          />
        )}

        {active === 2 && (
          <CourseContentInstructor
            active={active}
            setActive={setActive}
            courseContentData={courseContentData}
            setCourseContentData={setCourseContentData}
            submitCourseHandler={submitHandler}
          />
        )}

        {active === 3 && (
          <CoursePreviewInstructor
            active={active}
            setActive={setActive}
            courseData={courseData}
            courseContentData={courseContentData}
            createCourseHandler={createCourseHandler}
          />
        )}
      </div>
      <div className="flex-1 fixed z-[-1] top-[80px] right-8">
        <CourseOptionsInstructor active={active} setActive={setActive} />
      </div>
    </div>
  );
};

export default CreateCourseFormInstructor;
