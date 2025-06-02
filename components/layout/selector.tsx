"use client"

import { type FC, useState, useRef, useEffect } from "react"
import { MdSchool } from "react-icons/md"

interface Course {
  _id: string
  name: string
}

interface SelectorProps {
  courses: Course[]
  selectedCourseId: string
  onCourseChange: (courseId: string) => void
  isLoading: boolean
}

const Selector: FC<SelectorProps> = ({ courses, selectedCourseId, onCourseChange, isLoading }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getSelectedCourseName = () => {
    if (!selectedCourseId || !courses) return "Select a course"
    const course = courses.find((c) => c._id === selectedCourseId)
    return course ? course.name : "Select a course"
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative " ref={dropdownRef}>
      <div
        className="flex items-center dark:text-gray-300 justify-between w-full p-3 rounded-sm border dark:border-gray-700 cursor-pointer bg-[#F5F5F5] dark:bg-slate-900"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="flex items-center flex-grow overflow-hidden">
          <MdSchool className="min-w-[20px] mr-2 text-[#475569] dark:text-[#3E4396] flex-shrink-0" size={20} />
          <span className="font-medium truncate">{getSelectedCourseName()}</span>
        </div>
        <svg
          className={`min-w-[16px] w-4 h-4 ml-2 transition-transform flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {dropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-sm shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center">Loading courses...</div>
          ) : courses?.length === 0 ? (
            <div className="p-4 text-center">No courses available</div>
          ) : (
            <ul className="w-full">
              {courses.map((course) => (
                <li
                  key={course._id}
                  className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                    selectedCourseId === course._id ? "bg-gray-100 dark:bg-gray-700 font-medium" : ""
                  } truncate`}
                  onClick={() => {
                    onCourseChange(course._id)
                    setDropdownOpen(false)
                  }}
                  title={course.name}
                >
                  {course.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default Selector

