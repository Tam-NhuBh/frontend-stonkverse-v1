"use client"

import type { FC, JSX } from "react"
import type { ITitleFinalTest, TestSettings } from "@/types"
import { CheckCircle, CheckSquare, FileText, ImageIcon } from "lucide-react"
import BottomNavigator from "../admin-pages/create-course-page/bottom-navigator"

interface TestOverviewProps {
  finalTests: ITitleFinalTest[]
  testSettings: TestSettings
  testTitle: string
  testDescription: string
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
  courseId: string
  isReadOnly?: boolean
}

const TestOverview: FC<TestOverviewProps> = ({
  finalTests,
  testSettings,
  testTitle,
  testDescription,
  onBack,
  onSubmit,
  isSubmitting,
  courseId
}): JSX.Element => {
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "single":
        return <CheckCircle size={16} className="text-blue-500" />;
      case "multiple":
        return <CheckSquare size={16} className="text-purple-500" />;
      case "fillBlank":
        return <FileText size={16} className="text-green-500" />;
      case "image":
        return <ImageIcon size={16} className="text-amber-500" />;
      default:
        return <CheckCircle size={16} />;
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "single":
        return "Single Correct Answer";
      case "multiple":
        return "Multiple Correct Answers";
      case "fillBlank":
        return "Fill in the Blank";
      // case "image":
      //   return "Image Question";
      default:
        return type;
    }
  }

  const formatDuration = () => {
    const { hours, minutes } = testSettings.testDuration;
    const parts = [];

    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(', ') : 'Not set';
  }

  return (
    <div className="w-full">
      <div className="rounded-sm border dark:border-gray-600 shadow-sm p-6">
        <div className="space-y-6">
          {/* Test Information */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-sm border dark:border-gray-700">
            <h3 className="font-semibold text-lg mb-3 border-b dark:border-gray-700 pb-2">Test Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Title:</h4>
                <p className="text-gray-900 dark:text-gray-100">{testTitle || "Not specified"}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Description:</h4>
                <p className="text-gray-900 dark:text-gray-100">{testDescription || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-sm border dark:border-gray-700">
            <h3 className="font-semibold text-lg mb-3 border-b dark:border-gray-700 pb-2">Questions ({finalTests.length})</h3>

            {finalTests.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
                {finalTests.map((question, index) => (
                  <div key={index} className="bg-white dark:bg-gray-900 p-3 rounded-sm border dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                        Question {index + 1}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                        {getQuestionTypeIcon(question.type)}
                        <span>{getQuestionTypeLabel(question.type)}</span>
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded-full">
                        {question.maxScore} points
                      </span>
                    </div>

                    <div className="mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">{question.title}</h4>
                    </div>

                    {/* Display image for image questions
                    {question.type === "image" && question.imageUrl && (
                      <div className="mb-3 border rounded-sm dark:border-gray-700 overflow-hidden">
                        <img
                          src={question.imageUrl}
                          alt={question.title}
                          className="max-h-32 mx-auto object-contain my-2"
                        />
                      </div>
                    )} */}

                    {/* Options */}
                    <div className="mb-2">
                      <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Options:</h5>
                      <div className="ml-2 space-y-1">
                        {question.mockAnswer.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-start gap-2">
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span
                              className={`text-sm ${question.correctAnswer.includes(option)
                                  ? "font-semibold text-green-600 dark:text-green-400"
                                  : "text-gray-600 dark:text-gray-400"
                                }`}
                            >
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Answers */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Correct Answer:</h5>
                      <div className="ml-2">
                        {question.type === "fillBlank" ? (
                          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {question.correctAnswer[0] || "Not specified"}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {question.correctAnswer.map((answer, ansIndex) => (
                              <span key={ansIndex} className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full">
                                {answer}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">No questions added yet</p>
            )}
          </div>

          {/* Test Instructions */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-sm border dark:border-gray-700">
            <h3 className="font-semibold text-lg mb-3 border-b dark:border-gray-700 pb-2">Test Instructions</h3>
            <div className="prose dark:prose-invert max-w-none">
              {testSettings.instructionsMessage ? (
                <div className="bg-white dark:bg-gray-900 p-3 rounded border dark:border-gray-700">
                  {testSettings.instructionsMessage}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No instructions provided</p>
              )}
            </div>
          </div>

          {/* Completion Message */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-sm border dark:border-gray-700">
            <h3 className="font-semibold text-lg mb-3 border-b dark:border-gray-700 pb-2">Completion Message</h3>
            <div className="prose dark:prose-invert max-w-none">
              {testSettings.completionMessage ? (
                <div className="bg-white dark:bg-gray-900 p-3 rounded border dark:border-gray-700">
                  {testSettings.completionMessage}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No completion message provided</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8">
        <BottomNavigator
          backHandler={onBack}
          nextHandler={onSubmit}
          isCreate
        />
      </div>
    </div>
  )
}

export default TestOverview