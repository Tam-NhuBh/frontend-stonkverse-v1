"use client";

import AdminProtectedPage from "@/components/admin-protected-page";
import FinalTestManagement from "@/components/final-test/final-test-management";
import { useMount } from "@/hooks/useMount";
import { NextPage } from "next";

interface Props { }

const UsersPage: NextPage<Props> = () => {
    const hasMounted = useMount();

    if (!hasMounted) return null;

    return (
        <AdminProtectedPage>
            <FinalTestManagement />
        </AdminProtectedPage>
    );
};

export default UsersPage;
