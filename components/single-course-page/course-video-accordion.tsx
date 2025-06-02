"use client";

import { FC, JSX, useState } from "react";
import {
  AccordionDetails,
  AccordionSummary,
  AccordionWrapper,
} from "../accordion-materials";
import { formatVideoLength } from "@/lib/format-data";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { ICourseData, IFinalTest } from "@/types";
import { GiTrophy } from "react-icons/gi";

interface IVideosBySection {
  section: string;
  videos: ICourseData[];
}

interface Props {
  videosBySection: IVideosBySection[];
  countLectures: number;
  courseLength: number;
  finalTest?: IFinalTest[];
}

const CourseVideosAccordion: FC<Props> = ({
  videosBySection,
  countLectures,
  courseLength,
  finalTest,


}): JSX.Element => {
  const [expanded, setExpanded] = useState<string | false>("");

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  const hasFinalTest = finalTest && finalTest.length > 0;
  const finalTestItem = hasFinalTest ? finalTest[0] : null;

  const testTitle = finalTestItem?.title || "Final Assessment";


  // const questionsCount = finalTestItem?.tests?.length || 0;

  return (
    <section className="mt-6 mb-14">
      <h2 className="font-bold text-xl mb-3">Course Content</h2>
      <div className="flex items-center gap-2 text-[15px] mb-2">
        <p>
          {videosBySection.length}{" "}
          <span className="text-slate-500">Sections</span>
        </p>
        •
        <p>
          {countLectures} <span className="text-slate-500">Lectures</span>
        </p>
        •
        <p>
          <span className="text-slate-500 max-[389px]:hidden">
            Total length :{" "}
          </span>
          {formatVideoLength(courseLength)}{" "}
        </p>
        {hasFinalTest && (
          <>
            •
            <p>
              <span className="text-[#0da5b5]">1 Final Test</span>
            </p>
          </>
        )}
      </div>
      <div className="custom-shadow">
        {videosBySection.map((section, index) => (
          <AccordionWrapper
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
          >
            <AccordionSummary
              aria-controls={`panel${{ index }}d-content`}
              id={`panel${{ index }}d-header`}
            >
              <div className="relative w-full">
                <div className="flex items-center justify-between max-[400px]:block">
                  <span className="font-semibold text-[17px]">
                    {section.section}
                  </span>
                  <p className="flex items-center gap-1 text-sm">
                    <span>{section.videos.length} Lectures</span>•
                    <span>
                      {formatVideoLength(
                        section.videos.reduce(
                          (acc, cur) => acc + cur.videoLength,
                          0
                        )
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              {section.videos.map((video, videoIndex) => (
                <div
                  key={videoIndex}
                  className="flex items-center justify-between py-2"
                >
                  <span className="flex items-center gap-2">
                    <MdOutlineOndemandVideo className="-mt-[2px] truncate" />
                    {video.title}
                  </span>
                  <span className="text-sm">
                    {formatVideoLength(video.videoLength)}
                  </span>
                </div>
              ))}
            </AccordionDetails>
          </AccordionWrapper>
        ))}

        {/* Final Test Accordion */}
        {hasFinalTest && (
          <AccordionWrapper
            onChange={handleChange("panelFinalTest")}
            className="border-t"
          >
            <AccordionSummary
              aria-controls="panelFinalTestd-content"
              id="panelFinalTestd-header"
              className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20"
            >
              <div className="relative w-full">
                <div className="flex items-center justify-between max-[400px]:block">
                  <div className="flex items-center gap-2">
                    <GiTrophy className="text-lg text-[#0da5b5] -mt-0"/>
                    <span className="font-semibold text-[17px] text-gray-800 dark:text-gray-100">
                      {testTitle}
                    </span>

                  </div>
                </div>
              </div>
            </AccordionSummary>
          </AccordionWrapper>
        )}
      </div>
    </section>
  );
};

export default CourseVideosAccordion;