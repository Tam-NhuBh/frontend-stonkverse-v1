"use client";

import AdminHeader from "@/components/admin-pages/layout/admin-header";
import AdminSidebar from "@/components/admin-pages/layout/admin-sidebar";
import { FC, ReactNode, useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import useIsAdmin from "@/hooks/useIsAdmin";
import NoContentYet from "@/components/no-content-yet";

interface Props {
  children: ReactNode;
}

const AdminLayout: FC<Props> = ({ children }): JSX.Element | null => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (isAdmin !== undefined) {
      if (!isAdmin) {
        router.replace("/");
      }
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    setIsMounted(true)

    if (isAdmin !== undefined) {
      if (!isAdmin) {
        router.replace("/")
      }
    }
  }, [isAdmin, router])

  if (!isMounted) {
    return null
  }

  if (isAdmin === false) {
    return <NoContentYet description={""}  />
  }

  if (isAdmin === undefined) {
    return <NoContentYet description={""} />
  }
    
  return (
    <div className="flex min-h-screen">
      <div className={`${!isCollapsed ? "w-[20%]" : "w-[5%]"}`}>
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <hr className=" w-30% center"></hr>
        <main>
          <div className="flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
