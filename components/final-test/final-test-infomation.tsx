"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Trash2, FileText, CheckCircle, CheckSquare, ImageIcon, Upload } from "lucide-react"
import type { ITitleFinalTest, QuestionType, IAnswerFinalTest } from "@/types"
import { AiOutlineCloudUpload, AiOutlinePlusCircle } from "react-icons/ai"
import BtnWithIcon from "../btn-with-icon"
import * as Yup from "yup"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import FormInput from "../form-input"
import BottomNavigator from "../admin-pages/create-course-page/bottom-navigator"

interface TestInformationProps {
  finalTests: ITitleFinalTest[]
  setFinalTests: React.Dispatch<React.SetStateAction<ITitleFinalTest[]>>
  onNext: () => void
  isReadOnly?: boolean
  initialTitle?: string
  initialDescription?: string
  onTitleDescriptionUpdate?: (title: string, description: string) => void
}

// Schema with specific validation
const schema = Yup.object({
  title: Yup.string()
    .required("Please enter final test name")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: Yup.string()
    .required("Please enter final test description")
    .min(10, "Description must be at least 10 characters"),
})

const TestInformation = ({
  finalTests,
  setFinalTests,
  onNext,
  initialTitle = "",
  initialDescription = "",
  onTitleDescriptionUpdate
}: TestInformationProps) => {
  // Use ITitleFinalTest[] for proper type checking
  const [questions, setQuestions] = useState<ITitleFinalTest[]>(finalTests.length > 0 ? finalTests : [])
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<string>("mockAnswer")
  const [dragActive, setDragActive] = useState(false)
  const [selectOpen, setSelectOpen] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      title: initialTitle || finalTests?.[0]?.title || "",
      description: initialDescription || finalTests?.[0]?.description || "",
    },
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (finalTests.length > 0) {
      setQuestions(finalTests)
    }

    // Initialize form values with initial values or first question data
    setValue("title", initialTitle || finalTests?.[0]?.title || "")
    setValue("description", initialDescription || finalTests?.[0]?.description || "")
  }, [finalTests, setValue, initialTitle, initialDescription])

  const questionTypeIcons = {
    single: <CheckCircle size={18} />,
    multiple: <CheckSquare size={18} />,
    fillBlank: <FileText size={18} />,
    image: <ImageIcon size={18} />,
  }

  const questionTypes = [
    { value: "single", label: "Single Correct Answer" },
    { value: "multiple", label: "Multiple Correct Answers" },
    { value: "fillBlank", label: "Fill in the Blank" },
    // { value: "image", label: "Image Question" },
  ]

  const getQuestionTypeLabel = (value: string) => {
    const found = questionTypes.find((item) => item.value === value)
    return found ? found.label : value
  }

  const handleAddQuestion = () => {
    const newQuestion: ITitleFinalTest = {
      title: "",
      type: "single",
      correctAnswer: [],
      mockAnswer: [""],
      answers: [],
      maxScore: 10,
      imageUrl: "",
    }
    setQuestions([...questions, newQuestion])
    setActiveQuestionIndex(questions.length)
    setActiveTab("mockAnswer")
  }

  const handleRemoveQuestion = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index, 1)
    setQuestions(updatedQuestions)

    if (activeQuestionIndex === index) {
      setActiveQuestionIndex(updatedQuestions.length > 0 ? 0 : null)
    } else if (activeQuestionIndex !== null && activeQuestionIndex > index) {
      setActiveQuestionIndex(activeQuestionIndex - 1)
    }
  }

  const handleQuestionTitleChange = (index: number, value: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index].title = value
    setQuestions(updatedQuestions)
  }

  const handleQuestionTypeChange = (index: number, value: QuestionType) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index].type = value

    // Reset correct answers when changing question type
    updatedQuestions[index].correctAnswer = []

    // Ensure there's at least one option
    if (updatedQuestions[index].mockAnswer.length < 1) {
      updatedQuestions[index].mockAnswer = [""]
    }

    setQuestions(updatedQuestions)
  }

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions]
    const oldOption = updatedQuestions[questionIndex].mockAnswer[optionIndex]
    updatedQuestions[questionIndex].mockAnswer[optionIndex] = value

    // If this option is in correctAnswer and the value changed, update correctAnswer too
    const correctAnswerIndex = updatedQuestions[questionIndex].correctAnswer.indexOf(oldOption)

    if (correctAnswerIndex !== -1) {
      updatedQuestions[questionIndex].correctAnswer[correctAnswerIndex] = value
    }

    setQuestions(updatedQuestions)
  }

  const handleAddOption = (index: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index].mockAnswer.push("")
    setQuestions(updatedQuestions)
  }

  const handleRemoveOption = (questionIndex: number, optionIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedQuestions = [...questions]

    const optionToRemove = updatedQuestions[questionIndex].mockAnswer[optionIndex]
    updatedQuestions[questionIndex].mockAnswer.splice(optionIndex, 1)

    // Also remove from correct answers if present
    updatedQuestions[questionIndex].correctAnswer = updatedQuestions[questionIndex].correctAnswer.filter(
      (answer) => answer !== optionToRemove,
    )

    setQuestions(updatedQuestions)
  }

  const handleCorrectAnswerChange = (questionIndex: number, optionIndex: number, checked: boolean) => {
    const updatedQuestions = [...questions]
    const option = updatedQuestions[questionIndex].mockAnswer[optionIndex]

    if (checked) {
      if (updatedQuestions[questionIndex].type === "single") {
        // For single choice or image questions, only one correct answer allowed
        updatedQuestions[questionIndex].correctAnswer = [option]
      } else {
        // For multiple choice questions, multiple correct answers allowed
        if (!updatedQuestions[questionIndex].correctAnswer.includes(option)) {
          updatedQuestions[questionIndex].correctAnswer.push(option)
        }
      }
    } else {
      // Remove option from correct answers
      updatedQuestions[questionIndex].correctAnswer = updatedQuestions[questionIndex].correctAnswer.filter(
        (answer) => answer !== option,
      )
    }

    setQuestions(updatedQuestions)
  }

  const handleFillBlankAnswerChange = (questionIndex: number, value: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].correctAnswer = [value]
    setQuestions(updatedQuestions)
  }

  const handleImageUpload = (questionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        const updatedQuestions = [...questions]
        updatedQuestions[questionIndex].imageUrl = imageUrl
        setQuestions(updatedQuestions)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (questionIndex: number, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        const updatedQuestions = [...questions]
        updatedQuestions[questionIndex].imageUrl = imageUrl
        setQuestions(updatedQuestions)
      }
      reader.readAsDataURL(file)
    }
  }

  const isImageUrl = (url: string): boolean => {
    // Check if it's a base64 encoded image
    if (url.startsWith('data:image/')) {
      return true;
    }
    // Check if it's a URL to an image file
    return !!url.trim().match(/\.(jpeg|jpg|gif|png)$/i);
  }

  const validateQuestions = () => {
    if (questions.length === 0) {
      return false
    }

    // Check each question thoroughly
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]

      // Check question title
      if (!question.title.trim()) {
        setActiveQuestionIndex(i)
        setActiveTab("mockAnswer")
        return false
      }

      // // For image questions, check if an image is uploaded
      // if (question.type === "image" && !question.imageUrl) {
      //   setActiveQuestionIndex(i)
      //   setActiveTab("mockAnswer")
      //   toast.error(`Question ${i + 1}: Please upload an image`)
      //   return false
      // }

      // For all question types, check mockAnswer and correct answers
      if (question.type !== "fillBlank") {
        // Check that all mockAnswer are filled
        const emptyOptionIndex = question.mockAnswer.findIndex((opt) => !opt.trim())
        if (emptyOptionIndex !== -1) {
          setActiveQuestionIndex(i)
          setActiveTab("mockAnswer")
          return false
        }

        // Check if there are at least 1 mockAnswer
        if (question.mockAnswer.filter((opt) => opt.trim()).length < 1) {
          setActiveQuestionIndex(i)
          setActiveTab("mockAnswer")
          return false
        }
      }

      // Check if there's at least one correct answer
      if (question.correctAnswer.length === 0) {
        setActiveQuestionIndex(i)
        setActiveTab("correctAnswer")
        return false
      }
    }

    return true
  }

  const handleNext = handleSubmit((formValues) => {
    if (!formValues.title.trim()) {
      toast.error("Please enter final test title")
      return
    }

    if (!formValues.description.trim()) {
      toast.error("Please enter final test description")
      return
    }

    if (!validateQuestions()) {
      toast.error("Please complete all questions before proceeding")
      return
    }

    // Update the questions with the form values
    const updatedQuestions = questions.map(question => ({
      ...question,
      title: question.title || formValues.title,
      description: question.description || formValues.description,
    }));

    // Update finalTests state
    setFinalTests(updatedQuestions);

    // Update parent component with title/description if callback exists
    if (onTitleDescriptionUpdate) {
      onTitleDescriptionUpdate(formValues.title, formValues.description);
    }

    onNext();
  })

  return (
    <div className="bg-white dark:bg-gray-900 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Test Title and Description */}
      <div className="mb-6">
        <FormInput
          id="title"
          label="Title"
          register={register("title")}
          errorMsg={errors.title?.message}
          placeholder="Enter title"
        />

        <FormInput
          id="description"
          label="Description"
          register={register("description")}
          errorMsg={errors.description?.message}
          textarea
          rows={4}
          placeholder="Enter description"
        />
      </div>

      {/* Questions Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-bold text-gray-600 dark:text-white">Questions</h3>
          <BtnWithIcon
            customClasses="text-dark_text !bg-slate-700 w-fit !rounded-sm"
            onClick={handleAddQuestion}
            icon={AiOutlinePlusCircle}
            content="Add Question"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Question List */}
          <div className="w-full md:w-1/2">
            <div className="border border-gray-200 dark:border-gray-700 rounded-sm p-4 h-[400px] overflow-y-auto">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className={`p-4 mb-3 cursor-pointer rounded-sm border ${activeQuestionIndex === index
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  onClick={() => setActiveQuestionIndex(index)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">Question {index + 1}</span>
                      <div className="inline-flex truncate items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700">
                        <span className="mr-1">{questionTypeIcons[question.type]}</span>
                        <span>{getQuestionTypeLabel(question.type)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => handleRemoveQuestion(index, e)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                    {question.title || "Untitled question"}
                  </div>

                  {/* Display small thumbnail for image questions */}
                  {/* {question.type === "image" && question.imageUrl && (
                    <div className="mt-2 border dark:border-gray-700 rounded-sm overflow-hidden h-12">
                      <img 
                        src={question.imageUrl} 
                        alt={`Question ${index + 1}`} 
                        className="h-full w-auto object-cover"
                      />
                    </div>
                  )} */}
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-16">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">No questions added yet</p>
                  <p className="text-sm text-gray-400">Click Add Question to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Question Editor */}
          <div className="w-full md:w-2/3">
            <div className="border border-gray-200 dark:border-gray-700 rounded-sm p-4 h-[400px] overflow-y-auto">
              {activeQuestionIndex !== null && activeQuestionIndex < questions.length ? (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-600 dark:text-white mb-2">Question Type</label>
                    <div className="relative">
                      <select
                        value={questions[activeQuestionIndex].type}
                        onChange={(e) => handleQuestionTypeChange(activeQuestionIndex, e.target.value as QuestionType)}
                        className="w-full p-3 pr-10 outline-none rounded-sm border dark:border-gray-700 bg-[#F5F5F5] dark:bg-slate-900 dark:text-gray-300 appearance-none cursor-pointer"
                        onClick={() => setSelectOpen(!selectOpen)}
                        onBlur={() => setSelectOpen(false)}
                      >
                        {questionTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 dark:text-gray-400 text-gray-900">
                        <svg
                          className={`w-4 h-4 transition-transform duration-900 ${selectOpen ? "rotate-180" : ""}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-600 dark:text-white mb-2">Question Title</label>
                    <input
                      type="text"
                      value={questions[activeQuestionIndex].title}
                      onChange={(e) => handleQuestionTitleChange(activeQuestionIndex, e.target.value)}
                      className="w-full outline-none border dark:border-slate-700 bg-[#f5f5f5] dark:bg-transparent rounded-sm py-[10px] px-4"
                      placeholder="Enter question title"
                    />
                  </div>

                  {/* Image Upload for Image Questions */}
                  {/* {questions[activeQuestionIndex].type === "image" && (
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-600 dark:text-white mb-2">Question Image</label>
                      <div
                        className={`border-2 border-dashed rounded-sm p-4 text-center ${dragActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20"
                          : "border-gray-300 dark:border-gray-700"
                          }`}
                        onDragEnter={(e) => handleDrag(e)}
                        onDragLeave={(e) => handleDrag(e)}
                        onDragOver={(e) => handleDrag(e)}
                        onDrop={(e) => handleDrop(activeQuestionIndex, e)}
                      >
                        {questions[activeQuestionIndex].imageUrl ? (
                          <div className="relative">
                            <img
                              src={questions[activeQuestionIndex].imageUrl}
                              alt="Question"
                              className="max-h-40 mx-auto object-contain"
                            />
                            <button
                              type="button"
                              className="mt-2 text-red-500 hover:text-red-700"
                              onClick={() => {
                                const updatedQuestions = [...questions]
                                updatedQuestions[activeQuestionIndex].imageUrl = ""
                                setQuestions(updatedQuestions)
                              }}
                            >
                              <span className="underline font-semibold">Remove</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Drag and drop an image, or click to select</p>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="image-upload"
                              onChange={(e) => handleImageUpload(activeQuestionIndex, e)}
                            />
                            <BtnWithIcon
                              customClasses="mt-3 !bg-slate-700 !text-white w-fit !rounded-sm"
                              onClick={() => document.getElementById("image-upload")?.click()}
                              icon={AiOutlineCloudUpload}
                              content="Select Image"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )} */}

                  {/* Tab Navigation */}
                  <div className="mb-4">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        className={`py-2 px-4 font-medium text-sm ${activeTab === "mockAnswer"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                          }`}
                        onClick={() => setActiveTab("mockAnswer")}
                      >
                        Options
                      </button>
                      <button
                        type="button"
                        className={`py-2 px-4 font-medium text-sm ${activeTab === "correctAnswer"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                          }`}
                        onClick={() => setActiveTab("correctAnswer")}
                      >
                        Correct Answer
                      </button>
                    </div>
                  </div>

                  {/* Options Tab */}
                  {activeTab === "mockAnswer" && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Options</label>
                        <BtnWithIcon
                          customClasses="text-sm !bg-slate-700 !text-white w-fit !rounded-sm"
                          onClick={() => handleAddOption(activeQuestionIndex)}
                          icon={AiOutlinePlusCircle}
                          content="Add Option"
                        />
                      </div>

                      {questions[activeQuestionIndex].type !== "fillBlank" ? (
                        questions[activeQuestionIndex].mockAnswer.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(activeQuestionIndex, optionIndex, e.target.value)}
                              className="w-full outline-none border dark:border-slate-700 bg-[#f5f5f5] dark:bg-transparent rounded-sm py-[10px] px-4"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <button
                              type="button"
                              onClick={(e) => handleRemoveOption(activeQuestionIndex, optionIndex, e)}
                              className="text-red-500 hover:text-red-700"
                              disabled={questions[activeQuestionIndex].mockAnswer.length <= 1}
                            >
                              <Trash2
                                size={18}
                                className={questions[activeQuestionIndex].mockAnswer.length <= 1 ? "opacity-40" : ""}
                              />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="mb-4">
                          {questions[activeQuestionIndex].mockAnswer.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2 mb-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(activeQuestionIndex, optionIndex, e.target.value)}
                                className="w-full outline-none border dark:border-slate-700 bg-[#f5f5f5] dark:bg-transparent rounded-sm py-[10px] px-4"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              <button
                                type="button"
                                onClick={(e) => handleRemoveOption(activeQuestionIndex, optionIndex, e)}
                                className="text-red-500 hover:text-red-700"
                                disabled={questions[activeQuestionIndex].mockAnswer.length <= 1}
                              >
                                <Trash2
                                  size={18}
                                  className={questions[activeQuestionIndex].mockAnswer.length <= 1 ? "opacity-40" : ""}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Correct Answer Tab */}
                  {activeTab === "correctAnswer" && (
                    <div className="mb-4">
                      {questions[activeQuestionIndex].type === "fillBlank" ? (
                        <div>
                          <label className="block text-sm font-bold text-gray-600 dark:text-white mb-2">Correct Answer</label>
                          <input
                            type="text"
                            value={questions[activeQuestionIndex].correctAnswer[0] || ""}
                            onChange={(e) => handleFillBlankAnswerChange(activeQuestionIndex, e.target.value)}
                            className="w-full outline-none border dark:border-slate-700 bg-[#f5f5f5] dark:bg-transparent rounded-sm py-[10px] px-4"
                            placeholder="Enter correct answer"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs italic text-gray-500 mb-1">
                            {questions[activeQuestionIndex].type === "single"
                              ? "Select one correct answer"
                              : "Select one or more correct answers"}
                          </p>
                          {questions[activeQuestionIndex].correctAnswer.length === 0 && (
                            <p className="text-yellow-500 italic text-sm mb-3">Please select at least one correct answer</p>
                          )}

                          {/* Correct answer selection */}
                          {questions[activeQuestionIndex].mockAnswer.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-start gap-2 mb-2 p-2 outline-none border dark:border-slate-700 bg-[#f5f5f5] dark:bg-transparent rounded-sm">
                              <input
                                type={(questions[activeQuestionIndex].type === "single") ? "radio" : "checkbox"}
                                checked={questions[activeQuestionIndex].correctAnswer.includes(option)}
                                onChange={(e) =>
                                  handleCorrectAnswerChange(activeQuestionIndex, optionIndex, e.target.checked)
                                }
                                className="h-4 w-4 mt-2"
                                disabled={!option.trim()}
                                name={questions[activeQuestionIndex].type === "single" ? `correct-answer-${activeQuestionIndex}` : undefined}
                              />
                              <div className="flex-1 mt-1">
                                <span className={`${!option.trim() ? "text-gray-400 italic" : ""}`}>
                                  {option.trim() ? option : "Empty option"}
                                </span>

                                {/* Preview of image if option is an image URL */}
                                {/* {isImageUrl(option) && (
                                  <div className="mt-1 border rounded-sm p-2 bg-gray-50 dark:bg-gray-800">
                                    <div className="w-full h-16 flex items-center justify-center overflow-hidden">
                                      <img
                                        src={option}
                                        alt={`Option ${optionIndex + 1}`}
                                        className="max-h-full object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = ""
                                          ;(e.target as HTMLImageElement).alt = "Invalid image URL"
                                        }}
                                      />
                                    </div>
                                  </div>
                                )} */}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <FileText className="h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">
                    {questions.length === 0
                      ? "Add a question to get started"
                      : "Select a question from the list to edit"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <BottomNavigator onlyNext nextHandler={handleNext} />
      </div>
    </div>
  )
}

export default TestInformation