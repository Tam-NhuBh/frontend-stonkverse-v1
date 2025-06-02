"use client"

import { motion } from "framer-motion"

interface TimeFilterProps {
  selectedTime: string
  setSelectedTime: (time: string) => void
}

export default function TimeFilter({ selectedTime, setSelectedTime }: TimeFilterProps) {
  const timeOptions = ["Hour", "Day", "Week", "Month", "Year", "Market Cap & Day"]

  return (
    <div className="flex flex-wrap gap-2">
      {timeOptions.map((time) => (
        <motion.button
          key={time}
          className={`relative rounded-md px-4 py-2 text-sm font-medium ${
            selectedTime === time ? "bg-green-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedTime(time)}
        >
          {time}
        </motion.button>
      ))}
      <motion.button
        className="rounded-md bg-gray-800 p-2 text-gray-300 hover:bg-gray-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </motion.button>
      <motion.button
        className="rounded-md bg-gray-800 p-2 text-gray-300 hover:bg-gray-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </motion.button>
    </div>
  )
}

