"use client"

import type { FC } from "react"
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md"
import { toast } from "react-hot-toast"
import { DeleteOutlineOutlined } from "@mui/icons-material"
import { Edit, Trash, TrashIcon } from "lucide-react"
import { AiOutlineDelete } from "react-icons/ai"
import { FiEdit } from "react-icons/fi"

interface IDuration {
  hours: number
  minutes: number
}

interface IFinalTestCardProps {
  id: string
  name: string
  description: string
  testDuration: IDuration
  withSections: boolean
  createdAt: string
  numberOfQuestions?: number
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const formatDuration = (testDuration: IDuration) => {
  const parts = []
  if (testDuration.hours > 0) parts.push(`${testDuration.hours}h`)
  if (testDuration.minutes > 0) parts.push(`${testDuration.minutes}m`)
  return parts.join(" ") || "No time limit"
}

const FinalTestCard: FC<IFinalTestCardProps> = ({
  id,
  name,
  description,
  testDuration,
  withSections,
  createdAt,
  numberOfQuestions = 0,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-[#F5F5F5] dark:bg-slate-800 rounded-sm border border-b dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-2xl truncate mb-2">{name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-shrink-0">{description}</p>

        <div className="space-y-2 mb-4 flex-shrink-0">
          <div className="flex items-start text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">Duration:</span>
            <span className="font-medium ml-auto truncate">{formatDuration(testDuration)}</span>
          </div>

          <div className="flex items-start text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">Created:</span>
            <span className="font-medium ml-auto truncate">{new Date(createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-start text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">Questions:</span>
            <span className="font-medium ml-auto truncate">{numberOfQuestions}</span>
          </div>

          <div className="flex items-start text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">Sections:</span>
            <span className="font-medium ml-auto truncate">{withSections ? "Yes" : "No"}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t dark:border-gray-700 mt-auto flex-shrink-0">
          <button className="dark:text-[#3E4399] text-slate-700 hover:scale-110 transition-transform duration-200"
            onClick={() => onEdit(id)} title="Edit Quiz">
            <FiEdit size={17} />
          </button>


          <div className="flex gap-2 flex-shrink-0">

            <button className="text-red-600 hover:scale-110 transition-transform duration-200"
              onClick={() => onDelete(id)} title="Delete Quiz">
              <Trash size={19} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default FinalTestCard

