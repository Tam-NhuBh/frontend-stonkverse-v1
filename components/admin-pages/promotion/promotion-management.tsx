"use client"

import { formatShortDate } from "@/lib/format-data"
import { Box, Modal } from "@mui/material"
import { type FC, useState, useEffect } from "react"
import { AiOutlineDelete } from "react-icons/ai"
import toast from "react-hot-toast"
import { AddCircle, ContentCopy, DeleteOutlineOutlined } from "@mui/icons-material"
import DataTable from "@/components/admin-pages/data-table"
import { DeleteIcon } from "lucide-react"
import BtnWithIcon from "@/components/btn-with-icon"

interface Props {
  open: boolean
  onClose: () => void
  courseName: string
  promotions: any[]
  isLoading: boolean
  onAddPromotion: () => void
  onDeletePromotion: (id: string) => void
}

const PromotionManagement: FC<Props> = ({
  open,
  onClose,
  courseName,
  promotions,
  isLoading,
  onAddPromotion,
  onDeletePromotion,
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [deletePromotionId, setDeletePromotionId] = useState<string | null>(null)
  const [deletePromotionModal, setDeletePromotionModal] = useState(false)
  const [processedPromotions, setProcessedPromotions] = useState<any[]>([])

  useEffect(() => {
    if (promotions && promotions.length > 0) {
      const processed = promotions.map((promo) => {
        return {
          ...promo,
          id: promo.id || promo._id || "",
          usedCount: promo.usedCount || promo.usageCount || 0,
          status: promo.status || "active",
        }
      })

      setProcessedPromotions(processed)
    } else {
      setProcessedPromotions([])
    }
  }, [promotions])

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue)
  }

  const confirmDeletePromotion = (promotionId: string) => {
    setDeletePromotionId(promotionId)
    setDeletePromotionModal(true)
  }

  const handleDeletePromotion = async () => {
    if (!deletePromotionId) return
    onDeletePromotion(deletePromotionId)
    setDeletePromotionModal(false)
    setDeletePromotionId(null)
  }

  const handleCopyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Promotion code copied to clipboard!")
  }

  const getStatusColor = (status: string) => {
    if (status === "expired") return "text-red-600 dark:text-red-400"
    if (status === "almost_full") return "text-orange-600 dark:text-orange-400"
    return "text-green-600 dark:text-green-400"
  }

  const getStatusText = (status: string) => {
    if (status === "expired") return "Expired"
    if (status === "almost_full") return "Almost Full"
    return "Active"
  }

  const getStatusBadgeClass = (status: string) => {
    if (status === "expired") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    if (status === "almost_full") return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  }

  const getProgressBarColor = (status: string) => {
    if (status === "expired") return "bg-red-600 dark:bg-red-500"
    if (status === "almost_full") return "bg-orange-600 dark:bg-orange-500"
    return "bg-blue-600 dark:bg-blue-500"
  }

  const columns = [
    {
      field: "code",
      headerName: "Code",
      flex: 1,
      renderCell: (params: any) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{params.value}</span>
          <button
            onClick={() => handleCopyPromoCode(params.value)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
            aria-label="Copy code"
          >
            <ContentCopy className="h-3 w-3" />
          </button>
        </div>
      ),
    },
    {
      field: "percentOff",
      headerName: "Discount",
      flex: 0.5,
      renderCell: (params: any) => (
        <span className="font-medium text-green-600 dark:text-green-400">{params.value}%</span>
      ),
    },
    {
      field: "usage",
      headerName: "Usage",
      flex: 0.8,
      renderCell: (params: any) => (
        <div className="space-y-1">
          <div className="font-medium">
            {params.row.usedCount}/{params.row.usageLimit}
          </div>
          <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressBarColor(params.row.status)}`}
              style={{ width: `${(params.row.usedCount / params.row.usageLimit) * 100}%` }}
            ></div>
          </div>
        </div>
      ),
    },
    {
      field: "expDate",
      headerName: "Expires",
      flex: 0.7,
      renderCell: (params: any) => <span className="font-medium">{formatShortDate(params.value)}</span>,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      renderCell: (params: any) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusBadgeClass(
            params.value,
          )}`}
        >
          {getStatusText(params.value)}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      renderCell: (params: any) => (
        <button
          onClick={() => {
            confirmDeletePromotion(params.row.id)
          }}
          className="inline-flex h-8 w-8 items-center justify-center bg-background text-red-600 hover:bg-accent hover:text-red-700"
          aria-label="Delete promotion"
        >
          <AiOutlineDelete className="h-7 w-7" />
        </button>
      ),
    },
  ]

  const rows = processedPromotions.map((promo, index: number) => {
    return {
      stt: index + 1,
      id: promo.id,
      code: promo.code,
      percentOff: promo.percentOff,
      usedCount: promo.usedCount,
      usageLimit: promo.usageLimit,
      expDate: promo.expDate,
      status: promo.status,
      usage: `${promo.usedCount}/${promo.usageLimit}`,
    }
  })

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          className="modal-content-wrapper bg-[#F5F5F5] dark:bg-slate-900 rounded-md shadow-xl p-4 sm:p-6 max-h-[90vh] overflow-auto"
          sx={{
            maxWidth: { xs: "95%", sm: "90%", md: 900 },
            width: "100%",
            margin: "auto",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            outline: "none",
          }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Promotions for {courseName}
          </h2>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="inline-flex rounded-md border dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={() => handleTabChange(0)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${activeTab === 0
                    ? "text-[#0DA5B5] dark:text-blue-400 bg-white dark:bg-gray-700 shadow-sm z-10"
                    : "text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform duration-200"
                  }`}
              >
                Card View
                {activeTab === 0 && (
                  <span className="absolute inset-0 rounded-md bg-white dark:bg-gray-700 shadow-sm -z-10"></span>
                )}
              </button>
              <button
                onClick={() => handleTabChange(1)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${activeTab === 1
                    ? "text-[#0DA5B5] dark:text-blue-400 bg-white dark:bg-gray-700 shadow-sm z-10"
                    : "text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform duration-200"
                  }`}
              >
                Table View
                {activeTab === 1 && (
                  <span className="absolute inset-0 rounded-md bg-white dark:bg-gray-700 shadow-sm -z-10"></span>
                )}
              </button>
            </div>
          </div>

          <div className="w-full">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary"></div>
              </div>
            ) : processedPromotions.length > 0 ? (
              <>
                {activeTab === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {processedPromotions.map((promo) => (
                      <div
                        key={promo.id}
                        className="rounded-sm border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow transition-shadow duration-200"
                      >
                        <div className="bg-primary text-primary-foreground p-3 sm:p-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base sm:text-lg truncate max-w-[120px] sm:max-w-[180px]">
                              {promo.code}
                            </h3>
                            <button
                              onClick={() => handleCopyPromoCode(promo.code)}
                              className="inline-flex items-center justify-center rounded-full h-6 w-6 hover:bg-primary-foreground/20 transition-colors"
                              aria-label="Copy code"
                            >
                              <ContentCopy className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ${getStatusColor(
                                promo.status,
                              )}`}
                            >
                              {getStatusText(promo.status)}
                            </span>
                            <button
                              onClick={() => {
                                confirmDeletePromotion(promo.id)
                              }}
                              className="inline-flex items-center justify-center rounded-full h-6 w-6 text-red-500 hover:text-red-600 transition-colors"
                              aria-label="Delete promotion"
                            >
                              <DeleteOutlineOutlined className="h-7 w-7" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm text-muted-foreground">Discount</p>
                              <p className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-400">
                                {promo.percentOff}%
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm text-muted-foreground">Usage</p>
                              <p className="text-base sm:text-lg font-semibold">
                                {promo.usedCount}/{promo.usageLimit}
                              </p>
                            </div>
                            <div className="space-y-1 col-span-2">
                              <p className="text-xs sm:text-sm text-muted-foreground">Expires</p>
                              <p className="text-base sm:text-lg font-semibold">{formatShortDate(promo.expDate)}</p>
                            </div>
                          </div>

                          <div className="pt-2 sm:pt-3 border-t">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Usage</span>
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                {Math.round((promo.usedCount / promo.usageLimit) * 100)}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getProgressBarColor(promo.status)}`}
                                style={{ width: `${(promo.usedCount / promo.usageLimit) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 1 && (
                  <div className="w-full overflow-x-auto overflow-y-auto">
                    <DataTable rows={rows} columns={columns} isLoading={isLoading} />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center border dark:border-gray-600 p-3 rounded-lg py-12 px-4">
                <div className="mb-4 text-center">No promotions found for this course</div>
                <button
                  onClick={onAddPromotion}
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium border-2 border-dashed border-gray-400 dark:border-gray-300 rounded-md transition-colors duration-200 hover:border-gray-800 dark:hover:border-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white h-10 px-4 py-2"
                >
                  <AddCircle className="mr-2 h-4 w-4" /> ADD PROMOTION
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <BtnWithIcon content="Close" onClick={onClose} />
            <BtnWithIcon content="Add promotion" onClick={onAddPromotion} />
          </div>
        </Box>
      </Modal>

      {/* Delete Promotion Modal */}
      <Modal open={deletePromotionModal} onClose={() => setDeletePromotionModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="modal-content-wrapper">
          <h4 className="form-title"> Are you sure to delete this promotion?</h4>
          <div className="mt-4 w-[70%] flex justify-between mx-auto pb-4">
            <BtnWithIcon
              content="Cancel"
              onClick={() => setDeletePromotionModal(false)}
            />
            <BtnWithIcon
              content="Delete"
              onClick={handleDeletePromotion}
            />
          </div>

        </Box>
      </Modal>
    </>
  )
}

export default PromotionManagement

