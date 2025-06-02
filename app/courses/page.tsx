import CategoryTag from "@/components/all-courses-page/category-tag";
import CourseCard from "@/components/course-card";
import Heading from "@/components/heading";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { getAllCategories, getAllCoursesData } from "@/lib/fetch-data";
import { FC, JSX } from "react";
import { ICategory } from "@/components/home-page/categories";
import { IFetchedCourse } from "@/components/home-page/courses";
import SearchBar from "@/components/home-page/search-bar";
import ChatBotClient from "@/components/layout/chatbot-client";

interface Props { }

const page: FC<Props> = async (props): Promise<JSX.Element> => {
  const courses = (await getAllCoursesData()) as IFetchedCourse[];
  const categories = (await getAllCategories()) as ICategory[];

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <Heading title="All Courses" />
          
          <SearchBar />
          
          <div className="mb-8 mt-5">
            <div className="flex flex-wrap gap-3 items-center">
              <CategoryTag categories={categories} allCourses />
            </div>
          </div>
          
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses?.map((course) => (
                <CourseCard key={course?._id.toString()} course={course} />
              ))}
            </div>
          </div>
          
          <div className="chatbot-container mb-8">
            <ChatBotClient />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default page;
