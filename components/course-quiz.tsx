"use client"

import { type FC, useState, useEffect, useCallback, useMemo } from "react"
import toast from "react-hot-toast"
import BtnWithIcon from "./btn-with-icon"
import { addAnswerQuiz } from "@/lib/mutation-data"
import { getAnswersQuiz } from "@/lib/fetch-data"
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"

interface QuizQuestion {
  id: string
  title: string
  mockAnswer: string[]
  correctAnswer: string[]
  maxScore: number
}

interface Props {
  courseId: string
  quizId: string
  contentId: string
  questions: QuizQuestion[]
  onClose: () => void
  onQuizSubmit: () => void
}

const CourseQuiz: FC<Props> = ({ courseId, contentId, questions, quizId, onClose, onQuizSubmit }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string[] }>({})
  const [score, setScore] = useState<number | null>(null)
  const [questionScores, setQuestionScores] = useState<{ [key: string]: number }>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false)
  const [isResubmitEnabled, setIsResubmitEnabled] = useState<boolean>(false)
  const [showResultModal, setShowResultModal] = useState<boolean>(false)
  const [canEnableResubmit, setCanEnableResubmit] = useState<boolean>(false)
  const [tempSelectedAnswers, setTempSelectedAnswers] = useState<{ [key: string]: string[] }>({})

  // Memoize correctAnswers to avoiding on each render
  const correctAnswers = useMemo(() => {
    const answersMap: { [key: string]: string[] } = {}
    questions.forEach((question) => {
      answersMap[question.id] = question.correctAnswer
    })
    return answersMap
  }, [questions])

  const maxPossibleScore = useMemo(() => questions.reduce((acc, question) => acc + question.maxScore, 0), [questions])

  // Check all of the user's answer
  const areAllQuestionsAnswered = useMemo(
    () => questions.every((question) => selectedAnswers[question.id]?.length > 0),
    [questions, selectedAnswers],
  )

  const fetchSavedAnswers = useCallback(async () => {
    if (!contentId) {
      toast.error("Invalid content ID")
      return
    }

    try {
      const savedAnswers = await getAnswersQuiz(contentId)
      if (savedAnswers?.answers?.[contentId]) {
        const answersForContent = savedAnswers.answers[contentId]
        setSelectedAnswers(answersForContent)
        setHasSubmitted(true)

        // update score state if the result change
        if (savedAnswers.scores?.[contentId]) {
          setScore(savedAnswers.scores[contentId].totalScore)
          setQuestionScores(savedAnswers.scores[contentId].detailedScores || {})
        }
      }
    } catch (error) {
      toast.error("An error occurred while fetching saved answers")
      console.error(error)
    }
  }, [contentId])

  useEffect(() => {
    fetchSavedAnswers()
  }, [fetchSavedAnswers])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    if (hasSubmitted) {
      timeoutId = setTimeout(() => setCanEnableResubmit(true), 0)
    } else {
      setCanEnableResubmit(false)
      setIsResubmitEnabled(false)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [hasSubmitted])

  // Change result handle
  const handleEnableResubmit = useCallback(() => {
    setIsResubmitEnabled(true)
    setTempSelectedAnswers({ ...selectedAnswers })
  }, [selectedAnswers])

  const handleAnswerChange = useCallback(
    (questionId: string, correctAnswerLength: number, answer: string, isChecked: boolean) => {
      // No changes are allowed in view mode (submitted and not in resubmit mode)
      if (hasSubmitted && !isResubmitEnabled) return

      // Use tempSelectedAnswers during resubmit mode
      const updateAnswers = (prevAnswers: { [key: string]: string[] }) => {
        const newAnswers = { ...prevAnswers }

        // Initialize the question's answers array if it doesn't exist
        if (!newAnswers[questionId]) {
          newAnswers[questionId] = []
        }

        if (isChecked) {
          // For single choice questions, replace the answer
          if (correctAnswerLength === 1) {
            newAnswers[questionId] = [answer]
          }
          // For multiple choice, add the answer if not already selected
          else if (!newAnswers[questionId].includes(answer)) {
            newAnswers[questionId] = [...newAnswers[questionId], answer]
          }
        } else {
          // Remove the answer if unchecked
          newAnswers[questionId] = newAnswers[questionId].filter((ans) => ans !== answer)
        }

        return newAnswers
      }

      if (hasSubmitted && isResubmitEnabled) {
        setTempSelectedAnswers(updateAnswers)
      } else {
        setSelectedAnswers(updateAnswers)
      }
    },
    [hasSubmitted, isResubmitEnabled],
  )

  const handleSubmit = async () => {
    if (hasSubmitted && isResubmitEnabled) {
      handleResubmit()
      return
    }

    if (!areAllQuestionsAnswered) {
      toast.error("Please answer all questions before submitting")
      return
    }

    setIsSubmitting(true)

    try {
      const submissionData = questions.map((question) => ({
        questionId: question.id,
        answer: selectedAnswers[question.id] || [],
      }))

      const response = await addAnswerQuiz(courseId, contentId, submissionData)

      if (response) {
        const { totalScore, detailedScores } = response
        setScore(totalScore)
        setQuestionScores(detailedScores)
        setHasSubmitted(true)
        setShowResultModal(true)
        toast.success("Quiz answers submitted successfully!")
        onQuizSubmit()
      }
    } catch (error) {
      toast.error("An error occurred while submitting your answers. Please try again!")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelResubmit = useCallback(() => {
    setIsResubmitEnabled(false)
    // Restore the original answers from the server
    fetchSavedAnswers()
  }, [fetchSavedAnswers])

  const handleResubmit = useCallback(async () => {
    if (
      !Object.keys(tempSelectedAnswers).length ||
      !questions.every((question) => tempSelectedAnswers[question.id]?.length > 0)
    ) {
      toast.error("Please answer all questions before submitting")
      return
    }

    setIsSubmitting(true)

    try {
      const submissionData = questions.map((question) => ({
        questionId: question.id,
        answer: tempSelectedAnswers[question.id] || [],
      }))

      const response = await addAnswerQuiz(courseId, contentId, submissionData)

      if (response) {
        const { totalScore, detailedScores } = response
        setScore(totalScore)
        setQuestionScores(detailedScores)
        setSelectedAnswers(tempSelectedAnswers)
        setHasSubmitted(true)
        setIsResubmitEnabled(false)
        setShowResultModal(true)
        toast.success("Quiz answers resubmitted successfully!")
        onQuizSubmit()
      }
    } catch (error) {
      toast.error("An error occurred while resubmitting your answers. Please try again!")
    } finally {
      setIsSubmitting(false)
    }
  }, [contentId, courseId, onQuizSubmit, questions, tempSelectedAnswers])

  const isAnswerCorrect = useCallback(
    (questionId: string, answer: string): boolean => {
      return correctAnswers[questionId]?.includes(answer) || false
    },
    [correctAnswers],
  )

  const getAnswerLabelClass = useCallback(
    (isSelected: boolean, isCorrectAnswer: boolean, hasSubmitted: boolean, isResubmitEnabled: boolean) => {
      const baseClass =
        "flex items-center mt-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-900 duration-300 transition p-2 rounded-md"

      if (hasSubmitted && !isResubmitEnabled) {
        if (isSelected && isCorrectAnswer) {
          return `${baseClass} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`
        } else if (isSelected && !isCorrectAnswer) {
          return `${baseClass} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`
        } else if (!isSelected && isCorrectAnswer) {
          return `${baseClass} bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-dashed border-blue-400`
        }
      }

      return `${baseClass} text-gray-600 dark:text-white`
    },
    [],
  )

  // const getFeedbackMessage = useCallback((score: number, maxScore: number) => {
  //   if (score === maxScore) return "Perfect score! Great job!"
  //   if (score >= maxScore * 0.8) return "Excellent work! You're almost there!"
  //   if (score >= maxScore * 0.6) return "Good effort! Review the questions to improve your score."
  //   return "Review the questions above to see where you can improve."
  // }, [])

  const handleCloseResultModal = () => {
    setShowResultModal(false)
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 dark:border-slate-100">
      <div className="grid gap-4 mb-5">
        {questions.map((question, index) => {
          const tickType = question.correctAnswer.length > 1 ? "checkbox" : "radio"
          const questionScore = questionScores?.[question.id] || 0
          const isCorrect = questionScore === question.maxScore

          return (
            <div key={question.id} className="bg-gray-100 dark:bg-slate-700 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-semibold">
                  Question {index + 1}: {question.title}
                </p>
                {hasSubmitted && !isResubmitEnabled && (
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <FaCheckCircle className="text-green-500 dark:text-green-400" size={18} />
                    ) : (
                      <FaTimesCircle className="text-red-500 dark:text-red-400" size={18} />
                    )}
                  </div>
                )}
              </div>

              {question.mockAnswer.map((answer, ansIndex) => {
                const currentAnswers = isResubmitEnabled ? tempSelectedAnswers : selectedAnswers
                const isSelected = currentAnswers[question.id]?.includes(answer) || false
                const isCorrectAnswer = isAnswerCorrect(question.id, answer)
                const labelClass = getAnswerLabelClass(isSelected, isCorrectAnswer, hasSubmitted, isResubmitEnabled)

                return (
                  <label key={ansIndex} className={labelClass}>
                    <input
                      type={tickType}
                      name={`question-${index}`}
                      className={`mr-2 ${tickType === "radio" ? "rounded-full" : "rounded-md"}`}
                      value={answer}
                      onChange={(e) =>
                        handleAnswerChange(question.id, question.correctAnswer.length, answer, e.target.checked)
                      }
                      checked={isSelected}
                      disabled={hasSubmitted && !isResubmitEnabled}
                    />
                    <span>{answer}</span>
                    {hasSubmitted && !isResubmitEnabled && (
                      <>
                        {isSelected && isCorrectAnswer && (
                          <FaCheckCircle className="ml-auto text-green-500" size={16} />
                        )}
                        {isSelected && !isCorrectAnswer && <FaTimesCircle className="ml-auto text-red-500" size={16} />}
                        {!isSelected && isCorrectAnswer && (
                          <FaCheckCircle className="ml-auto text-blue-500 opacity-50" size={16} />
                        )}
                      </>
                    )}
                  </label>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="flex space-x-4">
        <BtnWithIcon
          content={hasSubmitted && isResubmitEnabled ? "Resubmit" : hasSubmitted ? "Enable re-submit" : "Submit"}
          type="submit"
          onClick={hasSubmitted && !isResubmitEnabled ? handleEnableResubmit : handleSubmit}
          iconSize={25}
          iconCustomClasses="-mt-1"
          disabled={isSubmitting}
        />
        {hasSubmitted && isResubmitEnabled && (
          <BtnWithIcon content="Cancel" type="button" iconSize={25} onClick={handleCancelResubmit} />
        )}
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="overflow-y-auto max-h-[calc(100vh-4rem)] px-2" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-md w-full">
              <h3 className="text-xl text-gray-900 dark:text-gray-200 font-bold mb-2">Quiz results</h3>

              {/*
                <div className="mb-3">
                  <div className="text-md font-semibold flex items-center gap-2 mb-1">
                    <span>
                      Your total score: {score}/{maxPossibleScore}
                    </span>
                    {score === maxPossibleScore ? <FaCheckCircle className="text-green-500" size={24} /> : null}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getFeedbackMessage(score, maxPossibleScore)}</p>
                </div>
                */}

              <div className="max-h-60 overflow-y-auto mb-4">
                {questions.map((question, index) => {
                  const isCorrect = questionScores?.[question.id] === question.maxScore
                  return (
                    <div key={question.id} className="mb-2 p-2 border-b">
                      <div className="flex justify-between">
                        <span className="text-md text-gray-800 dark:text-gray-300 font-semibold ml-0.2">Question {index + 1}:</span>
                        <div className="flex items-center">
                          {isCorrect ? (
                            <FaCheckCircle className="ml-1 text-green-500" size={16} />
                          ) : (
                            <FaTimesCircle className="ml-1 text-red-500" size={16} />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-1.5">{question.title}</p>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end">
                <BtnWithIcon content="Close" type="button" iconSize={25} onClick={handleCloseResultModal} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseQuiz

