"use client"

import { useMount } from "@/hooks/useMount"
import type { NextPage } from "next"

import PendingCourses from "@/components/admin-pages/pending-courses"
import ProtectedPage from "@/components/protected-page"
import { useState } from "react"
import FinalTestManagement from "@/components/final-test/final-test-management"

type Props = {}

const AdminPanel: NextPage<Props> = () => {
  const hasMounted = useMount();
  const [activeTab, setActiveTab]= useState<"course" | "finaltest">("course");

  if (!hasMounted) return null;

  return (
    <ProtectedPage>
      <div className="w-full mx-auto mt-6">
        {/* Tabs */}
        {/* <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${activeTab === "course" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-slate-700"}`}
            onClick={() => setActiveTab("course")}
          >
            Courses
          </button>

          <button
            className={`px-4 py-2 rounded ${activeTab === "finaltest" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-slate-700"}`}
            onClick={() => setActiveTab("finaltest")}
          >
            finaltest Courses
          </button>
        </div> */}
        <PendingCourses/>
        {/* {activeTab === "course" && <PendingCourses />} */}
        {/* {activeTab === "finaltest" && <FinalTestManagement />} */}
      </div>
    </ProtectedPage>
  )
}

export default AdminPanel

