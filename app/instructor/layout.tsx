"use client"

import InstructorHeader from "@/components/instructor-page/layout/instructor-header"
import InstructorSidebar from "@/components/instructor-page/layout/instructor-sidebar"
import NoContentYet from "@/components/no-content-yet"
import useIsInstructor from "@/hooks/useIsInstructor"
import { useRouter } from "next/navigation"
import { type FC, JSX, type ReactNode, useEffect, useState } from "react"

interface Props {
  children: ReactNode
}

const InstructorLayout: FC<Props> = ({ children }): JSX.Element | null => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isInstructor = useIsInstructor()
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)

    if (isInstructor !== undefined) {
      if (!isInstructor) {
        router.replace("/")
      }
    }
  }, [isInstructor, router])

  if (!isMounted) {
    return null
  }

  if (isInstructor === false) {
    return <NoContentYet description="" />
  }

  if (isInstructor === undefined) {
    return <NoContentYet description="" />
  }

  return (
    <div className="flex min-h-screen">
      <div className={`${!isCollapsed ? "w-[20%]" : "w-[5%]"}`}>
        <InstructorSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div className="flex-1 flex flex-col">
        <InstructorHeader />
        <hr className="w-30% center"></hr>
        <main>
          <div className="flex-1">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default InstructorLayout
