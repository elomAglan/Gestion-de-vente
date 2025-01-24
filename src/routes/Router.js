import { lazy } from "react";
import { Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

/**** Layouts ****/
const FullLayout = lazy(() => import("../layouts/FullLayout.js"));

/***** Pages ****/
const Starter = lazy(() => import("../views/Starter.js"));
const Ventes = lazy(() => import("../views/ui/Ventes"));
const Stock = lazy(() => import("../views/ui/Stock"));
const Produits = lazy(() => import("../views/ui/Produits"));
const Rapports = lazy(() => import("../views/ui/Rapports"));
const Utilisateur = lazy(() => import("../views/ui/Utilisateur"));
const Logout = lazy(() => import("../views/ui/Logout"));
const Commandes = lazy(() => import("../views/ui/Commandes"));
const Login = lazy(() => import("../views/ui/Login"));
const Register = lazy(() => import("../views/ui/Register"));
const VenteMultiple = lazy(() => import("../views/ui/VenteMultiple")); // Vente multiple
const Admin = lazy(() => import("../views/ui/Admin"));  // Import du composant Admin

/***** Routes *****/
const ThemeRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <Navigate to="/login" />, // Redirige vers /login par défaut
  },
  {
    path: "/",
    element: <FullLayout />, // Utilise exclusivement FullLayout pour toutes les pages
    children: [
      { path: "/starter", element: <Starter /> }, // Page d'accueil (Starter)
      { path: "/Ventes", element: <Ventes /> },  // Gestion des ventes
      { path: "/Stock", element: <Stock /> },  // Gestion des stocks
      { path: "/Produits", element: <Produits /> },  // Gestion des produits
      { path: "/Rapports", element: <Rapports /> },  // Rapports
      { path: "/Utilisateur", element: <Utilisateur /> },  // Gestion des utilisateurs
      { path: "/Logout", element: <Logout /> },  // Déconnexion
      { path: "/Commandes", element: <Commandes /> },  // Gestion des commandes
      { path: "/VenteMultiple", element: <VenteMultiple /> },  // Vente multiple
      { path: "/admin", element: <Admin /> },  // Ajout du composant Admin
    ],
  },
];

export default ThemeRoutes;
