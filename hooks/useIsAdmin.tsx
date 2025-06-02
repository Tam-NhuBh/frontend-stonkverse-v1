import { useSelector } from "react-redux";

export default function useIsAdmin() {
  const { user } = useSelector((state: any) => state.auth);

  if (!user || !user.role) return undefined;
  return user.role === "ADMIN";
}