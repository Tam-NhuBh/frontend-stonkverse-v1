'use client'

import { FC, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import useIsInstructor from "@/hooks/useIsInstructor";
import Heading from "./heading";

interface Props {
  children: ReactNode;
  title?: string;
}

const InstructorProtectedPage: FC<Props> = ({ children, title }) => {
  const isInstructor = useIsInstructor();
  const router = useRouter();

  useEffect(() => {
    if (isInstructor === false) {
      router.replace('/');
    }
  }, [isInstructor, router]);

  if (isInstructor === undefined) {
    return null;
  }

  return isInstructor ? <>
    <Heading title={title} />
    {children}
  </> : null;
};

export default InstructorProtectedPage;