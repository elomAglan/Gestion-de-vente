import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Pour rediriger après logout
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import user1 from "../assets/images/users/user4.jpg";

const ProfileDropdown = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate(); // Hook pour la navigation

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const handleLogout = () => {
    // Exemple : Supprimez le token d'authentification
    localStorage.removeItem("authToken");

    // Redirigez vers la page de connexion
    navigate("/login");
  };

  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle color="transparent">
        <img
          src={user1}
          alt="profile"
          className="rounded-circle"
          width="30"
        />
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Info</DropdownItem>
        <DropdownItem>My Account</DropdownItem>
        <DropdownItem>Edit Profile</DropdownItem>
        <DropdownItem divider />
        <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
