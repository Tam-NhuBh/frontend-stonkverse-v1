"use client"

import type { FC } from "react"
import { Flame } from "lucide-react"

interface FinalTestButtonProps {
  hasFinalTest: boolean
  isCompleted?: boolean
  onClick: () => void
  isActive: boolean
}

const FinalTestButton: FC<FinalTestButtonProps> = ({ hasFinalTest, isCompleted = false, onClick, isActive }) => {
  if (!hasFinalTest) return null

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`relative overflow-hidden px-6 py-2 rounded-sm ${
          isCompleted
            ? "bg-gradient-to-br from-green-600 to-emerald-500"
            : "bg-gradient-to-br from-purple-600 to-indigo-500"
        } text-white font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/30 hover:scale-105`}
        disabled={!hasFinalTest}
      >
        <div className="absolute inset-0 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <span className="relative flex items-center gap-2">
          <Flame size={20} className="text-yellow-300" strokeWidth={2.5} />
          <span>{isActive ? "Close Final Test" : isCompleted ? "Review Final Test" : "Take Final Test"}</span>
        </span>
      </button>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/10 to-indigo-400/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
    </div>
  )
}

export default FinalTestButton
