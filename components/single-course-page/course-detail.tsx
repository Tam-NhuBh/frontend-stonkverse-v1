"use client"

import { type FC, JSX, useEffect, useState } from "react"
import type { IFetchedCourse } from "../home-page/courses"
import useUserInfo from "@/hooks/useUserInfo"
import DotSpan from "../dot-span"
import { formatShortDate, formatVideoLength } from "@/lib/format-data"
import NextImage from "../next-image"
import CourseContentTabs from "../admin-pages/create-course-page/course-content-tabs"
import { BiBarChartAlt2, BiCommentDetail, BiLogIn, BiSolidStar, BiStar } from "react-icons/bi"
import CoursePlayer from "../course-player"
import { MdKey, MdLiveTv } from "react-icons/md"
import { CgTimelapse } from "react-icons/cg"
import { RiFileList2Line } from "react-icons/ri"
import BtnWithIcon from "../btn-with-icon"
import { PiStudentBold } from "react-icons/pi"
import Comment from "@/components/comment"
import { Box, Modal, Rating } from "@mui/material"
import CourseContentList from "./course-content-list"
import { getStripePublishableKey } from "@/lib/fetch-data"
import { loadStripe } from "@stripe/stripe-js"
import { createPaymentIntent, getVerifyPromotion } from "@/lib/mutation-data"
import { Elements } from "@stripe/react-stripe-js"
import CheckOutForm from "./check-out-form"
import { FaInfoCircle } from "react-icons/fa"
import NoContentYet from "../no-content-yet"
import type { ICourseData, IReview } from "@/types"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import CustomModal from "../custom-modal"
import Login from "../auth/login"
import { useSession } from "next-auth/react"
import { useSocialAuthMutation } from "@/store/auth/auth-api"
import { useLoadUserQuery } from "@/store/api-slice"

interface Props {
  courseDetail: IFetchedCourse
  courseId: string
  refetch?: () => void

}

const CourseDetail: FC<Props> = ({ courseDetail, courseId }): JSX.Element => {
  const user = useUserInfo()
  const [publishableKey, setPublishableKey] = useState("")
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState("")
  const router = useRouter()
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [openModalLogin, setOpenModalLogin] = useState(false)
  const [route, setRoute] = useState("login")
  const {
    data: userData,
    isLoading,
    refetch,
  } = useLoadUserQuery(undefined, {});

  const isPurchased = user?.courses?.find((course: { courseId: string }) => {
    return course.courseId === courseId
  })

  let discountPercentage = 0
  if (courseDetail?.estimatedPrice) {
    discountPercentage = ((courseDetail?.estimatedPrice - courseDetail?.price) / courseDetail?.estimatedPrice) * 100
  }

  const discountPercentagePrice = discountPercentage.toFixed(0) || 0

  const courseLength: number = courseDetail?.courseData.reduce((acc: number, cur: ICourseData) => {
    return acc + cur.videoLength
  }, 0)

  const orderHandler = () => {
    if (!user) {
      setOpenModal(false)
      setOpenModalLogin(true)
      setRoute("login")

      return
    }
    setOpenModal(true)
    setOpenModalLogin(false)

  }

  const orderHandlerCouponApply = async () => {
    if (!user) {
      setOpenModalLogin(true)
      setRoute("login")
      return
    }

    setIsApplying(true)
    const promotionData = {
      course: courseId,
      code: couponCode.trim(),
    }

    try {
      const response = await getVerifyPromotion(promotionData)
      if (response?.data?.valid) {
        setCouponDiscount(response.data.discount || 0)
        toast.success("Coupon applied successfully!")
      } else {
        toast.error(response?.message || "Invalid coupon code")
        setCouponDiscount(0)
      }
    } catch (error) {
      toast.error("Failed to apply coupon")
      setCouponDiscount(0)
    } finally {
      setIsApplying(false)
    }
  }

  const fetchStripeKey = async () => {
    const stripePublishableKey = await getStripePublishableKey()
    setPublishableKey(stripePublishableKey)
  }

  const handleCourseAccess = () => {
    router.push(`/course-access/${courseDetail?._id}`)
  }

  // const createIntent = async (amount: number) => {
  //   const clientSecret = await createPaymentIntent(amount);
  //   setClientSecret(clientSecret);
  // };

  const createIntent = async (amount: number) => {
    const discountedAmount = couponDiscount > 0 ? Math.round(amount - (amount * couponDiscount) / 100) : amount
    const clientSecret = await createPaymentIntent(discountedAmount)
    setClientSecret(clientSecret)
  }

  useEffect(() => {
    fetchStripeKey()
  }, [])

  useEffect(() => {
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey))
    }

    if (courseDetail) {
      const amount = Math.round(courseDetail?.price * 100)
      createIntent(amount)
    }
  }, [publishableKey, courseDetail, couponDiscount])

  const formattedReviews = Array.isArray(courseDetail?.reviews) ? [...courseDetail.reviews].reverse() : []

  return (
    <div className="container my-8">
      <div className="w-full flex gap-16 max-[845px]:flex-col-reverse">
        <div className="w-[60%] max-[845px]:w-full">
          <h1 className="text-gradient text-2xl font-bold">{courseDetail?.name}</h1>

          <div className="flex items-center mt-6 gap-4 flex-wrap">
            <div className="main-gradient text-dark_text w-fit px-2 py-1 rounded-[5px]">{courseDetail?.tags}</div>

            <div className="flex items-center gap-1">
              <DotSpan /> <span>{courseDetail?.purchased}</span> <span className="text-slate-500">Students</span>
            </div>

            <div className="flex items-center gap-1">
              <DotSpan /> <span className="text-slate-500">Last updated</span>{" "}
              <span>{formatShortDate(Date.now())}</span>
            </div>

            <div className="flex items-center gap-1">
              <DotSpan /> <span className="text-slate-500">Ratings</span>{" "}
              <Rating
                name="half-rating dark:text-dark_text text-tertiary"
                defaultValue={courseDetail?.ratings}
                precision={0.5}
                readOnly
                size="small"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full overflow-hidden relative mt-6">
              <NextImage
                src="https://res.cloudinary.com/dfhheac8o/image/upload/v1696561586/avatars/qtwgyytoxntruc8hkfr6.png"
                alt=""
              />
            </div>
            <span className="mt-6 text-slate-500 dark:text-dark_text">
              Created By <b className="text-tertiary dark:text-secondary">{user?.name}</b>
            </span>
          </div>

          <h2 className="mt-8 font-bold text-xl mb-3">What you&apos;ll learn In This Course</h2>
          <ul className="list-disc text-slate-500 dark:text-dark_text space-y-2">
            {courseDetail?.benefits.map((benefit: { title: string }, index: number) => (
              <li key={index} className="ml-4">
                {benefit?.title}
              </li>
            ))}
          </ul>

          <div className="mt-14">
            <CourseContentTabs
              prerequisites={courseDetail?.prerequisites as { title: string }[]}
              forWho={courseDetail?.forWho as { title: string }[]}
              description={courseDetail?.description as string}
              curr={courseDetail?.curriculum?.url as string}
            />
          </div>

          <div className="mb-10">
            <CourseContentList list={courseDetail?.courseData} courseLength={courseLength}
              finalTest={courseDetail?.finalTest}

            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <p className="flex items-center gap-1 font-bold text-xl">
              <BiSolidStar className="-mt-1 !text-[#b4690e] dark:!text-[#faaf00]" />
              <span>{courseDetail?.ratings} Course Rating</span>
            </p>

            <DotSpan />

            <p className="font-bold text-xl">{courseDetail?.reviews?.length} Reviews</p>
          </div>

          {formattedReviews.length ? (
            <div className="grid grid-cols-2 gap-6 max-[722px]:grid-cols-1">
              {formattedReviews.map((review: IReview, index) => (
                <Comment
                  key={review?._id.toString()}
                  name={review?.user?.name}
                  avatar={review?.user?.avatar?.url}
                  content={review?.comment}
                  rating={review?.rating}
                  createdAt={review?.createdAt}
                  showReplyButton={false}
                />
              ))}
            </div>
          ) : (
            <NoContentYet description="There aren't any reviews for this course yet" />
          )}
        </div>

        <div className="flex-1 custom-shadow dark:border dark:border-slate-700 z-0 h-fit">
          <CoursePlayer videoUrl={courseDetail?.demoUrl} title={courseDetail?.name} />

          <div className="mt-2 p-4 gap-2 relative">
            {isPurchased ? (
              <div>
                <p className="flex items-center gap-1 text-lg mb-2 font-semibold">
                  <FaInfoCircle color="#0da5b5" className="max-[1100px]:hidden" /> You purchased this course on{" "}
                  {formatShortDate(isPurchased?.createdDate)}
                </p>
                <button onClick={handleCourseAccess} className="primary-btn !w-full !my-4 !block">
                  <span className="flex items-center justify-center gap-1">
                    Go to course
                    <BiLogIn size={22} className="-mt-[2px]" />
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="mr-2 font-bold text-3xl text-gradient">
                  {courseDetail?.price === 0 ? "Free" : "$" + courseDetail?.price + ".00"}
                </span>

                {courseDetail?.estimatedPrice && courseDetail?.estimatedPrice > courseDetail?.price && (
                  <span className="line-through text-xl opacity-50">${courseDetail?.estimatedPrice}.00</span>
                )}

                {courseDetail?.estimatedPrice && courseDetail?.estimatedPrice > courseDetail?.price && (
                  <span className="ml-auto text-slate-500 font-bold">Discount {discountPercentagePrice}%</span>
                )}
              </div>
            )}

            <div className="course-info-item">
              <span className="flex gap-1 items-center">
                <BiCommentDetail className="text-secondary -mt-[2px]" />
                Reviews
              </span>
              <span className="font-bold text-slate-500">{courseDetail?.reviews?.length} Reviews</span>
            </div>

            <div className="course-info-item">
              <span className="flex gap-1 items-center">
                <BiStar className="text-secondary -mt-1" />
                Rating
              </span>
              <span className="font-bold text-slate-500 ">{courseDetail?.ratings} Scores</span>
            </div>

            <div className="course-info-item">
              <span className="flex gap-1 items-center">
                <MdLiveTv className="text-secondary -mt-1" />
                Live Class
              </span>
              <span className="font-bold text-slate-500">No</span>
            </div>

            <div className="course-info-item">
              <span className="flex gap-1 items-center">
                <BiBarChartAlt2 className="text-secondary -mt-1" />
                Category
              </span>
              <span className="font-bold text-slate-500">{courseDetail?.category}</span>
            </div>

            <div className="course-info-item">
              <span className="flex gap-1 items-center">
                <CgTimelapse className="text-secondary -mt-[2px]" />
                Duration
              </span>
              <span className="font-bold text-slate-500">{formatVideoLength(courseLength)}</span>
            </div>

            <div className="course-info-item">
              <span className="flex gap-1 items-center">
                <RiFileList2Line className="text-secondary -mt-[2px]" />
                Lectures
              </span>
              <span className="font-bold text-slate-500">{courseDetail?.courseData?.length || 0} Lecture</span>
            </div>

            {/* <div className="course-info-item">
              <span className="flex gap-1 items-center">
                <MdOutlineSource className="text-secondary -mt-1" />
                Resource
              </span>
              <span className="font-bold text-slate-500">1 Downloadable</span>
            </div> */}

            <div className="course-info-item">
              <span className="flex gap-1 items-center">
                <PiStudentBold className="text-secondary -mt-[2px]" />
                Students
              </span>
              <span className="font-bold text-slate-500">{courseDetail?.purchased} Students</span>
            </div>

            <div className="course-info-item">
              <span className="flex gap-1 items-center">
                <MdKey className="text-secondary -mt-1" />
                Access
              </span>
              <span className="font-bold text-slate-500">Lifetime</span>
            </div>

            {!isPurchased && (
              <>
                <div className="flex items-center h-[45px] w-full">
                  <input
                    type="text"
                    placeholder="Apply Coupon"
                    className="flex-1 bg-[#f5f5f5] px-4 h-full py-3 rounded-l-[5px] outline-none text-tertiary"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <BtnWithIcon
                    content={isApplying ? "Applying..." : "Apply"}
                    customClasses="!rounded-l-none !h-full"
                    onClick={orderHandlerCouponApply}
                    disabled={isApplying}
                  />
                </div>
                <BtnWithIcon
                  content={`Buy Now ${couponDiscount > 0
                    ? "$" + (courseDetail?.price - (courseDetail?.price * couponDiscount) / 100).toFixed(2)
                    : "$" + courseDetail?.price
                    }`}
                  customClasses="w-full mt-4"
                  onClick={orderHandler}
                />
              </>
            )}

            {/* <p className="text-slate-500 dark:text-dark_text text-sm mt-6 mb-4 text-center">
              29-Day Money-Back Guarantee
            </p> */}
          </div>
        </div>
      </div>

      {openModal && (
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box className="modal-content-wrapper">
            {stripePromise && clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckOutForm setOpenModal={setOpenModal} courseDetail={courseDetail} />
              </Elements>
            )}
          </Box>
        </Modal>
      )}

      {openModalLogin && (
        <CustomModal
          openModal={openModalLogin}
          setOpenModal={setOpenModalLogin}
          setRoute={setRoute}
          Component={Login}
          refetch={refetch} />
      )}
    </div>
  )
}

export default CourseDetail

