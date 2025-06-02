import { IconType } from "react-icons";
import { AiOutlineLogout } from "react-icons/ai";
import { GiBookmark, GiPadlock } from "react-icons/gi";
import { RiAdminLine, RiShieldUserLine } from "react-icons/ri";
import { BiCalendarPlus } from "react-icons/bi";

export const profileItemsData: {
  icon: IconType;
  title: string;
  isLogout?: boolean;
}[] = [
  {
    icon: GiPadlock,
    title: "Change Password",
  },
  {
    icon: GiBookmark,
    title: "Enrolled Courses",
  },
  // {
  //   icon: BiCalendarPlus,
  //   title: "List of quizzes",
  // },
  {
    icon: RiAdminLine,
    title: "Admin Dashboard",
  },

  {
    icon: RiShieldUserLine ,
    title: "Instructor Dashboard",
  },

  {
    icon: AiOutlineLogout,
    title: "Log Out",
    isLogout: true,
  },
];
