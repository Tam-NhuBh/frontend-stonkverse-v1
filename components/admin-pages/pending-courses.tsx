"use client"

import { useState, useEffect } from "react"
import type { IFetchedCourse } from "@/components/home-page/courses"
import { getAllPendingCourse } from "@/lib/fetch-data"
import { toast } from "react-hot-toast"
import { RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { approveCourse, rejectCourse } from "@/lib/mutation-data"
import PendingCard from "../pending-card"

type ProcessingState = {
  [courseId: string]: {
    isApproving?: boolean
    isRejecting?: boolean
  }
}

const PendingCourses = () => {
  const [pendingCourses, setPendingCourses] = useState<IFetchedCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [processingStates, setProcessingStates] = useState<ProcessingState>({})

  const fetchPendingCourses = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const data = await getAllPendingCourse()

      if (data && data.courses && Array.isArray(data.courses)) {
        setPendingCourses(data.courses)
      } else if (data && Array.isArray(data)) {
        setPendingCourses(data)
      } else {
        setPendingCourses([])
      }
    } catch (error) {
      // console.error("Error fetching pending courses:", error)
      toast.error("Failed to load pending courses")
      setPendingCourses([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPendingCourses()
  }, [])

  const handleRefresh = () => {
    fetchPendingCourses(true)
  }

  const handleApproveCourse = async (courseId: string) => {
    try {
      setProcessingStates((prev) => ({
        ...prev,
        [courseId]: { ...prev[courseId], isApproving: true },
      }))

      const response = await approveCourse(courseId)

      if (response) {
        toast.success("Course has been approved successfully")
        fetchPendingCourses() 
      } else {
        toast.error("Failed to approve course")
        setProcessingStates((prev) => ({
          ...prev,
          [courseId]: { ...prev[courseId], isApproving: false },
        }))
      }
    } catch (error) {
      console.error("Error approving course:", error)
      toast.error("Failed to approve course")

      setProcessingStates((prev) => ({
        ...prev,
        [courseId]: { ...prev[courseId], isApproving: false },
      }))
    }
  }

  const handleRejectCourse = async (courseId: string) => {
    try {
      setProcessingStates((prev) => ({
        ...prev,
        [courseId]: { ...prev[courseId], isRejecting: true },
      }))

      const response = await rejectCourse(courseId)

      if (response) {
        toast.success("Course has been rejected successfully")
        fetchPendingCourses() 
        setProcessingStates((prev) => {
          const newState = { ...prev }
          delete newState[courseId]
          return newState
        })
      } else {
        toast.error("Failed to reject course")
        setProcessingStates((prev) => ({
          ...prev,
          [courseId]: { ...prev[courseId], isRejecting: false },
        }))
      }
    } catch (error) {
      console.error("Error rejecting course:", error)
      toast.error("Failed to reject course")
      setProcessingStates((prev) => ({
        ...prev,
        [courseId]: { ...prev[courseId], isRejecting: false },
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (pendingCourses.length === 0) {
    return (
      <div className="mt-3 w-[90%] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <p className="font-semibold text-tertiary dark:text-dark_text text-xl">
            <span className="text-gradient font-bold">0 Courses</span> waiting for approval
          </p>

          <div className="relative group">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-full text-sm font-medium text-tertiary dark:text-dark_text border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              <RefreshCw
                size={20}
                className={`text-tertiary dark:text-dark_text ${isRefreshing ? "animate-spin" : ""} group-hover:rotate-180 transition-transform duration-300`}
              />
            </button>
            <span className="absolute right-0 top-full mt-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              Refresh list
            </span>
          </div>
        </div>

        <div className="dark:bg-slate-800 bg-[#F5F5F5] rounded-sm p-8 text-center">
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
          <h3 className="text-lg font-semibold mb-2 text-tertiary dark:text-dark_text">No pending courses found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">All courses have been reviewed</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 w-[90%] mx-auto">
      <div className="rounded-sm w-full">
        <div className="flex justify-between items-center mb-6">
          <p className="font-semibold text-tertiary dark:text-dark_text text-xl">
            <span className="text-gradient font-bold">{pendingCourses.length} Courses</span> waiting for approval
          </p>

          <div className="relative group">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-full text-sm font-medium text-tertiary dark:text-dark_text border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              <RefreshCw
                size={20}
                className={`text-tertiary dark:text-dark_text ${isRefreshing ? "animate-spin" : ""} group-hover:rotate-180 transition-transform duration-300`}
              />
            </button>
            <span className="absolute right-0 top-full mt-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              Refresh list
            </span>
          </div>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingCourses.map((course) => {
              const courseId =
                typeof course._id === "object" && course._id !== null
                  ? (course._id as any).toString()
                  : String(course._id)

              const isProcessingApprove = processingStates[courseId]?.isApproving || false
              const isProcessingReject = processingStates[courseId]?.isRejecting || false
              const isAnyProcessing = isProcessingApprove || isProcessingReject

              return (
                <div
                  key={courseId}
                  className="relative group bg-white dark:bg-slate-800 rounded-sm overflow-hidden shadow-md hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 flex flex-col h-full"
                >
                  <div className="flex-grow p-4">
                    <PendingCard key={course?._id.toString()} course={course} />
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 px-4 py-3 border-t border-yellow-100 dark:border-yellow-800 flex items-center justify-between h-14">
                    <span className="text-yellow-700 dark:text-yellow-300 text-sm font-medium flex items-center">
                      <span className="h-2 w-2 rounded-full bg-yellow-400 dark:bg-yellow-300 mr-2"></span>
                      Pending
                    </span>

                    <div className="flex space-x-2">
                      <div className="relative group/approve">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApproveCourse(courseId)
                          }}
                          disabled={isAnyProcessing}
                          className={`p-1 rounded text-green-600 dark:text-green-400 ${isAnyProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                          aria-label="Approve course"
                          title="Approve course"
                        >
                          {isProcessingApprove ? (
                            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-green-600 border-r-transparent"></span>
                          ) : (
                            <CheckCircle size={24} className="hover:scale-110 transition-transform duration-300" />
                          )}
                        </button>
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover/approve:opacity-100 transition-opacity z-10 pointer-events-none">
                          Approve
                        </span>
                      </div>

                      <div className="relative group/reject">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRejectCourse(courseId)
                          }}
                          disabled={isAnyProcessing}
                          className={`p-1 rounded text-red-600 dark:text-red-400 ${isAnyProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                          aria-label="Reject course"
                          title="Reject course"
                        >
                          {isProcessingReject ? (
                            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-red-600 border-r-transparent"></span>
                          ) : (
                            <XCircle size={24} className="hover:scale-110 transition-transform duration-300" />
                          )}
                        </button>
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover/reject:opacity-100 transition-opacity z-10 pointer-events-none">
                          Reject
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingCourses
