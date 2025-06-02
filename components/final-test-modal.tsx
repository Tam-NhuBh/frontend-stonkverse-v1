import { useEffect, useState, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./loading-spinner";
import { getFinalTestsByID } from "@/lib/fetch-data";
import type { IFinalTest, QuestionType } from "@/types";
import BtnWithIcon from "./btn-with-icon";
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaLock } from "react-icons/fa";
import { IoMdHelpCircle } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "@/lib/api-client-v1";
import { MdTimer, MdWarning } from "react-icons/md";
import Image from "next/image";

interface FinalTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  finalTestId: string;
  onTestComplete?: (passed: boolean) => void;
}

interface TestResult {
  success: boolean;
  data: {
    courseId: string;
    courseName: string;
    finalScore: number;
    quizScore: number;
    testScore: number;
    correctAnswers: number;
    totalQuestions: number;
    weightedDetails: {
      quizContribution: string;
      testContribution: string;
    };
    passingGrade: number;
    passed: boolean;
    status: string;
    isFirstTimePassing: boolean;
  };
}

const FinalTestModal: React.FC<FinalTestModalProps> = ({
  isOpen,
  onClose,
  courseId,
  finalTestId,
  onTestComplete
}) => {
  const [loading, setLoading] = useState(true);
  const [finalTest, setFinalTest] = useState<IFinalTest | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(true);
  const [testResult, setTestResult] = useState<TestResult["data"] | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (!showCompletionMessage && !isFinished) {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showCompletionMessage && !isFinished) {
        if (e.keyCode === 123) {
          e.preventDefault();
          return false;
        }

        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
          e.preventDefault();
          return false;
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCompletionMessage, isFinished]);

  // Fullscreen Management
  const enterFullscreen = () => {
    if (fullscreenRef.current) {
      if (fullscreenRef.current.requestFullscreen) {
        fullscreenRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        setIsFullscreen(true);
      } else {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Data Fetching
  useEffect(() => {
    const fetchTest = async () => {
      if (!finalTestId || finalTestId === "") {
        console.error("No finalTestId provided");
        toast.error("Could not load final test. Missing final test ID.");
        onClose();
        return;
      }

      setLoading(true);

      try {
        const response = await getFinalTestsByID(finalTestId);
        const testData = response.data || response;

        if (testData) {
          const processedTest: IFinalTest = {
            id: testData._id,
            title: testData.title,
            description: testData.description || "",
            tests: (testData.tests || []).map((test: any) => ({
              _id: test._id,
              title: test.title,
              description: test.description || "",
              answers: test.answers || [],
              correctAnswer: test.correctAnswer || [],
              mockAnswer: test.mockAnswer || [],
              maxScore: test.maxScore || 10,
              type: test.type as QuestionType,
              imageUrl: test.imageUrl || "",
              createdAt: test.createdAt ? new Date(test.createdAt) : undefined,
            })),
            score: testData.score || 0,
            settings: {
              testDuration: testData.settings?.testDuration
                ? testData.settings.testDuration
                : { hours: 1, minutes: 0 },
              numberOfQuestions: testData.tests?.length || 0,
              instructionsMessage: testData.settings?.instructionsMessage || "Complete all questions within the time limit",
              pageLayout: testData.settings?.pageLayout || "",
              gradingDisplay: testData.settings?.gradingDisplay || "",
              completionMessage: testData.settings?.completionMessage || "Once submitted, you won't be able to change your answers."
            }
          };

          setFinalTest(processedTest);

          const duration = ((processedTest.settings.testDuration.hours || 0) * 60 +
            (processedTest.settings.testDuration.minutes || 0)) * 60;
          setTimeLeft(duration || 1800);

        } else {
          toast.error("Could not load final test. Please try again later.");
          onClose();
        }
      } catch (error) {
        console.error("Error fetching final test:", error);
        toast.error("Error loading final test. Please try again later.");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && finalTestId) {
      fetchTest();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, finalTestId, onClose]);

  // Event Handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) &&
        (isFinished || showCompletionMessage)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, isFinished, showCompletionMessage]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const startTest = () => {
    setShowCompletionMessage(false);
    setUserAnswers({});

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 300) {
          setTimeWarning(true);
          toast.error("5 minutes remaining!");
        }

        if (prevTime <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmitTest();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    enterFullscreen();
  };

  // Thêm useEffect này sau các useEffect khác
  useEffect(() => {
    const handleFullscreenEsc = (e: KeyboardEvent) => {
      // Chặn ESC thoát fullscreen khi đang làm bài
      if (!showCompletionMessage && !isFinished && isFullscreen) {
        if (e.key === 'Escape' || e.keyCode === 27) {
          e.preventDefault();
          e.stopPropagation();
          // Giữ fullscreen
          if (!document.fullscreenElement && fullscreenRef.current) {
            enterFullscreen();
          }
        }
      }
    };

    document.addEventListener('keydown', handleFullscreenEsc, true);

    return () => {
      document.removeEventListener('keydown', handleFullscreenEsc, true);
    };
  }, [showCompletionMessage, isFinished, isFullscreen]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answer: string, questionType: QuestionType, questionId: string) => {
    if (!finalTest) return;

    setUserAnswers(prev => {
      const newAnswers = { ...prev };

      if (questionType === "single") {
        newAnswers[questionId] = [answer];
      } else if (questionType === "multiple") {
        const currentAnswers = prev[questionId] || [];
        newAnswers[questionId] = currentAnswers.includes(answer)
          ? currentAnswers.filter(a => a !== answer)
          : [...currentAnswers, answer];
      } else if (questionType === "fillBlank") {
        newAnswers[questionId] = [answer];
      }

      return newAnswers;
    });
  };

  const confirmSubmitTest = () => {
    if (finalTest) {
      const unansweredQuestions = finalTest.tests.filter(question => {
        const questionId = (question as any)._id.toString();
        return !userAnswers[questionId] || userAnswers[questionId].length === 0;
      });

      if (unansweredQuestions.length > 0) {
        toast.error(`You have ${unansweredQuestions.length} unanswered questions. Please complete all questions before submitting.`);

        const firstUnansweredQuestion = unansweredQuestions[0];
        const questionElement = document.getElementById(`question-${(firstUnansweredQuestion as any)._id}`);
        if (questionElement) {
          questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          questionElement.classList.add('highlight-question');
          setTimeout(() => {
            questionElement.classList.remove('highlight-question');
          }, 2000);
        }

        return;
      }
    }

    setShowConfirmation(true);
  };

  const handleSubmitTest = async () => {
    if (isSubmitting || !finalTest) return;
    setIsSubmitting(true);
    setShowConfirmation(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (isFullscreen) {
      exitFullscreen();
    }

    try {
      const answers = finalTest.tests.map(question => {
        const questionId = (question as any)._id.toString();
        return {
          questionId,
          answer: userAnswers[questionId] || []
        };
      });

      const response = await axiosClient.put('add-answer-final-test', {
        courseId,
        finalTestId,
        answers
      });

      if (response) {
        setTestResult(response.data);
        toast.success("Final test submitted successfully!");

        if (onTestComplete) {
          onTestComplete(response.data?.passed || false);
        }
      }
    } catch (error: any) {
      console.error("Error submitting final test:", error);
      toast.error("An error occurred while submitting your final test. Please try again!");
    } finally {
      setIsFinished(true);
      setShowCompletionMessage(true);
      setIsSubmitting(false);
    }
  };

  // Render Methods
  const renderTimeWarning = () => {
    if (!timeWarning) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center"
      >
        <MdTimer className="mr-2" size={20} />
        <span className="font-medium">Time is running out! {formatTime(timeLeft)}</span>
      </motion.div>
    );
  };

  const renderConfirmation = () => {
    if (!showConfirmation) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="text-center mb-4">
            <div className="inline-block p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300 mb-3">
              <FaExclamationTriangle size={24} />
            </div>

            <h3 className="text-lg font-semibold mb-2">Submit final test</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Are you sure you want to submit your final test? This action cannot be undone.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-3 mb-4 text-left">
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              {finalTest?.settings.completionMessage}
            </p>
          </div>

          <div className="flex gap-3 justify-between">
            <BtnWithIcon
              content="Cancel"
              onClick={() => setShowConfirmation(false)}
              customClasses="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors font-medium"
            />
            <BtnWithIcon
              content="Submit"
              onClick={handleSubmitTest}
              customClasses="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors font-medium"
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCompletionMessage = () => {
    if (!finalTest) return null;

    if (isFinished && testResult) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="mb-6">
              <div className={`inline-block p-4 rounded-full mb-4 ${testResult.passed
                ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300"
                : "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300"
                }`}>
                {testResult.passed ? <FaCheckCircle size={32} /> : <FaTimesCircle size={32} />}
              </div>

              <h2 className="text-2xl font-bold mb-3">
                {testResult.passed ? "Final test passed" : "Final test completed"}
              </h2>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Final result</p>
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-200">
                  {testResult.finalScore.toFixed(1)}%
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
                {/* <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Final Test</p> */}
                {/* <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {testResult.testScore.toFixed(1)}%
                </p> */}
                <p className="text-xs text-gray-500 mt-1">
                  Correct: {testResult.correctAnswers}/{testResult.totalQuestions}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Quiz score</p>
                  <p className="text-xl font-semibold">{testResult.quizScore.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">Weight: {testResult.weightedDetails.quizContribution}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Final test</p>
                  <p className="text-xl font-semibold">{testResult.testScore.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">Weight: {testResult.weightedDetails.testContribution}%</p>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span>Passing Grade: {testResult.passingGrade}%</span>
              </div>

              <div className={`inline-block px-4 py-2 rounded-lg text-sm font-medium mb-6 ${testResult.passed
                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100"
                : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100"
                }`}>
                {testResult.passed ? "PASSED" : "FAILED"}
              </div>

              {testResult.isFirstTimePassing && testResult.passed && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 p-4 mb-6 text-left">
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    <strong>First-time pass!</strong> A confirmation email has been sent to your inbox.
                  </p>
                </div>
              )}
            </div>

            <BtnWithIcon
              content="Close"
              onClick={onClose}
              customClasses="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors font-medium"
            />
          </div>
        </motion.div>
      );
    }
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl mx-auto"
      >
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-block p-4 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 mb-4">
              <IoMdHelpCircle size={32} />
            </div>

            <h2 className="text-2xl font-bold mb-3">{finalTest.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {finalTest.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-sm p-4">
              <div className="flex items-center justify-center mb-2">
                <MdTimer className="text-blue-500 dark:text-blue-400 mr-2" size={20} />
                <p className="text-sm text-gray-500 dark:text-gray-400">Time limit</p>
              </div>
              <p className="text-lg font-semibold">
                {finalTest.settings.testDuration.hours}h {finalTest.settings.testDuration.minutes}m
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-sm p-4">
              <div className="flex items-center justify-center mb-2">
                <FaLock className="text-blue-500 dark:text-blue-400 mr-2" size={16} />
                <p className="text-sm text-gray-500 dark:text-gray-400">Questions</p>
              </div>
              <p className="text-lg font-semibold">{finalTest.settings.numberOfQuestions}</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-6 text-left">
            <div className="flex">
              <MdWarning className="text-yellow-500 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                {finalTest.settings.instructionsMessage}
              </p>
            </div>
          </div>

          <BtnWithIcon
            content="Start"
            onClick={startTest}
            customClasses="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors font-medium"
          />
        </div>
      </motion.div>
    );
  };

  const renderAllQuestions = () => {
    if (!finalTest || showCompletionMessage || isFinished) return null;

    const totalQuestions = finalTest.tests.length;
    const answeredQuestions = Object.keys(userAnswers).filter(key =>
      userAnswers[key] && userAnswers[key].length > 0
    ).length;
    const progressPercent = (answeredQuestions / totalQuestions) * 100;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 mb-6 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`px-4 py-2 rounded-sm flex items-center text-sm font-medium ${timeLeft < 300
                ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}>
                <MdTimer className="mr-2" size={16} />
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {answeredQuestions}/{totalQuestions} Answered
              </div>

              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6 pb-20">
          {finalTest.tests.map((question, index) => {
            const questionId = (question as any)._id.toString();
            const selectedAnswers = userAnswers[questionId] || [];
            const isAnswered = selectedAnswers.length > 0;

            return (
              <motion.div
                key={questionId}
                id={`question-${questionId}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 highlight-animation"
              >
                <div className="mb-4">
                  <div className="flex items-start mb-3">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-2">{question.title}</h3>

                      {question.imageUrl && (
                        <div className="mb-4 relative">
                          <img
                            src={question.imageUrl}
                            alt={`Question ${index + 1}`}
                            className="max-h-48 object-contain rounded-sm shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                {question.type === "fillBlank" ? (
                  <div className="mb-4">
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-sm dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter your answer..."
                      value={selectedAnswers[0] || ""}
                      onChange={(e) => handleAnswerSelect(e.target.value, "fillBlank", questionId)}
                    />
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {question.mockAnswer.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 border rounded-sm cursor-pointer transition-all ${selectedAnswers.includes(option)
                          ? "bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-600"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                          }`}
                        onClick={() => handleAnswerSelect(option, question.type, questionId)}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 flex items-center justify-center border rounded-${question.type === "multiple" ? "sm" : "full"
                            } mr-3 transition-colors ${selectedAnswers.includes(option)
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-gray-300 dark:border-gray-500"
                            }`}>
                            {selectedAnswers.includes(option) && (
                              <FaCheckCircle size={12} />
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Indicator */}
                <div className="flex justify-end">
                  {isAnswered ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                      <FaCheckCircle className="mr-1" size={10} /> Answered
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                      <FaExclamationTriangle className="mr-1" size={10} /> Not answered
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Fixed Bottom Submit */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 shadow-lg border-t border-gray-200 dark:border-gray-700 z-10">
          <div className="max-w-4xl mx-auto flex justify-center">

            <BtnWithIcon
              content={isSubmitting ? "Submitting..." : "Submit"}
              onClick={confirmSubmitTest}
              disabled={isSubmitting}
              customClasses="px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={fullscreenRef}
          className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-[9999] overflow-y-auto"
        >
          <style jsx global>{`
            .highlight-animation {
              transition: all 0.2s ease;
            }
            .highlight-question {
              box-shadow: 0 0 0 2px #3b82f6;
              transform: translateY(-1px);
            }
          `}</style>

          <div className="min-h-screen px-4 py-6">
            {renderTimeWarning()}

            <div ref={modalRef} className="relative">
              {(isFinished || showCompletionMessage) && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md z-10 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <IoMdClose size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <LoadingSpinner />
                </div>
              ) : showCompletionMessage ? (
                renderCompletionMessage()
              ) : (
                renderAllQuestions()
              )}
            </div>
          </div>

          {renderConfirmation()}
        </div>
      )}
    </AnimatePresence>
  );
};

export default FinalTestModal;