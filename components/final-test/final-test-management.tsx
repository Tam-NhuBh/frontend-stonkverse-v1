"use client"

import { type FC, useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Modal, Box } from "@mui/material"
import { useGetAllCoursesQuery } from "@/store/course/course-api"
import BtnWithIcon from "@/components/btn-with-icon"
import CreateFinalTest from "./create-final-test"
import FinalTestCard from "../final-test-card"
import Selector from "../layout/selector"
import SearchBox from "../layout/search-box"
import { getFinalTests, getFinalTestsByID } from "@/lib/fetch-data"
import { deleteFinalTest } from "@/lib/mutation-data"
import { AiOutlineClose } from "react-icons/ai"
import type { ITitleFinalTest, QuestionType, TestSettings, IFinalTest, IAnswerFinalTest } from "@/types"

interface ICourse {
  _id: string
  name: string
}

interface ITestCard {
  id: string
  title: string
  description: string
  testDuration: {
    hours: number
    minutes: number
  }
  withSections: boolean
  createdAt: string
  numberOfQuestions: number
}

const FinalTestManagement: FC = () => {
  const {
    isLoading: isCoursesLoading,
    data: coursesData,
    refetch: refetchCourses,
  } = useGetAllCoursesQuery({}, { refetchOnMountOrArgChange: true })
  const [createTestModal, setCreateTestModal] = useState(false)
  const [editTestModal, setEditTestModal] = useState(false)
  const [deleteTestModal, setDeleteTestModal] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [selectedTestId, setSelectedTestId] = useState("")
  const [testsData, setTestsData] = useState<ITestCard[]>([])
  const [isLoadingTests, setIsLoadingTests] = useState(false)
  const [isDeletingTest, setIsDeletingTest] = useState(false)
  const [isEditTest, setIsEditTest] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingTest, setEditingTest] = useState<IFinalTest | null>(null)

  const fetchTests = async (courseID: string) => {
    if (!courseID) return
    setIsLoadingTests(true)
    try {
      const result = await getFinalTests(courseID)
      const mappedTests = (result.finalTests || []).map((test: any) => ({
        id: test._id,
        title: test.title,
        description: test.description || "",
        testDuration: test.settings?.testDuration
          ? test.settings.testDuration
          : {
            hours: 0,
            minutes: 0,
          },
        withSections: false,
        createdAt: test.createdAt,
        numberOfQuestions: test.settings?.numberOfQuestions || 0,
      }))

      setTestsData(mappedTests)
    } catch (error) {
      toast.error("Failed to fetch final tests")
      setTestsData([])
    } finally {
      setIsLoadingTests(false)
    }
  }

  useEffect(() => {
    if (coursesData?.courses?.length > 0) {
      if (!selectedCourseId) {
        setSelectedCourseId(coursesData.courses[0]._id)
      } else if (!coursesData.courses.some((course: ICourse) => course._id === selectedCourseId)) {
        setSelectedCourseId(coursesData.courses[0]._id)
      }
    }
  }, [coursesData])

  useEffect(() => {
    if (selectedCourseId) {
      fetchTests(selectedCourseId)
    }
  }, [selectedCourseId])

  const handleCreateTest = () => {
    if (!selectedCourseId) {
      toast.error("Please select a course first")
      return
    }
    setCreateTestModal(true)
  }

  const handleEditTest = async (testId: string) => {
    try {
      setIsEditTest(true)
      setSelectedTestId(testId)

      const response = await getFinalTestsByID(testId)

      const testData = response.data || response

      if (!testData) {
        throw new Error("Test data not found")
      }

      // console.log("Extracted test data:", testData)

      const finalTest: IFinalTest = {
        id: testData._id,
        title: testData.title,
        description: testData.description || "",
        tests: (testData.tests || []).map((test: any) => ({
          id: test._id,
          title: test.title,
          description: test.description || "",
          answers: test.answers || [],
          correctAnswer: test.correctAnswer || [],
          mockAnswer: test.mockAnswer || [],
          maxScore: test.maxScore || 10,
          type: test.type as QuestionType,
          imageUrl: test.imageUrl || "",
          createdAt: test.createdAt ? new Date(test.createdAt) : undefined,
        })),
        score: testData.score || 0,
        createdAt: testData.createdAt ? new Date(testData.createdAt) : undefined,
        settings: {
          course: selectedCourseId,
          testDuration: testData.settings?.testDuration
            ? testData.settings.testDuration 
            : { hours: 1, minutes: 0 },
          numberOfQuestions: testData.settings?.numberOfQuestions || 10,
          pageLayout: "all",
          gradingDisplay: "score",
          instructionsMessage: testData.settings?.instructionsMessage || "",
          completionMessage: testData.settings?.completionMessage || "",
        }
      }

      // console.log("Final processed data:", finalTest)
      setEditingTest(finalTest)
      setEditTestModal(true)
    } catch (err) {
      console.error("Error in handleEditTest:", err)
      toast.error("Failed to load test data")
    } finally {
      setIsEditTest(false)
    }
  }
  const handleDeleteTestConfirm = async () => {
    if (!selectedTestId) return

    setIsDeletingTest(true)
    try {
      await deleteFinalTest(selectedTestId)
      toast.success("Final test deleted successfully!")
      setDeleteTestModal(false)

      if (selectedCourseId) {
        fetchTests(selectedCourseId)
      }
    } catch (error) {
      toast.error("Failed to delete final test")
    } finally {
      setIsDeletingTest(false)
    }
  }

  // Mở modal xác nhận xóa
  const handleDeleteTest = (testId: string) => {
    setSelectedTestId(testId)
    setDeleteTestModal(true)
  }

  // Lấy tên course đã chọn
  const getSelectedCourseName = () => {
    if (!selectedCourseId || !coursesData?.courses) return "Select a course"
    const course = coursesData.courses.find((c: ICourse) => c._id === selectedCourseId)
    return course ? course.name : "Select a course"
  }

  // Lọc danh sách tests theo từ khóa tìm kiếm
  const filteredTests = testsData.filter(
    (test) =>
      test.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="mt-8 w-full max-w-[1400px] px-4 mx-auto">
      {/* Header với chọn khóa học và tìm kiếm */}
      <div className="mb-6 bg-[#475569] dark:bg-[#3E4396] rounded-sm border dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {/* Course Component */}
          {coursesData?.courses && (
            <div className="w-full md:w-1/2">
              <Selector
                courses={coursesData.courses}
                selectedCourseId={selectedCourseId}
                onCourseChange={setSelectedCourseId}
                isLoading={isCoursesLoading}
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-1/2">
            <div className="flex-grow">
              <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Search final tests..." />
            </div>

            <div className="flex-shrink-0">
              <BtnWithIcon content="Create" onClick={handleCreateTest} customClasses="w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Final Test Cards */}
      {isLoadingTests ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="rounded-sm dark:border-none dark:bg-slate-500 bg-[#F5F5F5] dark:bg-opacity-20 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-500 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-tertiary dark:text-dark_text">No final tests found</h3>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredTests.map((test) => (
            <FinalTestCard
              key={test.id}
              id={test.id}
              name={test.title}
              description={test.description}
              testDuration={test.testDuration}
              withSections={test.withSections}
              createdAt={test.createdAt}
              numberOfQuestions={test.numberOfQuestions}
              onEdit={handleEditTest}
              onDelete={handleDeleteTest}
            />
          ))}
        </div>
      )}

      {/* Create Test Modal */}
      <Modal
        open={createTestModal}
        onClose={() => setCreateTestModal(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          className="modal-content-wrapper bg-[#F5F5F5] dark:bg-slate-900 rounded-sm shadow-xl"
          sx={{
            maxWidth: 1200,
            width: "95%",
            maxHeight: "95vh",
            overflowY: "auto",
          }}
        >
          <div className="p-2">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Create Final Test for: {getSelectedCourseName()}
              </h4>
              <button
                onClick={() => setCreateTestModal(false)}
                className="text-gray-500 hover:text-red-600 hover:scale-110 transition-transform duration-200"
              >
                <AiOutlineClose />
              </button>
            </div>

            <CreateFinalTest
              courseId={selectedCourseId}
              onClose={() => {
                setCreateTestModal(false)
              }}
              onSuccess={() => fetchTests(selectedCourseId)}
              initialData={null}
            />
          </div>
        </Box>
      </Modal>

      {/* Edit Test Modal */}
      <Modal
        open={editTestModal}
        onClose={() => {
          setEditTestModal(false)
          setEditingTest(null)
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          className="modal-content-wrapper bg-[#F5F5F5] dark:bg-slate-900 rounded-sm shadow-xl"
          sx={{
            maxWidth: 1200,
            width: "95%",
            maxHeight: "95vh",
            overflowY: "auto",
          }}
        >
          <div className="p-2">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Edit Final Test: {editingTest?.title}
              </h4>
              <button
                onClick={() => {
                  setEditTestModal(false)
                  setEditingTest(null)
                }}
                className="text-gray-500 hover:text-red-600 hover:scale-110 transition-transform duration-200"
              >
                <AiOutlineClose />
              </button>
            </div>

            {isEditTest ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <CreateFinalTest
                courseId={selectedCourseId}
                onClose={() => {
                  setEditTestModal(false)
                  setEditingTest(null)
                }}
                onSuccess={() => fetchTests(selectedCourseId)}
                initialData={editingTest}
              />
            )}
          </div>
        </Box>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteTestModal} onClose={() => setDeleteTestModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="modal-content-wrapper">
          <h4 className="form-title"> Are you sure to delete this final test?</h4>
          <div className="mt-4 w-[70%] flex justify-between mx-auto pb-4">
            <BtnWithIcon
              content="Cancel"
              onClick={() => setDeleteTestModal(false)}
            />
            <BtnWithIcon
              content="Delete"
              onClick={handleDeleteTestConfirm}
            />
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default FinalTestManagement