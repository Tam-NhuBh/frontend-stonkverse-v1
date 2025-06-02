"use client";

import PromotionList from "@/components/admin-pages/promotion/promotion-list";
import AdminProtectedPage from "@/components/admin-protected-page";
import { useMount } from "@/hooks/useMount";
import { NextPage } from "next";

interface Props {}

const Promotion: NextPage<Props> = () => {
  const hasMounted = useMount();

  if (!hasMounted) return null;

  return (
    <AdminProtectedPage>
      <PromotionList />
    </AdminProtectedPage>
  );
};

export default Promotion;
