import { Button, Nav, NavItem } from "reactstrap";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  {
    title: "Dashboard",
    href: "/starter",
    icon: "bi bi-speedometer2",
  },
  {
    title: "Ventes",
    href: "/Ventes",
    icon: "bi bi-cart4",
  },
  {
    title: "Stock",
    href: "/Stock",
    icon: "bi bi-box-seam",
  },
  {
    title: "Produits",
    href: "/Produits",
    icon: "bi bi-tags",
  },

  {
    title: "Infos",
    href: "/Admin",
    icon: "bi bi-person-gear",
  },
  {
    title: "Deconnecter",
    href: "/Logout",
    icon: "bi bi-box-arrow-right",
  },
];

const Sidebar = () => {
  const showMobilemenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };
  let location = useLocation();

  return (
    <div>
      {/* Liste des éléments de navigation */}
      <div
        className="p-3 mt-2 bg-white"
        style={{
          position: "fixed",
          zIndex: 1000,
          width: "200px",
          top: "80px", // Décalage plus bas de 100px
        }}
      >
        <Nav vertical className="sidebarNav">
          {navigation.map((navi, index) => (
            <NavItem key={index} className="sidenav-bg">
              <Link
                to={navi.href}
                className={
                  location.pathname === navi.href
                    ? "active nav-link py-3"
                    : "nav-link text-secondary py-3"
                }
              >
                <i className={navi.icon}></i>
                <span className="ms-3 d-inline-block">{navi.title}</span>
              </Link>
            </NavItem>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
