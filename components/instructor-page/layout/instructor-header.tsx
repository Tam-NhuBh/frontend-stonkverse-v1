"use client"

import ThemeSwitcher from "@/components/layout/theme-switcher"
import { useGetAllNotificationsQuery, useUpdateNotifcationStatusMutation } from "@/store/notification/notification-api"
import { type FC, useState, useEffect, useMemo, JSX } from "react"
import { IoMdNotificationsOutline, IoMdCheckmarkCircleOutline } from "react-icons/io"
import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"
import { IoCheckmarkDoneSharp } from "react-icons/io5"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo("en-US")

type Props = {}

const InstructorHeader: FC<Props> = (): JSX.Element => {
  const [open, setOpen] = useState(false)
  const { data, refetch } = useGetAllNotificationsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const [updateNotificationStatus, { isSuccess }] = useUpdateNotifcationStatusMutation()
  const pathname = usePathname() ?? "/"
  const breadcrumbItems = pathname.split("/").filter(Boolean) // Get segments

  const [notifications, setNotifications] = useState([])

  const unreadCount = useMemo(() => {
    return notifications.filter((item: any) => item.status === 'unread').length
  }, [notifications])

  useEffect(() => {
    if (data) {
      setNotifications(data.notifications || [])
    }
  }, [data])

  const handleNotificationStatusChange = async (id: string) => {
    await updateNotificationStatus( id )
    refetch()
  }

  return (
    <div className="bg-white dark:bg-[#111c43]">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between flex-wrap min-w-0">
          <div className="flex-1 min-w-0 mr-4 overflow-x-auto">
            <div className="flex flex-wrap items-center text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">
              <Link href="/" className="flex items-center hover:text-primary transition-colors mr-2 whitespace-nowrap">
                <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="p-1">Home</span>
              </Link>

              {breadcrumbItems.map((segment, index) => {
                const path = "/" + breadcrumbItems.slice(0, index + 1).join("/")
                const isLast = index === breadcrumbItems.length - 1

                return (
                  <div key={path} className="flex items-center">
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-400 flex-shrink-0" />
                    <Link
                      href={path}
                      className={`flex items-center hover:text-primary transition-colors whitespace-nowrap ${
                        isLast ? "font-semibold" : ""
                      }`}
                    >
                      <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                        {segment.replace("-", " ")}
                      </span>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <ThemeSwitcher />
            <div className="relative cursor-pointer" onClick={() => setOpen(!open)}>
              <IoMdNotificationsOutline className="text-2xl cursor-pointer dark:text-dark_text text-black" />
               {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#3ccba0] rounded-full w-5 h-5 text-xs flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="absolute top-10 right-4 z-50">
          <div className="w-80 max-h-[450px] bg-white dark:bg-gray-800 shadow-xl border dark:border-gray-700 rounded-sm overflow-hidden">
            <h5 className="text-center text-lg font-semibold text-white py-3 bg-[#45cba0]">Notifications</h5>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No notifications</p>
              ) : (
                notifications.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="border-b dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" // Added cursor-pointer
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</p>
                      {item.status === 'read' ? (
                        <IoCheckmarkDoneSharp
                          className="text-green-500 cursor-pointer"
                          onClick={() => handleNotificationStatusChange(item._id)}
                        />
                      ) : (
                        <IoMdCheckmarkCircleOutline
                          className="text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                          onClick={() => handleNotificationStatusChange(item._id)}
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {timeAgo.format(new Date(item.createdAt))}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InstructorHeader

