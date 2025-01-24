import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar"; // Importez uniquement Sidebar
import Header from "./Header";
import { Container } from "reactstrap";

const FullLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de login
    const storedRole = localStorage.getItem("role");
    if (!storedRole) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <main>
      <Header />
      <div className="pageWrapper d-lg-flex">
        <aside className="sidebarArea shadow" id="sidebarArea">
          <Sidebar />
        </aside>
        <div className="contentArea">
          <Container className="p-4" fluid>
            <Outlet />
          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;
