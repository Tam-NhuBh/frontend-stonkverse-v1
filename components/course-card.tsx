import { FC } from "react";
import Link from "next/link";
import NextImage from "./next-image";
import { FaListUl } from "react-icons/fa";
import { MdOutlinePeopleAlt } from "react-icons/md";
import StyledRating from "./styled-rating";
import { IFetchedCourse } from "./home-page/courses";

interface Props {
  course: IFetchedCourse;
  showProgress?: boolean;
}

const CourseCard: FC<Props> = ({
  course,
  showProgress = false,
}) => {
  const progress = course.percentAccount || 0;
  const progressDetails = course.progressDetails;

  return (
    <div className="rounded-[5px] shadow-md dark:border-none dark:bg-slate-500 bg-white dark:bg-opacity-20 custom-hover cursor-pointer flex flex-col h-full">
      <Link
        href={`/course/${course._id}`}
        className="block relative w-full aspect-video"
      >
        <NextImage
          src={course.thumbnail.url}
          alt={course.name}
          className="rounded-t-[2px] object-cover"
        />

        {showProgress && progress > 0 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-sm font-medium">
            {progress}%
          </div>
        )}
      </Link>

      <div className="p-4 dark:text-dark_text text-tertiary flex flex-col flex-grow">
        {showProgress && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Learning progress
              </span>
              <span className="text-xs font-semibold text-primary">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  background: "linear-gradient(90deg, #4d88c4 2.34%, #0da5b5 100.78%)",
                  width: `${progress}%`
                }}
              />
            </div>
            {progressDetails && (
              <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                <span>
                  {progressDetails.completedLessons}/{progressDetails.totalLessons} Lectures
                </span>
                {progressDetails.hasFinalTest && progressDetails.finalTestCompleted && (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Final test completed
                  </span>
                )}
              </div>
            )}

          </div>
        )}

        <h3 className="font-semibold text-lg text-gradient line-clamp-2 min-h-[3rem]">
          <Link href={`/course/${course._id}`}>{course.name}</Link>
        </h3>

        <Link
          href={`/course/${course._id}`}
          className="flex justify-between my-2 max-[320px]:block min-h-[1.75rem]"
        >
          <StyledRating
            defaultValue={course.ratings || 0}
            readOnly
            size="small"
            customClasses="mt-1"
          />
          <span className="flex text-sm items-center gap-1 font-normal text-tertiary dark:text-dark_text">
            <MdOutlinePeopleAlt className="-mt-[2px]" size={16} />/
            <span className="text-base">{course.purchased}</span> Students
          </span>
        </Link>

        <div className="flex justify-between my-2 max-[320px]:block mt-auto">
          <div className="flex items-center">
            <span className="mr-2 font-bold text-2xl text-gradient">
              {course.price === 0 ? "Free" : "$" + course.price + ".00"}
            </span>
            {course.estimatedPrice && course.estimatedPrice > course.price && (
              <span className="line-through text-lg opacity-50">
                ${course.estimatedPrice}.00
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 font-normal text-tertiary dark:text-dark_text text-sm">
            <FaListUl className="-mt-[3px]" size={13} />/
            <span className="text-base">{course.courseData.length}</span>{" "}
            Lectures
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;