import React from "react";
import { Link } from "react-router-dom";

import {
  Navbar,
  Collapse,
  Nav,
  Button,
  NavbarBrand,
} from "reactstrap";
import { FaTools } from "react-icons/fa";

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const Handletoggle = () => {
    setIsOpen(!isOpen);
  };

  const showMobilemenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };

  return (
    <Navbar
      color="primary"
      dark
      expand="md"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1030,  // Assure que le navbar soit au-dessus des autres éléments
        boxShadow: "0 4px 2px -2px gray",  // Ombre pour l'effet flottant
      }}
    >
      <div className="d-flex align-items-center">
        <NavbarBrand href="/" className="d-flex align-items-center">
          <FaTools className="me-2" style={{ color: "white", fontSize: "1.5rem" }} />
          <span style={{ fontWeight: "bold", fontSize: "1.5rem", color: "white" }}>
            Gestion Pro
          </span>
        </NavbarBrand>
        <Button
          color="primary"
          className="d-lg-none"
          onClick={showMobilemenu}
        >
          <i className="bi bi-list"></i>
        </Button>
      </div>
      <div className="hstack gap-2">
        <Button
          color="primary"
          size="sm"
          className="d-sm-block d-md-none"
          onClick={Handletoggle}
        >
          {isOpen ? (
            <i className="bi bi-x"></i>
          ) : (
            <i className="bi bi-three-dots-vertical"></i>
          )}
        </Button>
      </div>

      <Collapse navbar isOpen={isOpen}>
        <Nav className="me-auto" navbar>
          {/* Placez ici vos éléments de navigation */}
        </Nav>
      </Collapse>
    </Navbar>
  );
};

export default Header;
