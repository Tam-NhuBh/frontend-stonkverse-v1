"use client"

import { type FC, useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Modal, Box } from "@mui/material"
import type { GridColDef } from "@mui/x-data-grid"
import { AddCircle, Visibility } from "@mui/icons-material"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as Yup from "yup"
import { useGetAllCoursesAdminQuery, useDeleteCourseMutation } from "@/store/course/course-api"

// Components
import DataTable from "@/components/admin-pages/data-table"
import BtnWithIcon from "@/components/btn-with-icon"
import BtnWithLoading from "@/components/btn-with-loading"
import FormInput from "@/components/form-input"
import PromotionModal from "./promotion-management"
import { createPromotion, deletePromotionById } from "@/lib/mutation-data"
import { getPromotionsByCourse } from "@/lib/fetch-data"
import useUserInfo from "@/hooks/useUserInfo"

interface Course {
  _id: string
  name: string
  ratings: number
  purchased: number
  createdAt: string
}

interface IPromotion {
  id?: string
  code: string
  course: string
  expDate: Date
  percentOff: number
  usageLimit: number
  usageCount: number
}

interface PromotionFormValues {
  code: string
  course?: string
  expDate: string
  percentOff: number
  usageLimit: number
}

/// Validation Schema
const promotionSchema = Yup.object({
  code: Yup.string().required("Please enter promotion code").max(20, "Promotion code must be at most 20 characters"),
  percentOff: Yup.number()
    .required("Please enter discount percentage")
    .min(1, "Discount must be at least 1%")
    .max(100, "Discount cannot exceed 100%"),
  usageLimit: Yup.number()
    .required("Please enter usage limit")
    .min(1, "Usage limit must be at least 1")
    .max(1000, "Usage limit cannot exceed 1000"),
  expDate: Yup.string()
    .required("Please enter expiry date")
    .test("is-future-date", "Expiry date must be in the future", (value) => new Date(value) > new Date()),
})

const generatePromotionCode = () => `PROMO${Math.random().toString(36).substring(2, 7).toUpperCase()}`

const getDefaultExpiryDate = () => {
  const nextYear = new Date()
  // nextYear.setFullYear(nextYear.getFullYear() + 1)
  return nextYear.toISOString().split("T")[0]
}

const PromotionList: FC = () => {
  const {
    isLoading: isCoursesLoading,
    data: coursesData,
    refetch: refetchCourses,
  } = useGetAllCoursesAdminQuery({})

  const [deleteCourse, { isLoading: deleteCourseLoading, isSuccess: deleteCourseSuccess, error: deleteCourseError }] =
    useDeleteCourseMutation()


  const [deleteModal, setDeleteModal] = useState(false)
  const [promotionModal, setPromotionModal] = useState(false)
  const [viewPromotionsModal, setViewPromotionsModal] = useState(false)
  const [currentCourseId, setCurrentCourseId] = useState("")
  const [currentCourseName, setCurrentCourseName] = useState("")
  const [promotionsData, setPromotionsData] = useState<IPromotion[]>([])
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false)
  const [isCreatingPromotion, setIsCreatingPromotion] = useState(false)
  const [isDeletingPromotion, setIsDeletingPromotion] = useState(false)

  const fetchPromotions = async (courseID: string) => {
    if (!courseID) return

    setIsLoadingPromotions(true)
    try {
      const result = await getPromotionsByCourse(courseID)
      if (!result) {
        setPromotionsData([])
      } else if (Array.isArray(result)) {
        setPromotionsData(result)
      } else {
        setPromotionsData([result])
      }
    } catch (error) {
      toast.error("Failed to fetch promotions")
    } finally {
      setIsLoadingPromotions(false)
    }
  }

  useEffect(() => {
    if (currentCourseId && viewPromotionsModal) {
      fetchPromotions(currentCourseId)
    }
  }, [currentCourseId, viewPromotionsModal])

  const promotionForm = useForm<PromotionFormValues>({
    defaultValues: {
      code: generatePromotionCode(),
      expDate: getDefaultExpiryDate(),
      percentOff: 20,
      usageLimit: 5,
    },
    resolver: yupResolver(promotionSchema),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = promotionForm

  const columns: GridColDef[] = [
    {
      field: "stt",
      headerName: "STT",
      flex: 0.1,
    },
    {
      field: "title",
      headerName: "Course Title",
      flex: 1,
    },
    {
      field: "action-view",
      headerName: "",
      flex: 0.05,
      renderCell: (params) => (
        <div className="flex justify-start w-full">
          <Visibility
            onClick={(e) => {
              e.stopPropagation()
              handleViewPromotions(params.row.id, params.row.title)
            }}
            style={{ cursor: "pointer" }}
            className="text-[#475569] dark:text-[#3E4396]"
          />
        </div>
      ),
    },
    {
      field: "action-add",
      headerName: "",
      flex: 0.05,
      renderCell: (params) => (
        <div className="flex justify-start items-center w-full">
          <AddCircle
            onClick={(e) => {
              e.stopPropagation()
              handleCreatePromotion(params.row.id, params.row.title)
            }}
            style={{ cursor: "pointer" }}
            className="text-[#475569] dark:text-[#3E4396]"
          />
        </div>
      ),
    },
  ]

  const rows =
    coursesData?.courses.map((item: Course, index: number) => ({
      stt: index + 1,
      id: item._id,
      title: item.name,
      ratings: item.ratings,
      purchased: item.purchased,
    })) || []

  const handleViewPromotions = (courseId: string, courseName: string) => {
    setCurrentCourseId(courseId)
    setCurrentCourseName(courseName)
    setViewPromotionsModal(true)
  }

  const handleCreatePromotion = (courseId: string, courseName: string) => {
    setCurrentCourseId(courseId)
    setCurrentCourseName(courseName)

    reset({
      code: generatePromotionCode(),
      expDate: getDefaultExpiryDate(),
      percentOff: 0,
      usageLimit: 0,
    })

    setPromotionModal(true)
  }

  const onSubmitPromotion = async (formData: PromotionFormValues) => {
    setIsCreatingPromotion(true)
    try {
      const promotionData: IPromotion = {
        code: formData.code,
        course: currentCourseId,
        expDate: new Date(formData.expDate),
        percentOff: formData.percentOff,
        usageLimit: formData.usageLimit,
        usageCount: 0,
      }
      const response = await createPromotion(promotionData)

      if (response) {
        toast.success("Promotion created successfully!")
        await fetchPromotions(currentCourseId)

        reset({
          code: generatePromotionCode(),
          expDate: getDefaultExpiryDate(),
          percentOff: 0,
          usageLimit: 0,
        })

        setPromotionModal(false)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create promotion."
      toast.error(errorMessage)
    } finally {
      setIsCreatingPromotion(false)
    }
  }

  const handleDeletePromotion = async (promotionId: string) => {
    setIsDeletingPromotion(true)
    try {
      await deletePromotionById(promotionId)
      toast.success("Promotion deleted successfully!")
      await fetchPromotions(currentCourseId)
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete promotion.")
    } finally {
      setIsDeletingPromotion(false)
    }
  }

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(currentCourseId).unwrap()
      refetchCourses()
      toast.success("Course deleted successfully!")
      setDeleteModal(false)
    } catch (error) {
      toast.error("Failed to delete course")
    }
  }

  useEffect(() => {
    if (deleteCourseSuccess) {
      refetchCourses()
      toast.success("Course deleted successfully!")
      setDeleteModal(false)
    }

    if (deleteCourseError) {
      if ("data" in (deleteCourseError as any)) {
        const errorData = deleteCourseError as any
        toast.error(errorData.data.message)
      }
    }
  }, [deleteCourseSuccess, deleteCourseError, refetchCourses])
  return (
    <div className="mt-3 w-[90%] mx-auto">
      {/* <div className="mb-4">
        <h2 className="text-xl font-semibold">Course Management</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Select a course to view and manage its promotions</p>
      </div> */}
      <div className="w-full overflow-x-auto overflow-y-auto">
        <DataTable rows={rows} columns={columns} isLoading={isCoursesLoading} />
      </div>

      {/* View Promotions Modal */}
      <PromotionModal
        open={viewPromotionsModal}
        onClose={() => setViewPromotionsModal(false)}
        courseName={currentCourseName}
        promotions={promotionsData || []}
        isLoading={isLoadingPromotions}
        onAddPromotion={() => handleCreatePromotion(currentCourseId, currentCourseName)}
        onDeletePromotion={handleDeletePromotion}
      />

      {/* Delete Course Modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)}>
        <Box className="modal-content-wrapper">
          <h4 className="form-title">Are you sure you want to delete this course?</h4>
          <div className="mt-4 w-[70%] flex justify-between mx-auto pb-4">
            <BtnWithIcon content="Cancel" onClick={() => setDeleteModal(false)} />
            <BtnWithLoading
              content="Confirm"
              isLoading={deleteCourseLoading}
              customClasses="!bg-red-700 !w-fit"
              type="button"
              onClick={handleDeleteCourse}
            />
          </div>
        </Box>
      </Modal>

      {/* Create Promotion Modal */}
      <Modal open={promotionModal} onClose={() => setPromotionModal(false)}>
        <Box
          className="modal-content-wrapper"
          sx={{
            maxWidth: 600,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <h4 className="flex justify-center item-center mb-4 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Create Promotion for Course
          </h4>
          <div className="mt-2 mb-4 text-center bg-gray-300 dark:text-gray-700 p-5">
            <span className="font-medium">Course: </span>
            <span>{currentCourseName}</span>
          </div>

          <div className="mt-4 w-[90%] mx-auto">
            <form onSubmit={handleSubmit(onSubmitPromotion)}>
              <div className="grid grid-cols-1 gap-4">
                <FormInput
                  id="code"
                  label="Promotion Code"
                  register={register("code")}
                  errorMsg={errors.code?.message}
                  placeholder="Enter promotion code"
                />

                <FormInput
                  type="number"
                  id="percentOff"
                  label="Discount Percentage (%)"
                  register={register("percentOff")}
                  errorMsg={errors.percentOff?.message}
                  placeholder="20"
                />

                <FormInput
                  type="number"
                  id="usageLimit"
                  label="Usage Limit"
                  register={register("usageLimit")}
                  errorMsg={errors.usageLimit?.message}
                  placeholder="5"
                />

                <FormInput
                  type="date"
                  id="expDate"
                  label="Expiry Date"
                  register={register("expDate")}
                  errorMsg={errors.expDate?.message}
                />
              </div>

              <div className="mt-6 flex justify-between">
                <BtnWithIcon content="Cancel" onClick={() => setPromotionModal(false)} />
                <BtnWithLoading
                  content="Create promotion"
                  customClasses="!bg-green-700 !w-fit"
                  type="submit"
                  isLoading={isCreatingPromotion}
                />
              </div>
            </form>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default PromotionList
