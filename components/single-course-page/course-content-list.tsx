import { FC, JSX } from "react";
import CourseVideosAccordion from "./course-video-accordion";
import { ICourseData, IFinalTest } from "@/types";

interface Props {
  list: ICourseData[];
  courseLength: number;
  finalTest?: IFinalTest[];

}

const CourseContentList: FC<Props> = ({ list, finalTest, courseLength }): JSX.Element => {
  const rawSections = new Set<string>(list?.map((item) => item.videoSection));

  const uniqueSections: string[] = [...rawSections];

  const videosBySection = uniqueSections.map((section) => ({
    section,
    videos: list.filter((video) => video.videoSection === section),
  }));

  return (
    <div>
      <CourseVideosAccordion
        videosBySection={videosBySection}
        countLectures={list?.length}
        courseLength={courseLength}
        finalTest={finalTest}

      />
    </div>
  );
};

export default CourseContentList;
