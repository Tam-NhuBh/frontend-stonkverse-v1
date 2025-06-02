"use client"
import Breadcrumbs from "@marketsystems/nextjs13-appdir-breadcrumbs"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const BreadCrumbsComp = () => {
  const pathname = usePathname() ?? "/"
  const breadcrumbItems = pathname.split("/").filter(Boolean) // Get segments

  return (
    <div className="breadcrumbs-section bg-gray-50 dark:bg-gray-800 py-2 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto flex items-center text-sm md:text-base text-gray-600 dark:text-gray-300">
        <Link href="/" className="flex items-center hover:text-primary transition-colors mr-2">
          <Home className="w-5 h-5 mr-1" />
          <span className="p-1">Home</span>
        </Link>

        {breadcrumbItems.map((segment, index) => {
          const path = "/" + breadcrumbItems.slice(0, index + 1).join("/") // Construct path dynamically

          return (
            <Link
              key={path}
              href={path}
              className="flex items-center hover:text-primary transition-colors"
            >
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <span>{segment.replace("-", " ")}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default BreadCrumbsComp
