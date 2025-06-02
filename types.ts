import { Types } from "mongoose";

// User Types
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: ICourse[];
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

// Course Types
export interface IReply {
  _id: Types.ObjectId;
  user: IUser;
  answer: string;
  createdAt: Date;
}

export interface IQuestion {
  _id: Types.ObjectId;
  user: IUser;
  title?: string;
  question: string;
  questionReplies: IReply[];
  createdAt: Date;
}

export interface IReviewReply {
  _id: Types.ObjectId;
  user: IUser;
  answer: string;
  createdAt: Date;
}

export interface IReview {
  _id: Types.ObjectId;
  createdAt: Date;
  user: IUser;
  rating: number;
  comment: string;
  commentReplies: IReviewReply[];
}

export interface ILink {
  title: string;
  url: string;
}

export interface IAnswerQuiz {
  _id: Types.ObjectId;
  user: IUser;
  answer: string[];
  score: number;
  createdAt: Date;
}
//main
export interface IQuestionQuiz {
  _id: Types.ObjectId;
  user: IUser;
  title?: string;
  answers: IAnswerQuiz[];
  correctAnswer: string[],
  mockAnswer: string[],
  maxScore: number,
  createdAt: Date;
}

export interface ICourseData {
  _id: Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  questions: IQuestion[];
  quiz: IQuestionQuiz[];
}

export type QuestionType = "single" | "multiple" | "fillBlank";

export interface IAnswerFinalTest {
  answer: string[];
  imageUrl?: string;
  score: number;
  createdAt?: Date;
}

export interface ITitleFinalTest {
  id?: string;
  title: string;
  description?: string;
  answers: IAnswerFinalTest[];
  correctAnswer: string[];
  mockAnswer: string[];
  maxScore: number;
  type: QuestionType;
  createdAt?: Date;
  imageUrl?: string;
}

export interface TestSettings {
  course?: string;
  testDuration: {
    hours: number;
    minutes: number;
  };
  numberOfQuestions: number;
  pageLayout: string;
  gradingDisplay: string;
 
  instructionsMessage: string;
  completionMessage: string;
}

export interface IFinalTest {
  id?: string;
  title: string;
  description?: string;
  tests: ITitleFinalTest[];
  score: number;
  createdAt?: Date;
  settings: TestSettings;
}

export interface ICourse {
  name: string;
  description?: string;
  category: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: {
    public_id: string;
    url: string;
  };
  curriculum: {
    public_id: string;
    url: string;
  };
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  forWho: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  finalTest: IFinalTest[];
  ratings?: number;
  purchased?: number;
  isFinalTest?: boolean;
  status: 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW';
   percentAccount?: number;
  progressDetails?: {
    completedLessons: number;
    totalLessons: number;
    completedQuizzes: number;
    totalQuizzes: number;
    finalTestCompleted: boolean;
    hasFinalTest: boolean;
  };
}

export interface CourseInfoValuesInstructor {
  name: string;
  description: string;
  category: string;
  price: string;
  estimatedPrice: string;
  tags: string;
  level: string;
  demoUrl: string;
  thumbnail: string;
  curriculum: string
};
