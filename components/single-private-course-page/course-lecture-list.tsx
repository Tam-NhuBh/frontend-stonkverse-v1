"use client"

import { type FC, type Dispatch, type SetStateAction, useEffect, useState, JSX } from "react"
import { AccordionWrapper } from "../accordion-materials"
import { AccordionDetails, AccordionSummary } from "@mui/material"
import { formatVideoLength } from "@/lib/format-data"
import { MdOutlineOndemandVideo, MdQuiz, MdCheckCircle } from "react-icons/md"
import { BiSolidChevronDown } from "react-icons/bi"
import { IoClose } from "react-icons/io5"
import type { ICourseData, IFinalTest, ITitleFinalTest } from "@/types"
import toast from "react-hot-toast"
import { GiTrophy } from "react-icons/gi"
import { FaArrowRight, FaUnlock } from "react-icons/fa"
import { useRouter } from "next/navigation"

interface Props {
  courseId: string
  courseData: ICourseData[]
  finalTest?: IFinalTest[]
  setOpenSidebar?: Dispatch<SetStateAction<boolean>>
  setIconHover?: Dispatch<SetStateAction<boolean>>
  activeVideo: number
  setActiveVideo: Dispatch<SetStateAction<number>>
  setActiveContentType: Dispatch<SetStateAction<string>>
  quizCompleted: boolean[]
  completedVideos: string[]
  setCompletedVideos: Dispatch<SetStateAction<string[]>>
  onFinalTestClick?: () => void
  isAllContentCompleted?: boolean
}

const CourseLectureList: FC<Props> = ({
  courseId,
  courseData,
  finalTest,
  setOpenSidebar,
  setIconHover,
  activeVideo,
  setActiveVideo,
  setActiveContentType,
  quizCompleted,
  completedVideos,
  setCompletedVideos,
  onFinalTestClick,
  isAllContentCompleted,
}): JSX.Element => {
  const router = useRouter()
  
  const completedCount = courseData?.filter((video, index) => {
    const videoCompleted = completedVideos.includes(video._id.toString())
    const quizCompleted1 = !video.quiz?.length || quizCompleted[index]
    return videoCompleted && quizCompleted1
  }).length || 0
  
  const totalCount = courseData?.length || 0
  
  const calculatedAllContentCompleted = isAllContentCompleted !== undefined 
    ? isAllContentCompleted 
    : completedCount === totalCount

  const rawSections = new Set<string>(courseData?.map((item) => item.videoSection))

  const hasOrderCourseData = courseData?.map((course, index) => ({
    ...course,
    order: index,
  }))

  const uniqueSections: string[] = [...rawSections]

  const videosBySection = uniqueSections?.map((section) => ({
    section,
    videos: hasOrderCourseData.filter((video) => video.videoSection === section),
  }))

  const handleVideoClick = (videoIndex: number) => {
    const allPreviousQuizzesCompleted = courseData.slice(0, videoIndex).every((video, index) => {
      return !video.quiz?.length || quizCompleted[index]
    })

    if (allPreviousQuizzesCompleted) {
      setActiveVideo(videoIndex)
      setActiveContentType("video")
    } else {
      toast.error("Please complete the current quiz before moving to another video")
    }
  }

  const handleFinalTestClick = () => {
    if (calculatedAllContentCompleted) {
      if (onFinalTestClick) {
        onFinalTestClick()
      } else {
        router.push(`/final-test/${courseId}`)
      }
    } else {
      toast.error("Please complete all videos and quizzes before taking the final test")
    }
  }
  const hasFinalTest = finalTest && finalTest.length > 0;
  const finalTestItem = hasFinalTest ? finalTest[0] : null;

  const testTitle = finalTestItem?.title || "Final Assessment";

  return (
    <div className="overflow-y-scroll max-h-[calc(100%-62px)] no-scrollbar">
      <div className="flex items-center justify-between max-[1100px]:hidden">
        <h2 className="font-bold text-xl p-4 pb-2">Course Content</h2>
        <IoClose
          size={25}
          className="cursor-pointer mr-[13px] mt-1"
          onClick={() => {
            setOpenSidebar && setOpenSidebar(false)
            setIconHover && setIconHover(false)
          }}
        />
      </div>
      <div className="lecture-list-accordion">
        {videosBySection.map((section, index) => (
          <AccordionWrapper key={index} defaultExpanded={true}>
            <AccordionSummary
              expandIcon={<BiSolidChevronDown className="mt-1 dark:text-white" />}
            >
              <div className="relative w-full h-full">
                <div className="flex items-start justify-between">
                  <span className="font-semibold">
                    Section {index + 1} : {section.section}
                  </span>
                </div>
                <span className="text-xs text-tertiary dark:text-dark_text">
                  {section.videos.length} Lectures | {formatVideoLength(
                    section.videos.reduce((acc, cur) => acc + cur.videoLength, 0)
                  )}
                </span>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              {section.videos.map((video, videoIndex: number) => (
                <div key={videoIndex}>
                  <div
                    className={`cursor-pointer py-2 px-4 hover:bg-slate-200 dark:hover:bg-slate-900 transition flex items-center justify-between gap-2 ${
                      video.order === activeVideo
                        ? "bg-slate-200 dark:bg-slate-900"
                        : "bg-white dark:bg-slate-600"
                    }`}
                    onClick={() => handleVideoClick(video.order)}
                  >
                    <div>
                      <p className="flex items-center">
                        <span className="font-semibold">{video?.title}</span>
                      </p>
                      <span className="text-xs flex items-center gap-1 mt-2">
                        {completedVideos?.includes(video._id.toString()) ? (
                          <MdCheckCircle className="mt-[1px] text-green-500" />
                        ) : (
                          <MdOutlineOndemandVideo className="mt-[1px]" />
                        )}
                        {formatVideoLength(video.videoLength)}
                      </span>
                    </div>
                    {video.quiz && video.quiz.length > 0 && (
                        <div className="flex items-center gap-1">
                        <MdQuiz
                          className={`${quizCompleted[video.order] ? "text-green-500" : "text-blue-500"}`}
                        />
                        <span
                          className={`text-xs ${quizCompleted[video.order] ? "text-green-500" : "text-blue-500"}`}
                        >
                          {video.quiz.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </AccordionDetails>
          </AccordionWrapper>
        ))}

        {hasFinalTest && (
          <div className="border overflow-hidden">
            <div
              className={`py-3 px-4 bg-gradient-to-r ${
                calculatedAllContentCompleted
                  ? "from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 cursor-pointer hover:from-cyan-100 hover:to-teal-100 dark:hover:from-cyan-900/30 dark:hover:to-teal-900/30"
                  : "from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 cursor-not-allowed"
              } transition-all duration-300`}
              onClick={
                calculatedAllContentCompleted
                  ? handleFinalTestClick
                  : () => toast.error("Please complete all videos and quizzes before taking the final test")
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 -ml-1">
                  <GiTrophy
                    className={`text-lg ${
                      calculatedAllContentCompleted
                        ? "text-[#0da5b5]"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      calculatedAllContentCompleted
                        ? "text-gray-800 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {testTitle}
                  </span>
                </div>
                <div className="ml-auto">
                  <div className="flex justify-between items-center gap-1">
                    {calculatedAllContentCompleted ? (
                      <>
                        <span className="text-xs bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 py-1 px-2 rounded-full flex items-center gap-1">
                          <MdCheckCircle className="text-green-500" size={12} />
                          Ready
                        </span>
                        <FaArrowRight className="text-[#0da5b5] mr-1 animate-pulse cursor-pointer" />
                      </>
                    ) : (
                      <>
                        <span className="text-xs bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 py-1 px-2 rounded-full">
                          Unlock ({completedCount}/{totalCount})
                        </span>
                        <FaUnlock className="text-gray-500 dark:text-gray-400 mr-1" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseLectureList