"use client"

import type React from "react"

import { Info } from "lucide-react"
import type { TestSettings } from "@/types"
import BottomNavigator from "../admin-pages/create-course-page/bottom-navigator"
import toast from "react-hot-toast"

interface SettingsProps {
  testSettings: TestSettings
  setTestSettings: React.Dispatch<React.SetStateAction<TestSettings>>
  onNext: () => void
  onBack: () => void
  isReadOnly?: boolean

}

const Tooltip = ({ content }: { content: string }) => {
  return (
    <div className="group relative inline-block">
      <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
      <div
        className={`
          absolute z-50 invisible group-hover:visible
          bg-gray-900 text-white text-sm leading-snug 
          rounded-md px-4 py-3 shadow-md whitespace-normal break-words
          w-fit max-w-[280px]
          top-full mt-2
          left-1/2 -translate-x-1/2
        `}
      >
        {content}
      </div>
    </div>
  )
}


const TestSettingsComponent = ({ testSettings, setTestSettings, onNext, onBack }: SettingsProps) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const optionsHandler = () => {
    const { hours, minutes } = testSettings.testDuration
    if (
      (hours === 0 || hours === undefined) &&
      (minutes === 0 || minutes === undefined)
    ) {
      toast.error("Please set a time for the final test")
      return
    }

    if (!testSettings.numberOfQuestions || testSettings.numberOfQuestions < 1) {
      toast.error("Number of questions must be at least 1")
      return
    }

    if (!testSettings.instructionsMessage || testSettings.instructionsMessage.trim() === "") {
      toast.error("Please provide an instruction message")
      return
    }

    if (!testSettings.completionMessage || testSettings.completionMessage.trim() === "") {
      toast.error("Please provide a completion message")
      return
    } else if (testSettings.completionMessage.length < 5) {
      toast.error("Completion message should be at least 5 characters")
      return
    }

    onNext()
  }

  return (
    <form className="w-full mx-auto mt-8 my-12" onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="rounded-sm border dark:border-gray-600 shadow-sm">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="border rounded-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <label className="font-medium">Time to answer all questions</label>
                  <Tooltip content="Set the total time allowed for students to complete all questions in the test. At least one field must be filled." />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Hours</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border rounded-sm dark:bg-gray-800 dark:border-gray-700"
                      value={testSettings.testDuration.hours || 0}
                      onChange={(e) =>
                        setTestSettings({
                          ...testSettings,
                          testDuration: {
                            ...testSettings.testDuration,
                            hours: Number.parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border rounded-sm dark:bg-gray-800 dark:border-gray-700"
                      value={testSettings.testDuration.minutes || 0}
                      onChange={(e) =>
                        setTestSettings({
                          ...testSettings,
                          testDuration: {
                            ...testSettings.testDuration,
                            minutes: Number.parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                 
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <label className="block text-sm font-medium">Number of questions</label>
                <Tooltip content="Set the total number of questions that will appear in the test." />
              </div>
              <div className="w-full">
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border rounded-sm dark:bg-gray-800 dark:border-gray-700"
                  value={testSettings.numberOfQuestions || 1}
                  onChange={(e) =>
                    setTestSettings({
                      ...testSettings,
                      numberOfQuestions: Number.parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="block text-sm font-medium">Page layout</label>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <label>Question per page</label>
                  <Tooltip content="Determines how questions are displayed to students. 'All questions' shows all questions on a single page." />
                </div>
                <div className="px-3 py-2 rounded-sm w-full md:w-[180px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 opacity-70 cursor-not-allowed">
                  All questions
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <label>Immediately after grading</label>
                  <Tooltip content="Controls what information is shown to students after they complete the test." />
                </div>
                <div className="px-3 py-2 rounded-sm w-full md:w-[180px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 opacity-70 cursor-not-allowed">
                  Score only
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="rounded-sm border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Test instructions</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-400 mb-4">
              Write specific test-taking instructions for candidates to acknowledge in a pop-up dialog before starting
              the test. Instructions should be concise and easy to understand.
            </p>
            <div className="rounded-sm">
              <textarea
                id="test-instructions"
                className="w-full p-3 min-h-[150px] border bg-[#f5f5f5] dark:bg-transparent resize-y dark:bg-gray-800 dark:border-gray-700"
                placeholder="Enter test instructions"
                value={testSettings.instructionsMessage || ""}
                onChange={(e) =>
                  setTestSettings({
                    ...testSettings,
                    instructionsMessage: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="rounded-sm border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Test completion message</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-400 mb-4">
              Write a message that candidates will see after completing the test. Provide details about result
              availability or additional steps.
            </p>
            <div className="rounded-sm">
              <textarea
                id="completion-message"
                className="w-full p-3 min-h-[150px] border bg-[#f5f5f5] dark:bg-transparent resize-y dark:bg-gray-800 dark:border-gray-700"
                placeholder="Enter completion message"
                value={testSettings.completionMessage || ""}
                onChange={(e) =>
                  setTestSettings({
                    ...testSettings,
                    completionMessage: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <BottomNavigator backHandler={onBack} nextHandler={optionsHandler} customClasses="w-full my-12 mx-auto" />

    </form>
  )
}

export default TestSettingsComponent