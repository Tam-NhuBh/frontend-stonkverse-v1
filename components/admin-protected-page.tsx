import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useIsAdmin from "@/hooks/useIsAdmin";

interface Props {
  children: React.ReactNode;
  title?: string;
}

export default function AdminProtectedPage({ children, title }: Props) {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isAdmin !== undefined) {
      setChecked(true);
      if (!isAdmin) {
        router.replace("/"); 
      }
    }
  }, [isAdmin]);

  if (!checked) return null;

  return <>{children}</>;
}
