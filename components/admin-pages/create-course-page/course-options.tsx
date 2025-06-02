import type { Dispatch, FC, JSX, SetStateAction } from "react"
import { IoMdCheckmark } from "react-icons/io"

interface Props {
  active: number
  setActive: Dispatch<SetStateAction<number>>
}

const steps = [
  { number: 1, name: "Course Information" },
  { number: 2, name: "Course Options" },
  { number: 3, name: "Course Content" },
  { number: 4, name: "Course Preview" },
]

const CourseOptions: FC<Props> = ({ active, setActive }): JSX.Element => {
  return (
    <div>
      {steps.map((step, index) => (
        <div className="w-full flex py-5 items-center" key={index}>
          <div
            className={`w-[35px] h-[35px] rounded-full grid place-items-center ${
              active + 1 > index ? "bg-[#3e4396]" : "bg-[#384766]"
            } relative text-dark_text`}
          >
            {active > index ? <IoMdCheckmark size={25} /> : <span>{step.number}</span>}
            {index !== steps.length - 1 && (
              <div
                className={`absolute h-[30px] w-1 ${active > index ? "bg-[#3e4396]" : "bg-[#384766]"} bottom-[-100%]`}
              />
            )}
          </div>
          <h5 className={`pl-3 dark:text-dark_text text-black text-lg`}>{step.name}</h5>
        </div>
      ))}
    </div>
  )
}

export default CourseOptions

