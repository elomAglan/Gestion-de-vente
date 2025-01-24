import { Nav, NavItem } from "reactstrap";
import { Link, useLocation } from "react-router-dom";

// Navigation pour les utilisateurs avec le rôle "user"
const navigationUser = [
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
    title: "Produits",
    href: "/Produits",
    icon: "bi bi-tags",
  },
  {
    title: "Deconnecter",
    href: "/Logout",
    icon: "bi bi-box-arrow-right",
  },
];

const Sidebaruser = () => {
  const location = useLocation();

  return (
    <div>
      {/* Liste des éléments de navigation */}
      <div
        className="p-3 mt-2 bg-white sidebar" // Utilisation d'une classe CSS pour la sidebar
        style={{
          position: "fixed",
          zIndex: 1000,
          width: "200px",
          top: "50px", // Décalage plus bas
          height: "100vh", // Prendre toute la hauteur de la fenêtre
        }}
      >
        <Nav vertical className="sidebarNav">
          {navigationUser.map((navi, index) => (
            <NavItem key={index} className="sidenav-bg">
              <Link
                to={navi.href}
                className={
                  location.pathname === navi.href
                    ? "active nav-link py-3"
                    : "nav-link text-secondary py-3"
                }
                aria-label={navi.title} // Ajout d'un attribut d'accessibilité
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

export default Sidebaruser;
