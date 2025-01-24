import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  ListGroup,
  ListGroupItem,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Spinner,
} from "reactstrap";

const Admin = () => {
  const [dashboardData, setDashboardData] = useState([]); // Données du tableau de bord
  const [loading, setLoading] = useState(true); // Indicateur de chargement
  const [error, setError] = useState(null); // Erreur lors de la récupération
  const [modal, setModal] = useState(false); // Modal pour les détails
  const [selectedData, setSelectedData] = useState(null); // Données de l'élément sélectionné

  // Fonction pour basculer la visibilité du modal
  const toggleModal = () => setModal(!modal);

  // Récupération des données du tableau de bord via l'API
  useEffect(() => {
    fetch("http://localhost:5000/api/resume") // Votre API backend
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setDashboardData(data); // Mettre les données dans le state
        setLoading(false);
      })
      .catch((err) => {
        setError("Impossible de charger les données.");
        setLoading(false);
      });
  }, []); // Ne s'exécute qu'une fois lors du chargement du composant

  // Fonction pour gérer le clic sur un élément de la liste
  const handleItemClick = (data) => {
    setSelectedData(data);
    toggleModal();
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-5 text-primary">Tableau de Bord Administratif</h1>

      {/* Affichage du spinner lors du chargement */}
      {loading && (
        <div className="text-center">
          <Spinner color="primary" />
          <p>Chargement des données...</p>
        </div>
      )}

      {/* Affichage de l'erreur si une erreur se produit */}
      {error && (
        <div className="alert alert-danger text-center">
          {error}
        </div>
      )}

      {/* Si les données sont chargées sans erreur, afficher les cartes */}
      {!loading && !error && (
        <Card>
          <CardBody>
            <CardTitle tag="h5">Résumé des Activités</CardTitle>
            <CardSubtitle className="mb-2 text-muted" tag="h6">
              Vue d'ensemble des principales informations
            </CardSubtitle>

            <ListGroup flush className="mt-4">
              {dashboardData.map((data, index) => (
                <ListGroupItem
                  key={index}
                  action
                  tag="a"
                  className="d-flex align-items-center p-3 border-0"
                  onClick={() => handleItemClick(data)}
                >
                  <Button
                    className="rounded-circle me-3"
                    size="sm"
                    color={data.color || "primary"} // Utilisation de la couleur par défaut
                  >
                    <i className={data.icon || "bi bi-question-circle"}></i>
                  </Button>
                  {data.title}
                  <small className="ms-auto text-muted text-small">
                    {data.date}
                  </small>
                </ListGroupItem>
              ))}
            </ListGroup>
          </CardBody>
        </Card>
      )}

      {/* Modal pour afficher les détails d'un élément */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {selectedData ? selectedData.title : "Détails"}
        </ModalHeader>
        <ModalBody>
          {/* Utilisation de dangerouslySetInnerHTML pour afficher du HTML dans la modale */}
          {selectedData ? (
            <div
              dangerouslySetInnerHTML={{ __html: selectedData.details }}
            />
          ) : (
            "Aucun détail disponible."
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default Admin;
