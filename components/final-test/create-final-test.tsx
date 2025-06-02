"use client"

import { useEffect, useState } from "react"
import { Check } from 'lucide-react'
import { toast } from "react-hot-toast"
import TestSettings from "./final-test-settings"
import TestOverview from "./final-test-overview"
import type { ITitleFinalTest, TestSettings as TestSettingsType, IFinalTest } from "@/types"
import { createFinalTest, editFinalTest } from "@/lib/mutation-data"
import TestInformation from "./final-test-infomation"

interface Props {
  courseId: string;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: IFinalTest | null;
}

const CreateFinalTest = ({ courseId, onClose, onSuccess, initialData }: Props) => {
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [finalTests, setFinalTests] = useState<ITitleFinalTest[]>([])
  const [testTitle, setTestTitle] = useState("")
  const [testDescription, setTestDescription] = useState("")

  const [testSettings, setTestSettings] = useState<TestSettingsType>({
    testDuration: { hours: 1, minutes: 0 },
    numberOfQuestions: 10,
    pageLayout: "all",
    gradingDisplay: "score",
    instructionsMessage: "",
    completionMessage: "",
  })

  const steps = [
    { number: 1, name: "Test Information" },
    { number: 2, name: "Test Settings" },
    { number: 3, name: "Test Overview" },
  ]

  useEffect(() => {
    if (initialData) {
      setTestTitle(initialData.title)
      setTestDescription(initialData.description || "")
      
      if (initialData.tests && Array.isArray(initialData.tests) && initialData.tests.length > 0) {
        setFinalTests(initialData.tests)
      }
      
      if (initialData.settings) {
        setTestSettings({
          ...testSettings,
          ...initialData.settings,
          testDuration: initialData.settings.testDuration || testSettings.testDuration,
          numberOfQuestions: initialData.settings.numberOfQuestions || testSettings.numberOfQuestions,
          instructionsMessage: initialData.settings.instructionsMessage || testSettings.instructionsMessage,
          completionMessage: initialData.settings.completionMessage || testSettings.completionMessage,
         
        })
      }
    }
  }, [initialData])

  const handleNext = () => setActiveStep((prev) => prev + 1)
  const handleBack = () => setActiveStep((prev) => prev - 1)
  
  const updateTitleAndDescription = (title: string, description: string) => {
    setTestTitle(title)
    setTestDescription(description)
  }

  const handleSubmit = async () => {
    if (!finalTests || finalTests.length === 0) {
      toast.error("Please add at least one question")
      return
    }

    if (!courseId) {
      toast.error("Course ID is missing")
      return
    }

    try {
      setIsSubmitting(true)

      const finalTestSettings: TestSettingsType = {
        ...testSettings,
        course: courseId,
      };

      const finalTestData: IFinalTest = {
        title: testTitle,
        description: testDescription,
        tests: finalTests,
        score: 0,
        settings: finalTestSettings 
      };

      if (initialData?.id) {
        finalTestData.id = initialData.id;
      }

      const payload = {
        finalTest: finalTestData
      };

      if (initialData?.id) {
        await editFinalTest(initialData.id, payload)
        toast.success("Final test updated successfully!")
      } else {
        await createFinalTest(courseId, payload)
        toast.success("Final test created successfully!")
      }

      onClose()
      onSuccess()
    } catch (error: any) {
      console.error("Error saving final test:", error)
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save final test"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen mt-5">
      <div className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="sticky top-1 bg-white dark:bg-gray-900 rounded-sm border dark:border-gray-600 shadow-sm p-4 mb-6">
            <div className="relative">
              <div className="flex justify-between">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex flex-col items-center relative z-10 ${activeStep === step.number - 1 ? "text-[#3e4396]" : "text-[#384766]"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${activeStep >= step.number - 1 ? "bg-[#3e4396] text-white" : "bg-[#384766] text-white"}`}
                    >
                      {activeStep > step.number - 1 ? <Check className="h-5 w-5" /> : step.number}
                    </div>
                    <div className="text-xs font-medium text-center">{step.name}</div>
                  </div>
                ))}
              </div>
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                <div className="h-full bg-[#3e4396] transition-all duration-300" style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            {activeStep === 0 && (
              <TestInformation 
                finalTests={finalTests} 
                setFinalTests={setFinalTests} 
                onNext={handleNext} 
                initialTitle={testTitle}
                initialDescription={testDescription}
                onTitleDescriptionUpdate={updateTitleAndDescription}
              />
            )}

            {activeStep === 1 && (
              <TestSettings
                testSettings={testSettings}
                setTestSettings={setTestSettings}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {activeStep === 2 && (
              <TestOverview
                finalTests={finalTests}
                testSettings={testSettings}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                courseId={courseId}
                testTitle={testTitle}
                testDescription={testDescription}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateFinalTest