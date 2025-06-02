import CategoryTag from "@/components/all-courses-page/category-tag";
import CourseCard from "@/components/course-card";
import Heading from "@/components/heading";
import { ICategory } from "@/components/home-page/categories";
import { IFetchedCourse } from "@/components/home-page/courses";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { getAllCategories, getCourseByCategory } from "@/lib/fetch-data";
import { NextPage } from "next";

interface Props {
  params: { category: string };
}

const page: NextPage<Props> = async ({ params }) => {
  const data = await getCourseByCategory(params.category);
  const courses: IFetchedCourse[] = data?.courses;
  const categories: ICategory[] = await getAllCategories();
  // console.log("in data:", data)
  // console.log("in categories:", categories)

  return (
    <>
      <Heading
        title={`${data?.category} Courses | Stock E-Learning`}
      />
      <div className="min-h-screen">
        <Header />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8">
            <div className="flex flex-wrap gap-2 md:gap-3 items-center">
              <CategoryTag 
                categories={categories} 
                exclude={data?.category} 
              />
          </div>
        </div>
  
        <div className="container mt-5 mb-14">
          <div>
            <p className="font-semibold text-tertiary dark:text-dark_text text-center mb-6 text-lg">
              We found{" "}
              <span className="text-gradient font-bold">
                {courses?.length} {data?.category} Courses
              </span>{" "}
              available for you
            </p>
  
            <div className="mt-10 main-grid">
              {courses?.map((course) => (
                <CourseCard key={course?._id.toString()} course={course} />
              ))}
            </div>
          </div>
        </div>
  
        <Footer />
      </div>
    </>
  );
};

export default page;
