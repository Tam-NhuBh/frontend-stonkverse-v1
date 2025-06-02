"use client"

import { type FC, useState, useEffect, type SetStateAction, type Dispatch, JSX } from "react"
import CoursePlayer from "../course-player"
import CourseQuiz from "../course-quiz"
import CourseLectureList from "./course-lecture-list"
import CourseLectureNavigator from "./course-lecture-navigator"
import { BiSolidChevronsLeft } from "react-icons/bi"
import LectureTabContent from "./lecture-tab-content"
import type { ICourseData, IFinalTest, IQuestionQuiz } from "@/types"
import toast from "react-hot-toast"
import { getAnswersQuiz } from "@/lib/fetch-data"
import { useUpdateLessonCompletionMutation, useGetLessonCompletionQuery } from "@/store/course/course-api"
import { IoMdClose } from "react-icons/io"
import { Bot, Flame } from "lucide-react"
import { BsQuestionCircleFill } from "react-icons/bs"
import AIInstructor from "../ai"
import { useRouter } from "next/navigation"
import FinalTestModal from "../final-test-modal"

interface Props {
  courseId: string
  courseData: ICourseData[]
  finalTest?: IFinalTest[] // Updated to expect an array
  activeVideo: number
  setActiveVideo: Dispatch<SetStateAction<number>>
  refetch: any
}

const CourseContentMedia: FC<Props> = ({ courseId, courseData, finalTest, activeVideo, setActiveVideo, refetch }): JSX.Element => {
  const router = useRouter()
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState<boolean[]>(Array(courseData?.length).fill(false))
  const [openSidebar, setOpenSidebar] = useState(true)
  const [iconHover, setIconHover] = useState(false)
  const [activeContentType, setActiveContentType] = useState("video")
  const [currentVideoHasQuiz, setCurrentVideoHasQuiz] = useState(false)
  const [nextVideoTriggered, setNextVideoTriggered] = useState(false)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [currentQuizId, setCurrentQuizId] = useState<string>("")
  const [completedVideos, setCompletedVideos] = useState<string[]>([])
  const [showAIInstructor, setShowAIInstructor] = useState(false)
  const [updateLessonCompletion] = useUpdateLessonCompletionMutation()
  const { data: lessonCompletionData } = useGetLessonCompletionQuery(courseId)
  const [showFinalTestConfirmation, setShowFinalTestConfirmation] = useState(false)

  const filteredQuestions = (courseData?.[activeVideo]?.quiz ?? [])
    .filter((question: IQuestionQuiz) => question.title !== undefined)
    .map((question: IQuestionQuiz) => ({
      id: question._id.toString(),
      title: question.title as string,
      mockAnswer: question.mockAnswer,
      correctAnswer: question.correctAnswer ?? [],
      maxScore: question.maxScore,
    }))

  const completedCount = courseData?.filter((video, index) => {
    const videoCompleted = completedVideos.includes(video._id.toString())
    const quizCompleted1 = !video.quiz?.length || quizCompleted[index]
    return videoCompleted && quizCompleted1
  }).length || 0

  const totalCount = courseData?.length || 0
  const allContentCompleted = completedCount === totalCount

  const finalTestItem = finalTest && finalTest.length > 0 ? finalTest[0] : null;
  const [finalTestId, setFinalTestId] = useState<string>("")
  const [showFinalTestModal, setShowFinalTestModal] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeVideo])

  // Load completed videos from learningprogress api
  useEffect(() => {
    if (lessonCompletionData?.learningProgress?.progress) {
      setCompletedVideos(lessonCompletionData?.learningProgress?.progress)
    }
  }, [lessonCompletionData])

  // Check current video has quiz
  useEffect(() => {
    setCurrentVideoHasQuiz(courseData?.[activeVideo]?.quiz?.length > 0)
  }, [activeVideo, courseData])

  useEffect(() => {
    const fetchAllQuizCompletionStatuses = async () => {
      if (!courseData || courseData.length === 0) return

      try {
        const newQuizCompletedState = [...quizCompleted]
        let changesMade = false

        for (let i = 0; i < courseData.length; i++) {
          if (courseData[i]?.quiz?.length > 0) {
            const answers = await getAnswersQuiz(courseData[i]._id.toString())
            if (answers && answers.answers && answers.answers[courseData[i]._id.toString()]) {
              newQuizCompletedState[i] = true
              changesMade = true
            }
          }
        }

        if (changesMade) {
          setQuizCompleted(newQuizCompletedState)
        }
      } catch (error) {
        console.error("Error fetching quiz answers:", error)
      }
    }

    fetchAllQuizCompletionStatuses()
  }, [courseData])

 useEffect(() => {
    if (finalTestItem && finalTestItem.id) {
      setFinalTestId((finalTestItem as any)?._id?.toString());
    }
  }, [finalTestItem]);

 const handleFinalTestClick = () => {
    if (allContentCompleted) {
      if (finalTest && Array.isArray(finalTest) && finalTest.length > 0) {
        const testId = (finalTestItem as any)?._id?.toString();
        if (testId) {
          // console.log("Mở modal final test với ID:", testId);
          setFinalTestId(testId);
          setShowFinalTestModal(true);
        } else {
          toast.error("Final test is not available. Please try again later");
        }
      } else {
        toast.error("Final exam is not available. Please try again later.");
      }
    } else {
      toast.error("Please complete all videos and quizzes before taking the final test");
    }
  }

  const handleVideoClick = (videoIndex: number | ((prevIndex: number) => number)) => {
    if (typeof videoIndex === "number") {
      const allPreviousQuizzesCompleted = courseData.slice(0, videoIndex).every((video, index) => {
        return !video.quiz?.length || quizCompleted[index]
      })

      if (allPreviousQuizzesCompleted) {
        setActiveVideo(videoIndex)
      } else {
        toast.error("Please complete the current quiz before moving to another video")
      }
    } else {
      setActiveVideo(videoIndex)
    }
  }

  const handleTakeQuiz = () => {
    const quizId = courseData?.[activeVideo]?.quiz[0]?._id.toString()
    if (quizId) {
      setCurrentQuizId(quizId)
      setShowQuizModal(true)
    }
  }

  const handleRetakeQuiz = () => {
    const quizId = courseData?.[activeVideo]?.quiz[0]?._id.toString()
    if (quizId) {
      setCurrentQuizId(quizId)
      setShowQuizModal(true)
    }
  }

const handleNextVideo = async () => {
  if (currentVideoHasQuiz && !quizCompleted[activeVideo]) {
    const quizId = courseData?.[activeVideo]?.quiz[0]?._id.toString()
    if (quizId) {
      setCurrentQuizId(quizId)
      setShowQuizModal(true)
      setNextVideoTriggered(true)
    }
  } else {
    try {
      await updateLessonCompletion({ courseId, courseDataId: courseData?.[activeVideo]?._id.toString() })
      setCompletedVideos((prev) => {
        if (prev.includes(courseData?.[activeVideo]?._id.toString())) {
          return prev
        }
        return [...prev, courseData?.[activeVideo]?._id.toString()]
      })
      setActiveVideo((prevIndex) => Math.min(prevIndex + 1, courseData?.length - 1))
    } catch (error) {
      toast.error("An error occurred while updating lesson completion")
    }
  }
}

const handleBackVideo = () => {
  if (activeVideo > 0) {
    setActiveVideo((prevIndex) => Math.max(prevIndex - 1, 0))
  }
}

  const handleQuizSubmit = async () => {
    try {
      await updateLessonCompletion({ courseId, courseDataId: courseData?.[activeVideo]?._id.toString() })
      setQuizCompleted((prevCompleted) => {
        const updatedCompleted = [...prevCompleted]
        updatedCompleted[activeVideo] = true
        return updatedCompleted
      })
      setQuizSubmitted(true)
      setCompletedVideos((prev) => {
        if (prev.includes(courseData?.[activeVideo]?._id.toString())) {
          return prev
        }
        return [...prev, courseData?.[activeVideo]?._id.toString()]
      })
      if (nextVideoTriggered) {
        setNextVideoTriggered(false)
      }
    } catch (error) {
      toast.error("An error occurred while updating quiz completion")
    }
  }

  const handleCloseQuizModal = () => {
    setShowQuizModal(false)
    if (nextVideoTriggered) {
      setActiveVideo((prevIndex) => Math.min(prevIndex + 1, courseData.length - 1))
      setNextVideoTriggered(false)
    }
  }

  const toggleAIInstructor = () => {
    setShowAIInstructor((prev) => !prev)
  }

   const handleCloseFinalTestModal = () => {
    setShowFinalTestModal(false);
  }


  return (
    <div className="mt-[1px]">
      <>
        <div className={`${openSidebar ? "w-[75%]" : "w-full"} transition-width max-[1100px]:w-full`}>
          {activeContentType === "video" && (
            <CoursePlayer title={courseData?.[activeVideo]?.title} videoUrl={courseData?.[activeVideo]?.videoUrl} />
          )}
        </div>
        <div className="container">
          <div className={`${openSidebar ? "w-[75%]" : "w-full"} transition-width max-[1100px]:w-full`}>
            <CourseLectureNavigator
              onlyNext={activeVideo === 0}
              onlyPrev={activeVideo === courseData?.length - 1}
              backHandler={handleBackVideo}
              nextHandler={handleNextVideo}
            />

            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold dark:text-dark_text mb-0">{courseData?.[activeVideo]?.title}</h1>
              <div className="flex gap-3">
                {currentVideoHasQuiz && (
                  <>
                    {quizCompleted[activeVideo] ? (
                      <div className="relative group">
                        <button
                          onClick={handleRetakeQuiz}
                          className="relative overflow-hidden px-6 py-2 rounded-sm bg-gradient-to-br from-orange-600 to-yellow-500 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-105"
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                          <span className="relative flex items-center gap-2">
                            <Flame size={20} className="text-yellow-300" strokeWidth={2.5} />
                            <span>Retake Quiz</span>
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="relative group">
                        <button
                          onClick={handleTakeQuiz}
                          className="relative overflow-hidden px-6 py-2 rounded-sm bg-gradient-to-br from-blue-500 to-teal-400 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                          <span className="relative flex items-center gap-2">
                            <BsQuestionCircleFill size={20} />
                            <span>Take Quiz</span>
                          </span>
                        </button>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-teal-400/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      </div>
                    )}
                  </>
                )}

                {/* AI Instructor Button */}
                <button
                  onClick={toggleAIInstructor}
                  className="relative overflow-hidden px-6 py-2 rounded-sm bg-[linear-gradient(90deg,_#4d88c4_2.34%,_#0da5b5_100.78%)] text-white font-medium transition-all duration-300 shadow-lg hover:[#0da5b5] hover:scale-105"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    <Bot size={20} />
                    <span>{showAIInstructor ? "Close AI" : "AI Instructor"}</span>
                  </span>
                </button>
              </div>
            </div>

            {/* AI Instructor Component */}
            {showAIInstructor && (
              <div className="mb-6">
                <AIInstructor courseId={courseId} sessionId={1} />
              </div>
            )}

            <LectureTabContent
              courseId={courseId}
              refetch={refetch}
              courseData={courseData}
              activeVideo={activeVideo}
              setActiveVideo={handleVideoClick}
              setActiveContentType={setActiveContentType}
              quizCompleted={quizCompleted}
              completedVideos={completedVideos}
              setCompletedVideos={setCompletedVideos}
              finalTest={finalTest}
              onFinalTestClick={handleFinalTestClick}
            />
          </div>
        </div>
      </>

      {showQuizModal && currentVideoHasQuiz && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[9998] px-2">
          <div className="relative bg-white dark:bg-slate-900 p-1 rounded-md w-full max-w-2xl">
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl ml-4 text-gray-900 dark:text-gray-200 font-bold">Mini quiz</h3>

              {/* Close Button */}
              <button
                className="text-gray-600 dark:text-gray-500 p-1.5 hover:text-red-600 dark:hover:text-red-600 hover:scale-110 duration-200 transition-transform z-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleCloseQuizModal}
              >
                <IoMdClose size={24} />
              </button>
            </div>

            {/* CourseQuiz Component */}
            <div className="overflow-y-auto max-h-[calc(100vh-4rem)] px-2">
              <CourseQuiz
                courseId={courseId}
                contentId={courseData?.[activeVideo]?._id.toString()}
                questions={filteredQuestions}
                onClose={handleCloseQuizModal}
                onQuizSubmit={handleQuizSubmit}
                quizId={currentQuizId}
              />
            </div>
          </div>
        </div>
      )}

      <FinalTestModal 
        isOpen={showFinalTestModal}
        onClose={handleCloseFinalTestModal}
        courseId={courseId}
        finalTestId={finalTestId}
      />
      
      <div
        className={`w-[25%] fixed top-[62px] right-0 h-full z-50 bg-white dark:bg-slate-900 border-l dark:border-slate-700 transition ${openSidebar ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"} max-[1100px]:hidden`}
      >
        <CourseLectureList
          courseData={courseData}
          setOpenSidebar={setOpenSidebar}
          setIconHover={setIconHover}
          activeVideo={activeVideo}
          setActiveVideo={handleVideoClick}
          setActiveContentType={setActiveContentType}
          quizCompleted={quizCompleted}
          completedVideos={completedVideos}
          courseId={courseId}
          setCompletedVideos={setCompletedVideos}
          finalTest={finalTest}
          onFinalTestClick={handleFinalTestClick}
          isAllContentCompleted={allContentCompleted}
        />
      </div>

      {!openSidebar && (
        <div
          className="fixed right-0 top-[30%] bg-slate-900 z-[60] text-white cursor-pointer py-1.5 rounded-l-full pl-1 pr-2 flex items-center space-x-2 max-[1100px]:hidden"
          onClick={() => setOpenSidebar(true)}
          onMouseEnter={() => setIconHover(true)}
          onMouseLeave={() => setIconHover(false)}
        >
          <BiSolidChevronsLeft size={20} className={`${iconHover && "translate-x-2"} transition`} />
        </div>
      )}
    </div>
  )
}

export default CourseContentMedia