import React, { useState } from "react";
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
} from "reactstrap";

const FeedData = [
  {
    title: "Produits en rupture",
    icon: "bi bi-exclamation-circle",
    color: "primary",
    date: "Il y a 6 minutes",
    details: "Détails sur les produits qui sont actuellement en rupture de stock.",
  },
  {
    title: "Commandes en attente",
    icon: "bi bi-clock-history",
    color: "info",
    date: "Il y a 6 minutes",
    details: "Liste des commandes qui attendent encore d'être traitées.",
  },
  {
    title: "Stock actuel",
    icon: "bi bi-box-seam",
    color: "danger",
    date: "Il y a 6 minutes",
    details: "Informations sur le stock actuel de tous les produits.",
  },
  {
    title: "Ventes totales",
    icon: "bi bi-currency-dollar",
    color: "success",
    date: "Il y a 6 minutes",
    details: "Résumé des ventes totales effectuées jusqu'à présent.",
  },
  {
    title: "Produits les plus vendus",
    icon: "bi bi-star-fill",
    color: "dark",
    date: "Il y a 6 minutes",
    details: "Liste des produits qui se vendent le mieux.",
  },
  {
    title: "Produits les moins vendus",
    icon: "bi bi-emoji-frown",
    color: "warning",
    date: "Il y a 6 minutes",
    details: "Liste des produits qui ont le moins de ventes.",
  },
];

const Feeds = () => {
  const [modal, setModal] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);

  const toggleModal = () => setModal(!modal);

  const handleItemClick = (feed) => {
    setSelectedFeed(feed);
    toggleModal();
  };

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Informations</CardTitle>
        <CardSubtitle className="mb-2 text-muted" tag="h6">
          Informations nécessaires
        </CardSubtitle>
        <ListGroup flush className="mt-4">
          {FeedData.map((feed, index) => (
            <ListGroupItem
              key={index}
              action
              tag="a"
              className="d-flex align-items-center p-3 border-0"
              onClick={() => handleItemClick(feed)}
            >
              <Button
                className="rounded-circle me-3"
                size="sm"
                color={feed.color}
              >
                <i className={feed.icon}></i>
              </Button>
              {feed.title}
              <small className="ms-auto text-muted text-small">
                {feed.date}
              </small>
            </ListGroupItem>
          ))}
        </ListGroup>
      </CardBody>

      {/* Modal */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {selectedFeed ? selectedFeed.title : ""}
        </ModalHeader>
        <ModalBody>
          {selectedFeed ? selectedFeed.details : "Aucun détail disponible."}
        </ModalBody>
      </Modal>
    </Card>
  );
};

export default Feeds;
