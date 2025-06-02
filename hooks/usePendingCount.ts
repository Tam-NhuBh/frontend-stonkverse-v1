import { getAllPendingCourse } from "@/lib/fetch-data"
import { useEffect, useState } from "react"

export function usePendingCount() {
  const [pendingCoursesCount, setPendingCoursesCount] = useState(0)
  const [pendingUsersCount, setPendingUsersCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchPendingCoursesCount = async () => {
    try {
      const data = await getAllPendingCourse()
      if (data && data.courses && Array.isArray(data.courses)) {
        setPendingCoursesCount(data.courses.length)
      } else if (data && Array.isArray(data)) {
        setPendingCoursesCount(data.length)
      } else {
        setPendingCoursesCount(0)
      }
    } catch (error) {
      console.error("Error fetching pending courses count:", error)
      setPendingCoursesCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingCoursesCount()
    const intervalId = setInterval(fetchPendingCoursesCount, 5 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [])

  return {
    pendingCoursesCount,
    pendingUsersCount,
    totalPendingCount: pendingCoursesCount + pendingUsersCount,
    isLoading,
    refetch: fetchPendingCoursesCount,
    // expose setter if needed manually
    setPendingCoursesCount
  }
}
