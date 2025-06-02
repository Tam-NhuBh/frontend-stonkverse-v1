"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, Bot, Loader2 } from "lucide-react"

interface AIInstructorProps {
  courseId: string
  sessionId: number
}

interface Message {
  role: "user" | "assistant"
  content: string
}


const AIInstructor: React.FC<AIInstructorProps> = ({ courseId, sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI instructor. How can I help you with your course today?" },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputError, setInputError] = useState<string | null>(null)
  const MAX_CHARS = 500
  const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi
  const forbiddenChars = /[<>{}[\]\\]/g

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      // console.log("Sending request to AI instructor:", {
      //   chatInput: userMessage,
      //   sessionId: sessionId,
      // })

      const response = await fetch(
        "https://automation.immergreen.cc/webhook/8ad45c5a-8c9d-484b-89d3-da843e68d24f/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatInput: userMessage,
            sessionId: sessionId,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const responseText = await response.text()
      // console.log("Raw response:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
        // console.log("Parsed response data:", data)
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError)
        throw new Error("Failed to parse API response")
      }

      if (!data) {
        throw new Error("Empty response from API")
      }

      // Check all possible response fields
      const aiResponse = data.output || data.response || data.answer || data.content || data.message || data.text || data.result

      if (!aiResponse) {
        console.error("No recognized response field in data:", data)
        throw new Error("Invalid response format from API")
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
        },
      ])
    } catch (error) {
      console.error("Error calling AI instructor API:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error while processing your request. Please try again later.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (value.length > MAX_CHARS) {
      setInputError(`Exceeds ${MAX_CHARS} character limit`)
      return
    }

    if (linkRegex.test(value)) {
      setInputError("Links are not allowed")
      return
    }

    const filteredValue = value.replace(forbiddenChars, '')

    if (filteredValue !== value) {
      setInputError("Some special characters are not allowed")
    } else {
      setInputError(null)
    }

    setInput(filteredValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="border dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-800 shadow-lg">
      <div className="p-3" style={{
        background: "linear-gradient(90deg, #4d88c4 2.34%, #0da5b5 100.78%)",
      }}>
        <h3 className="text-white font-medium flex items-center gap-2">
          <Bot size={20} />
          AI Instructor
        </h3>
      </div>

      <div className="h-[300px] overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-md ${message.role === "user"
                ? "bg-[linear-gradient(90deg,_#4d88c4_2.34%,_#0da5b5_100.78%)] text-white rounded-tr-none"
                : "bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
                }`}
            >
              <div className="flex items-start gap-2">
                <span className="mt-1">
                  {message.role === "user" ? (
                    <span className="text-white" />
                  ) : (
                    <Bot size={16} className="text-gray-600 dark:text-gray-300" />
                  )}
                </span>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="mb-4 flex justify-start">
            <div className="max-w-[80%] p-3 rounded-md bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-none">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-gray-600 dark:text-gray-300" />
                <Loader2 size={16} className="animate-spin" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI instructor..."
            className={`w-full px-3 py-2 overflow-auto border ${inputError ? 'border-red-500' : 'dark:border-slate-600'} rounded-md bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 ${inputError ? 'focus:ring-red-500' : 'focus:ring-[#0da5b5]'}`}
            disabled={isLoading}
            maxLength={MAX_CHARS}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="bg-transparent dark:text-white text-black p-2 rounded-md hover:scale-110 transition-transform duration-200 hover:pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIInstructor