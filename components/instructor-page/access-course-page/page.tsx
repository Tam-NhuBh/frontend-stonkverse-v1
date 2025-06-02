"use client"

import { type FC, JSX, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useParams } from "next/navigation"
import CourseInfomationInstructor from "../create-course-page/course-infomation"
import CourseContentInstructor from "../create-course-page/course-content"
import CoursePreviewInstructor from "../create-course-page/course-preview"
import CourseDataInstructor from "../create-course-page/course-data"
import { getCourseByInstructor } from "@/lib/mutation-data"
import { ICourse, ICourseData, IQuestionQuiz } from "@/types"
import LoadingSpinner from "@/components/loading-spinner"

type Props = {}

export type CourseInfoValues = {
  name: string
  description: string
  price: string
  estimatedPrice: string
  tags: string
  category: string
  level: string
  demoUrl: string
  thumbnail: string
  curriculum: string
}

export const initialCourseInfo = {
  name: "",
  description: "",
  price: "",
  estimatedPrice: "",
  tags: "",
  category: "",
  level: "",
  demoUrl: "",
  thumbnail: "",
  curriculum: "",
}

type CompatibleQuiz = {
  title: string
  correctAnswer: string[]
  mockAnswer: string[]
}

const initialCourseContentData = [
  {
    title: "",
    description: "",
    videoUrl: "",
    videoSection: "Untitled Section",
    videoLength: 0,
    links: [{ title: "", url: "" }],
    suggestion: "",
    quiz: [] as CompatibleQuiz[],
  },
]

export type CourseContentDataType = {
  videoUrl: string
  title: string
  description: string
  videoSection: string
  videoLength: number
  links: {
    title: string
    url: string
  }[]
  suggestion: string
  quiz: CompatibleQuiz[]
}[]

const AccessCourse: FC<Props> = (props): JSX.Element => {
  const id = useParams()?.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ICourse | null>(null)
  const [courseInfo, setCourseInfo] = useState(initialCourseInfo)
  const [benefits, setBenefits] = useState([{ title: "" }])
  const [prerequisites, setPrerequisites] = useState([{ title: "" }])
  const [forWho, setForWho] = useState([{ title: "" }])
  const [courseContentData, setCourseContentData] = useState(initialCourseContentData)
  const [courseData, setCourseData] = useState<any>({})

  const fetchCourseData = async () => {
    setIsLoading(true)
    try {
      const response = await getCourseByInstructor(id)

      if (!response) {
        toast.error("No course data received")
        setIsLoading(false)
        toast.dismiss()
        return
      }

      const courseData = response
      setData(courseData)

      const thumbnailUrl =
        courseData.thumbnail && typeof courseData.thumbnail === "object"
          ? courseData.thumbnail.url
          : courseData.thumbnail || ""

      const curriculumUrl =
        courseData.curriculum && typeof courseData.curriculum === "object"
          ? courseData.curriculum.url
          : courseData.curriculum || ""

      setCourseInfo({
        name: courseData.name || "",
        description: courseData.description || "",
        price: courseData.price?.toString() || "",
        estimatedPrice: courseData.estimatedPrice?.toString() || "",
        tags: courseData.tags || "",
        category: courseData.category || "",
        level: courseData.level || "",
        demoUrl: courseData.demoUrl || "",
        thumbnail: thumbnailUrl,
        curriculum: curriculumUrl,
      })

      if (courseData.benefits && courseData.benefits.length) {
        setBenefits(courseData.benefits)
      }

      if (courseData.prerequisites && courseData.prerequisites.length) {
        setPrerequisites(courseData.prerequisites)
      }

      if (courseData.forWho && courseData.forWho.length) {
        setForWho(courseData.forWho)
      }

      if (courseData.courseData && courseData.courseData.length) {
        const transformedCourseData = courseData.courseData.map((item: ICourseData) => {
          const transformedQuiz =
            item.quiz?.map((quizItem: IQuestionQuiz) => ({
              title: quizItem.title || "",
              correctAnswer: quizItem.correctAnswer || [],
              mockAnswer: quizItem.mockAnswer || [],
            })) || []

          return {
            ...item,
            quiz: transformedQuiz,
          }
        })

        setCourseContentData(transformedCourseData)
      }

      const compiledData = {
        ...courseInfo,
        totalVideos: courseData.courseData?.length || 0,
        benefits: courseData.benefits || [],
        prerequisites: courseData.prerequisites || [],
        forWho: courseData.forWho || [],
        courseData: courseData.courseData || [],
      }

      setCourseData(compiledData)
    } catch (error) {
      toast.error("Failed to load course data")
      console.error("Error fetching course data:", error)
    } finally {
      setIsLoading(false)
      toast.dismiss()
    }
  }

  useEffect(() => {
    if (id) {
      fetchCourseData()
    }
  }, [id])

  useEffect(() => {
    const data = {
      ...courseInfo,
      totalVideos: courseContentData.length,
      benefits,
      prerequisites,
      forWho,
      courseData: courseContentData,
    }
    setCourseData(data)
  }, [courseInfo, courseContentData, benefits, prerequisites, forWho])

  return (
    <div className="flex">
      <div className="w-[100%] pointer-events-none opacity-70 select-none">
        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <LoadingSpinner />
          </div>
        ) : (
          <div>
            {/* Course Information Section */}
            <section>
              <CourseInfomationInstructor
                active={0}
                setActive={() => { }}
                initialCourseInfo={data}
                courseInfo={courseInfo}
                setCourseInfo={setCourseInfo}
                showBottomNav={false}
              />
            </section>

            {/* Course Data Section */}
            <section>
              <CourseDataInstructor
                active={0}
                setActive={() => { }}
                initialBenefits={data?.benefits}
                initialPrerequisites={data?.prerequisites}
                initialForWho={data?.forWho}
                benefits={benefits}
                setBenefits={setBenefits}
                prerequisites={prerequisites}
                setPrerequisites={setPrerequisites}
                forWho={forWho}
                setForWho={setForWho}
                showBottomNav={false}
              />
            </section>

            {/* Course Content Section */}
            <section>
              <CourseContentInstructor
                active={0}
                setActive={() => { }}
                courseContentData={courseContentData}
                setCourseContentData={setCourseContentData}
                submitCourseHandler={() => { }}
                showBottomNav={false}
              />
            </section>

            {/* Course Preview Section */}
            <section>
              <CoursePreviewInstructor
                active={0}
                setActive={() => { }}
                courseData={courseData}
                courseContentData={courseContentData}
                showBottomNav={false}
              />
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccessCourse
