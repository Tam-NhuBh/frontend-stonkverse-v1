import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { getAllFAQs } from "@/lib/fetch-data";
import { NextPage } from "next";
import { IFaq } from "../admin/faq/page";
import Heading from "@/components/heading";
import StockTrading from "@/components/home-page/stock-trading";
import ChatBotClient from "@/components/layout/chatbot-client";

interface Props {}

const page: NextPage<Props> = async () => {
  // const faqs = (await getAllFAQs()) as IFaq[];

  return (
    <>
      <Heading
        title="Stock Trading"
      />
      <Header />
      <div className="container mt-8 mb-14">

        <StockTrading/>

      </div>
      <div className="chatbot-container">
          <ChatBotClient />
        </div>
      <Footer />
    </>
  );
};

export default page;
