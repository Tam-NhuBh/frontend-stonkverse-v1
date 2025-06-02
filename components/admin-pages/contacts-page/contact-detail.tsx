// "use client";

// import { FC, useEffect, useState } from "react";
// import { redirect, useParams } from "next/navigation";


// interface Props {}


// const ContactDetail: FC<Props> = (props): JSX.Element => {
//   const id = useParams()?.id;

//   const {
//     isLoading: fetchInitialDataLoading,
//     data,
//     refetch,
//   } = (id, { refetchOnMountOrArgChange: true });

//   const [active, setActive] = useState(0);

//   const [courseInfo, setCourseInfo] = useState(initialCourseInfo);

//   const [benefits, setBenefits] = useState([{ title: "" }]);
//   const [prerequisites, setPrerequisites] = useState([{ title: "" }]);
//   const [forWho, setForWho] = useState([{ title: "" }]);

//   const [courseContentData, setCourseContentData] = useState(
//     initialCourseContentData
//   );

//   const [courseData, setCourseData] = useState({});

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const submitHandler = async () => {
//     const data = {
//       ...courseInfo,
//       totalVideos: courseContentData.length,
//       benefits,
//       prerequisites,
//       forWho,
//       courseData: courseContentData,
//     };

//     setCourseData(data);
//   };

//   const [editCourse, { isLoading, isSuccess, error }] = useEditCourseMutation();

//   const editCourseHandler = async () => {
//     setIsSubmitting(true);
//     const data = courseData;

//     if (!isLoading) {
//       await editCourse({ id, data });
//     }
//     setIsSubmitting(false);
//   };

//   useEffect(() => {
//     if (data?.courseData && data?.courseData.length) {
//       setCourseContentData(data?.courseData);
//     }
//   }, [data]);

//   useEffect(() => {
//     if (isSuccess) {
//       refetch();
//       toast.success("Edit Course Successfully!");
//       redirect("/admin/courses");
//     }

//     if (error) {
//       if ("data" in error) {
//         const errorData = error as any;
//         toast.error(errorData.data.message);
//       }
//     }
//   }, [isSuccess, error]);

//   useEffect(() => {
//     if (fetchInitialDataLoading) {
//       toast.loading("Loading course data...");
//     } else {
//       toast.dismiss();
//     }
//   }, [fetchInitialDataLoading]);

//   return (
//     <div className="flex">
//       <div className="w-[80%]">
//         {fetchInitialDataLoading ? (
//           <div>Loading...</div>
//         ) : (
//           <>
//             {active === 0 && (
//               <CourseInfomation
//                 active={active}
//                 setActive={setActive}
//                 initialCourseInfo={data}
//                 courseInfo={courseInfo}
//                 setCourseInfo={setCourseInfo}
//               />
//             )}

//             {active === 1 && (
//               <CourseData
//                 active={active}
//                 setActive={setActive}
//                 initialBenefits={data.benefits}
//                 initialPrerequisites={data.prerequisites}
//                 initialForWho={data.forWho}
//                 benefits={benefits}
//                 setBenefits={setBenefits}
//                 prerequisites={prerequisites}
//                 setPrerequisites={setPrerequisites}
//                 forWho={forWho}
//                 setForWho={setForWho}
//               />
//             )}

//             {active === 2 && (
//               <CourseContent
//                 active={active}
//                 setActive={setActive}
//                 courseContentData={courseContentData}
//                 setCourseContentData={setCourseContentData}
//                 submitCourseHandler={submitHandler}
//               />
//             )}

//             {active === 3 && (
//               <CoursePreview
//                 active={active}
//                 setActive={setActive}
//                 courseData={courseData}
//                 courseContentData={courseContentData}
//                 createCourseHandler={editCourseHandler}
//               />
//             )}
//           </>
//         )}
//       </div>
//       <div className="flex-1 fixed z-[-1] top-[80px] right-8">
//         <CourseOptions active={active} setActive={setActive} />
//       </div>
//     </div>
//   );
// };

// export default ContactDetail;
