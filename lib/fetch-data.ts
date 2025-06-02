import axios from "axios";
import { cache } from "react";
import axiosClientV2 from "./api-client-v2";
import axiosClient from "./api-client-v1";

export const getAllCoursesData = async () => {
  try {
    const { data } = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/get-courses`
    );

    return data.courses;
  } catch (error) {
    console.log(error);
  }
};

export const getAllCategories = async () => {
  try {
    const { data } = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/get-layout/Categories`
    );
    return data.layout.categories;
  } catch (error) {
    console.log(error);
  }
};

type IEmail = {
  email: string[];
};
export const getAllEmail = async () => {
  try {
    const data: IEmail = await axiosClient(
      `/get-email`
    );
    return data.email;
  } catch (error) {
    console.log(error);
  }
};

export const getCourseByCategory = async (categorySlug: string) => {
  try {
    const { data } = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/get-courses/${categorySlug}`
    );

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserCoursesData = async (courseIds: string[]) => {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/get-user-courses`,
      { courseIds },
      {
        withCredentials: true,
      }
    );

    return data.courses;
  } catch (error) {
    console.log(error);
  }
};

export const getCoursesByQuery = async (query: string) => {
  try {
    const { data } = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/search-courses/${query}`
    );

    return data.courses;
  } catch (error) {
    console.log(error);
  }
};


export const getAllFAQs = async () => {
  try {
    const { data } = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/get-layout/FAQ`
    );

    return data.layout.faq;
  } catch (error) {
    console.log(error);
  }
};

export const getCoursePublicDetails = cache(async (courseId: string) => {
  try {
    const { data } = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/get-course/${courseId}`
    );
    return data.course;
  } catch (error) {
    console.log(error);
  }
});

export const getStripePublishableKey = async () => {
  try {
    const { data } = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/stripe-publishable-key`
    );

    return data.publishableKey;
  } catch (error) {
    console.log(error);
  }
};

export const getCourseReviews = async (courseId: string) => {
  try {
    const { data } = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/get-reviews/${courseId}`
    );

    return { reviews: data.course.reviews, ratings: data.course.ratings };
  } catch (error) {
    console.log(error);
  }
};

export const getAnswersQuiz = async (contentId: string) => {
  try {
    const { data } = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/quiz/${contentId}`,
      {
        withCredentials: true,
      }
    );

    // console.log("Fetched data:", data);
    return data;

  } catch (error) {
    console.log(error);
  }
};


export const resetUserLearningProgress = async () => {
  try {
    const response = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-user-progress`
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};


export const getIndexStock = async () => {
  try {
    const response = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/get-index`
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getCurrentUserProgress = async (courseIds: string[]) => {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/get-user-progress`,
      { courseIds },
      {
        withCredentials: true,
      }
    );
    return data.courseScores;
  } catch (error) {
    console.log(error);
  }
};

export const getQuizQuestions = async (courseId: string) => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/course/${courseId}/quiz-questions`
    );

    return data.questions;
  } catch (error) {
    console.log(error);
  }
};

type IPromotion = {
  code: string
  course: string
  expDate: Date
  percentOff: number
  usageLimit: number
  usageCount: number
};

export const getPromotionByID = async (id: string) => {
  try {
    const data: IPromotion = await axiosClientV2(
      `/admin/promotion/${id}`,
    );
    return data;
  } catch (error) {
    console.log("Fetch promotion data fail:", error);
  }
};

export const getPromotionsByCourse = async (id: string) => {
  try {
    const data: IPromotion = await axiosClientV2.get(
      `/admin/promotion/course/${id}`,
    );
    console.log("test data get promotion by course:", data)
    return data
  } catch (error) {
    console.log("Fetch promotion by course is false:", error)
  }
}

export const getPromotionsByUserCourse = async (id: string) => {
  try {
    const data: IPromotion = await axiosClientV2(`/admin/promotion/user-course/${id}`)
    return data
  } catch (error) {
    console.log("Fetch promotion by user course is false:", error)
  }
}

export const getAllPendingCourse = async () => {
  try {
    const { data } = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/courses/pending-review`
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getSettings = async (filter: { courseId?: string; courseDataId?: string }) => {
  try {
    const response = await axios(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/setting`, { data: filter })
    return response.data
  } catch (error: any) {
    console.error("Failed to fetch settings:", error.response?.data?.message || error.message)
    throw error
  }
}

export const getFinalTests = async (courseId: string) => {
  try {
    const response = await axiosClient(
      `/final-test/${courseId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch final tests:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const getFinalTestsByID = async (id: string) => {
  try {
    const response = await axiosClient(
      `/final-test-by-id/${id}`
    );
    // console.log("get final:", response.data)
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch final tests:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const getAllCourseFinalTest = async () => {
  try {
    const response = await axiosClient(
      `/get-all-courses`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch final tests:", error.response?.data?.message || error.message);
    throw error;
  }
};
