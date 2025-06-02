"use client"

import type { FC } from "react"

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const SearchBox: FC<SearchBoxProps> = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className="pl-10 outline-none pr-4 dark:text-gray-300 justify-between w-full p-3 rounded-sm cursor-pointer bg-[#F5F5F5] dark:bg-slate-900"

        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </div>
  )
}

export default SearchBox

