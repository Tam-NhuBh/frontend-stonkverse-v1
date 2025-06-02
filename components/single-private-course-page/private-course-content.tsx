"use client";

import { FC, JSX, useState } from "react";
import LoadingSpinner from "../loading-spinner";
import Heading from "../heading";
import CourseContentMedia from "./course-content-media";
import { ICourseData, IFinalTest, ITitleFinalTest } from "@/types";

interface Props {
  id: string;
  courseData: ICourseData[];
  finalTest?: IFinalTest[];
  courseDataLoading: boolean;
  refetch: any;
}

const PrivateCourseContent: FC<Props> = ({
  id,
  courseData,
  finalTest,
  courseDataLoading,
  refetch,
}): JSX.Element => {
  const [activeVideo, setActiveVideo] = useState(0);

  return (
    <>
      {courseDataLoading ? (
        <LoadingSpinner />
      ) : (
        <div>
          <Heading
            title={`${courseData?.[activeVideo]?.title}`}
          />

          <div className="col-span-7">
            <CourseContentMedia
              courseId={id}
              courseData={courseData}
              finalTest={finalTest}

              activeVideo={activeVideo}
              setActiveVideo={setActiveVideo}
              refetch={refetch}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PrivateCourseContent;
