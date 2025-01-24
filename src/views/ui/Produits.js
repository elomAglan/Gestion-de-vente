import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";

function Produits() {
  const [produits, setProduits] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    prix: "",
    unite: "Unité",
  });
  const [messageModal, setMessageModal] = useState({ show: false, message: "", isError: false });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [produitASupprimer, setProduitASupprimer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/produits");
        if (response.ok) {
          const data = await response.json();
          setProduits(data);
        } else {
          throw new Error("Erreur lors du chargement des produits");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        setMessageModal({
          show: true,
          message: "Impossible de charger les produits. Veuillez réessayer plus tard.",
          isError: true,
        });
      }
    };
    fetchProduits();
  }, []);

  const handleAjoutProduit = async (e) => {
    e.preventDefault();

    const { nom, prix, unite } = formData;

    // Vérification si le produit existe déjà
    const produitExistant = produits.find(
      (produit) => produit.nom.toLowerCase() === nom.toLowerCase()
    );

    if (produitExistant) {
      setMessageModal({
        show: true,
        message: "Un produit avec le même nom existe déjà.",
        isError: true,
      });
      return;
    }

    if (nom && parseFloat(prix) > 0) {
      try {
        const response = await fetch("http://localhost:5000/api/produits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom,
            prix: parseFloat(prix),
            quantite: 0, // Quantité définie à zéro par défaut
            unite,
          }),
        });

        if (response.ok) {
          const nouveauProduit = await response.json();
          setProduits([...produits, nouveauProduit]);
          setFormData({ nom: "", prix: "", unite: "Unité" });
          setMessageModal({
            show: true,
            message: "Produit ajouté avec succès !",
            isError: false,
          });
        } else {
          setMessageModal({
            show: true,
            message: "Erreur lors de l'ajout du produit. Veuillez vérifier les détails.",
            isError: true,
          });
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        setMessageModal({
          show: true,
          message: "Erreur réseau lors de l'ajout du produit.",
          isError: true,
        });
      }
    } else {
      setMessageModal({
        show: true,
        message: "Veuillez entrer des valeurs valides pour le produit.",
        isError: true,
      });
    }
  };

  const handleConfirmationSuppression = (produit) => {
    setProduitASupprimer(produit);
    setShowDeleteModal(true);
  };

  const handleSuppressionProduit = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/produits/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProduits(produits.filter((produit) => produit.id !== id));
        setShowDeleteModal(false);
        setMessageModal({
          show: true,
          message: "Produit supprimé avec succès !",
          isError: false,
        });
      } else {
        setMessageModal({
          show: true,
          message: "Erreur lors de la suppression du produit.",
          isError: true,
        });
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      setMessageModal({
        show: true,
        message: "Erreur réseau lors de la suppression du produit.",
        isError: true,
      });
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const produitsFiltrés = produits.filter((produit) =>
    produit.nom.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="container my-5">
      <h1 className="text-center text-dark mb-4">Gestion des Produits</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="form-control shadow-sm"
        />
      </div>

      <div className="card p-4 shadow-lg border-0 rounded-3 mb-4">
        <h2 className="card-title mb-4 text-success">Ajouter un Nouveau Produit</h2>
        <form onSubmit={handleAjoutProduit} className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              placeholder="Nom du Produit"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="form-control shadow-sm border-light"
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              placeholder="Prix"
              value={formData.prix}
              onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
              className="form-control shadow-sm border-light"
              required
              step="0.01"
            />
          </div>
          <div className="col-md-2">
            <select
              value={formData.unite}
              onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
              className="form-control shadow-sm border-light"
            >
              <option value="Unité">Unité</option>
              <option value="Carton">Carton</option>
            </select>
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary w-100 shadow-sm">
              Ajouter le Produit
            </button>
          </div>
        </form>
      </div>

      <div className="table-responsive">
  <table className="table table-bordered table-hover shadow-sm">
    <thead className="table-dark">
      <tr>
        <th>Nom</th>
        <th>Prix</th>
        <th>Quantité</th>
        <th>Unité</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {produitsFiltrés.map((produit) => (
        <tr key={produit.id}>
          <td>{produit.nom}</td>
          <td>{Number(produit.prix).toFixed(2)} CFA</td>
          <td>{produit.quantite}</td>
          <td>{produit.unite}</td>
          <td>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleConfirmationSuppression(produit)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation de Suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Êtes-vous sûr de vouloir supprimer le produit {produitASupprimer?.nom} ?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
         
            </Button>
          <Button
            variant="danger"
            onClick={() => handleSuppressionProduit(produitASupprimer?.id)}
          >
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de message général (succès ou erreur) */}
      <Modal
        show={messageModal.show}
        onHide={() => setMessageModal({ ...messageModal, show: false })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {messageModal.isError ? "Erreur" : "Succès"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{messageModal.message}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={messageModal.isError ? "danger" : "success"}
            onClick={() => setMessageModal({ ...messageModal, show: false })}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Produits;
