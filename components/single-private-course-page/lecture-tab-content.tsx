"use client";
import { useMediaQuery } from "@mui/material";
import { Dispatch, FC, JSX, SetStateAction, useEffect, useState } from "react";
import { HiExternalLink } from "react-icons/hi";
import QuestionAndAnswer from "./question-and-answer";
import CourseReviews from "./course-reviews";
import { ICourseData, IFinalTest, ILink, IQuestion, ITitleFinalTest } from "@/types";
import CourseLectureList from "./course-lecture-list";
import { getAnswersQuiz } from "@/lib/fetch-data";
import toast from "react-hot-toast";

interface Props {
  courseData: ICourseData[];
  courseId: string;
  refetch: any;
  activeVideo: number;
  setActiveVideo: Dispatch<SetStateAction<number>>;
  setActiveContentType: Dispatch<SetStateAction<string>>;
  quizCompleted: boolean[];
  finalTest?: IFinalTest[];
  onFinalTestClick?: () => void;
  completedVideos: string[];
  setCompletedVideos: Dispatch<SetStateAction<string[]>>;
}

const panelItemClasses =
  "grid place-items-center py-3 cursor-pointer font-semibold text-slate-500 dark:text-dark_text";

const activePanelItemClasses =
  "border-b-[2px] border-secondary text-gradient !font-bold";

const LectureTabContent: FC<Props> = ({
  courseId,
  refetch,
  courseData,
  activeVideo,
  finalTest,
  onFinalTestClick,
  setActiveVideo,
  setActiveContentType,
  quizCompleted,
  completedVideos,
  setCompletedVideos,
}): JSX.Element => {
  const [active, setActive] = useState(0);
  const notComputer = useMediaQuery("(max-width:1100px)");

  const description = courseData?.[activeVideo]?.description;
  const resources = courseData?.[activeVideo]?.links;
  const questions = courseData?.[activeVideo]?.questions;
  const contentId = courseData?.[activeVideo]?._id.toString();
  const activeTitle = courseData?.[activeVideo]?.title;

  const completedCount = courseData?.filter((video, index) => {
    const videoCompleted = completedVideos.includes(video._id.toString())
    const quizCompleted1 = !video.quiz?.length || quizCompleted[index]
    return videoCompleted && quizCompleted1
  }).length || 0
  
  const totalCount = courseData?.length || 0
  const isAllContentCompleted = completedCount === totalCount

  return (
    <>
      <div className="bg-[#fbfafa] dark:bg-slate-800 grid grid-cols-4 max-[1100px]:grid-cols-5 custom-shadow w-full">
        {notComputer && (
          <div
            className={`${panelItemClasses} ${active === -1 && activePanelItemClasses
              }`}
            onClick={() => setActive(-1)}
          >
            Course Content
          </div>
        )}

        <div
          className={`${panelItemClasses} ${active === 0 && activePanelItemClasses
            }`}
          onClick={() => setActive(0)}
        >
          Overview
        </div>
        <div
          className={`${panelItemClasses} ${active === 1 && activePanelItemClasses
            }`}
          onClick={() => setActive(1)}
        >
          Resources
        </div>
        <div
          className={`${panelItemClasses} ${active === 2 && activePanelItemClasses
            }`}
          onClick={() => setActive(2)}
        >
          Q&A
        </div>

        <div
          className={`${panelItemClasses} ${active === 3 && activePanelItemClasses
            }`}
          onClick={() => setActive(3)}
        >
          Reviews
        </div>
      </div>

      <div className="py-6 text-slate-500 dark:text-dark_text">
        {notComputer && active === -1 && (
          <CourseLectureList
            courseData={courseData}
            activeVideo={activeVideo}
            setActiveVideo={setActiveVideo}
            setActiveContentType={setActiveContentType}
            quizCompleted={quizCompleted}
            completedVideos={completedVideos}
            courseId={courseId}
            setCompletedVideos={setCompletedVideos}
            finalTest={finalTest}
            onFinalTestClick={onFinalTestClick}
            isAllContentCompleted={isAllContentCompleted}
          />
        )}

        {active === 0 && <div>{description}</div>}

        {active === 1 && (
          <ul className="!list-disc ml-4 space-y-2">
            {resources?.map((resource, index) => (
              <li key={index}>
                {resource.title} :
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold flex py-2 text-gradient"
                >
                  {resource.url}
                  <HiExternalLink
                    size={10}
                    className="ml-[2px] -mt-[2px] text-secondary"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}

        {active === 2 && (
          <QuestionAndAnswer
            questions={questions}
            courseId={courseId}
            contentId={contentId}
            refetch={refetch}
            activeTitle={activeTitle}
          />
        )}
        {active === 3 && <CourseReviews courseId={courseId} />}
      </div>
    </>
  );
};

export default LectureTabContent;