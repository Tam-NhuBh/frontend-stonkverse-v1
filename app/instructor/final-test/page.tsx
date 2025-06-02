"use client";

import FinalTestManagement from "@/components/final-test/final-test-management";
import InstructorProtectedPage from "@/components/instructor-protected-page";
import { useMount } from "@/hooks/useMount";
import { NextPage } from "next";

interface Props { }

const UsersPage: NextPage<Props> = () => {
    const hasMounted = useMount();

    if (!hasMounted) return null;

    return (
        <InstructorProtectedPage>
            <FinalTestManagement />
        </InstructorProtectedPage>
    );
};

export default UsersPage;
