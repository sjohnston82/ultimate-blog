import React from "react";
import MainSection from "../components/MainSection";
import SideSection from "../components/SideSection";

import WriteModalForm from "../components/WriteFormModal";
import MainLayout from "../layouts/MainLayout";



const HomePage = () => {
  

  

  return (
    <MainLayout>
      <section className="grid h-full grid-cols-12  ">
        <MainSection />
        <SideSection />
      </section>
      <WriteModalForm />
    </MainLayout>
  );
};

export default HomePage;
