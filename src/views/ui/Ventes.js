import React, { useState, useEffect } from "react";
import { Button, Table, Input, Badge, } from "reactstrap";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FaCartPlus } from "react-icons/fa";
import { FaTrash , FaShoppingCart } from 'react-icons/fa'; // Correctement importer depuis 'react-icons/fa'


const Ventes = () => {
  const [sales, setSales] = useState([]);
  const [modal, setModal] = useState(false); // Modal de succès
  const [modalMessage, setModalMessage] = useState(""); // Message du modal
  const [newSale, setNewSale] = useState({ produit_id: "", quantite: "", total: 0 });
  const [produits, setProduits] = useState([]);
  const [panier, setPanier] = useState([]);
  const [error, setError] = useState(null);
  const [quantityError, setQuantityError] = useState(null);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const totalArticles = panier.reduce((acc, item) => acc + item.quantite, 0);

  const API_BASE_URL = "http://localhost:5000/api"; // Base URL de l'API

  // Charger les ventes depuis l'API
  const fetchSales = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ventes?_sort=date_vente&_order=desc&_limit=5`);
      if (!response.ok) throw new Error("Erreur lors du chargement des ventes.");
      const data = await response.json();
      setSales(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Charger les produits depuis l'API
  const fetchProduits = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/produits`);
      if (!response.ok) throw new Error("Erreur lors du chargement des produits.");
      const data = await response.json();
      setProduits(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchProduits();
  }, []);

  // Gérer la sélection du produit
const handleProductChange = (e) => {
  const produitId = Number(e.target.value);
  const product = produits.find((p) => p.id === produitId);

  if (product) {
    setNewSale({
      ...newSale,
      produit_id: product.id,
      quantite: "",  // Réinitialiser la quantité lorsque le produit change
      total: 0,
    });
    setQuantityError(null);
  } else {
    setNewSale({
      ...newSale,
      produit_id: "",  // Réinitialiser l'ID du produit lorsque aucun produit n'est trouvé
      quantite: "",
      total: 0,
    });
    setQuantityError(null);
  }
};

// Gérer la modification de la quantité
const handleQuantityChange = (e) => {
  const quantite = e.target.value;
  const product = produits.find((p) => p.id === newSale.produit_id);

  // Vérifier si la quantité est vide ou égale à 0
  if (quantite === "" || quantite <= 0) {
    setNewSale({
      ...newSale,
      quantite: quantite,
      total: 0,
    });
    setQuantityError("La quantité doit être supérieure à 0.");
  } else if (product) {
    const numericQuantite = Number(quantite);
    if (!isNaN(numericQuantite) && numericQuantite > 0) {
      const total = (product.prix * numericQuantite).toFixed(2);  // Calcul du total avec 2 décimales
      setNewSale({
        ...newSale,
        quantite: numericQuantite,
        total,
      });
      setQuantityError(null);  // Pas d'erreur si la quantité est valide
    } else {
      setQuantityError("Quantité invalide.");
    }
  }
};

// Fonction pour formater les prix avec des points comme séparateurs de milliers
const formatPrix = (prix) => {
  const prixNumerique = Number(prix);
  if (isNaN(prixNumerique)) {
    return "0"; // Retourne une valeur par défaut si ce n'est pas un nombre valide
  }
  return prixNumerique.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Ajoute un point tous les 3 chiffres
};

// Ajouter un produit au panier
const handleAddToPanier = (productId) => {
  const produit = produits.find((p) => p.id === productId);


  if (produit) {
    // Vérifiez si le produit est déjà dans le panier
    const produitExistant = panier.find((item) => item.id === produit.id);
    const quantiteDisponible = produit.quantite;
    const nouvelleQuantite = produitExistant ? produitExistant.quantite + 1 : 1;

    // Vérification de la quantité disponible
    if (nouvelleQuantite > quantiteDisponible) {
      alert(`La quantité demandée dépasse la quantité disponible (${quantiteDisponible}).`);
      return;  // Ne pas ajouter le produit si la quantité est insuffisante
    }

    let updatedPanier;

    if (produitExistant) {
      // Si le produit existe déjà, on augmente la quantité et met à jour le total
      updatedPanier = panier.map((item) => {
        if (item.id === produit.id) {
          const newQuantite = item.quantite + 1;
          const newTotal = parseFloat(item.prix) * newQuantite;  // Assurez-vous que le total soit un nombre
          return {
            ...item,
            quantite: newQuantite,
            total: newTotal,  // Mise à jour du total du produit
          };
        }
        return item;
      });
    } else {
      // Si le produit n'existe pas, on l'ajoute au panier avec une quantité initiale de 1
      updatedPanier = [...panier, { ...produit, quantite: 1, total: parseFloat(produit.prix) }]; // Assurez-vous que le prix est bien un nombre
    }
    

    setPanier(updatedPanier);

    // Recalculer le total global du panier
    const newTotal = updatedPanier.reduce((acc, item) => acc + item.total, 0);
    setTotal(newTotal);  // Mise à jour du total global du panier
  }
};


// Supprimer un produit du panier
const handleRemoveFromPanier = (productId) => {
  const updatedPanier = panier.filter((item) => item.id !== productId);
  setPanier(updatedPanier);
  let newTotal = 0;
  updatedPanier.forEach((item) => {
    newTotal += item.prix * item.quantite;
  });
  setTotal(newTotal);
};

// Modifier la quantité dans le panier
const handleQuantiteChangeInPanier = (e, productId) => {
  const updatedQuantite = parseInt(e.target.value, 10);  // Convertir en nombre entier

  // Vérifier si la quantité est valide et supérieure ou égale à 1
  if (isNaN(updatedQuantite) || updatedQuantite < 1) {
    return;  // Ne rien faire si la quantité est invalide
  }

  const produit = produits.find((p) => p.id === productId);
  if (produit && updatedQuantite > produit.quantite) {
    alert(`La quantité demandée dépasse la quantité disponible (${produit.quantite}).`);
    return;  // Ne pas mettre à jour la quantité si elle est supérieure à la quantité disponible
  }

  // Mettre à jour le panier avec la nouvelle quantité
  const updatedPanier = panier.map((item) => {
    if (item.id === productId) {
      // Calculer le total pour le produit en fonction de la nouvelle quantité
      return {
        ...item,
        quantite: updatedQuantite,
        total: item.prix * updatedQuantite,  // Mise à jour du total du produit
      };
    }
    return item;
  });

  setPanier(updatedPanier);

  // Recalculer le total global du panier
  const newTotal = updatedPanier.reduce((acc, item) => acc + item.total, 0);
  setTotal(newTotal);
};

// Fonction pour formater les dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, "dd/MM/yyyy", { locale: fr });
};

// Confirmer la vente
const handleConfirmSale = async () => {
  try {
    // Créer un tableau des ventes au format attendu par l'API
    const ventes = panier.map(item => ({
      produit_id: item.id,
      quantite: item.quantite,
      prix_total: item.total,
    }));

    // Vérifier s'il y a des ventes à enregistrer
    if (ventes.length === 0) {
      alert("Aucune vente à confirmer.");
      return;
    }

    // Envoyer les ventes au backend
    const response = await fetch(`${API_BASE_URL}/ventes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ventes }), // Envoi des ventes sous forme de tableau
    });

    const data = await response.json();

    if (response.ok) {
      // Réinitialiser le panier après une vente réussie
      setPanier([]);
      setTotal(0);
      fetchSales();  // Rafraîchir la liste des ventes récentes

      // Mettre à jour les produits avec leurs nouvelles quantités
      fetchProduits();  // Récupérer à nouveau les produits avec leurs quantités mises à jour

      // Afficher l'alerte de succès
      alert("Vente multiple enregistrée avec succès !");
    } else {
      alert(data.message || "Une erreur s'est produite lors de l'enregistrement de la vente.");
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des ventes:", error);
    alert("Une erreur est survenue. Veuillez réessayer.");
  }
};

  

  // Filtrer les produits en fonction de la recherche
  const filteredProduits = produits.filter((product) =>
    product.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
  <div className="p-4">
  <div className="min-h-screen flex flex-col justify-center items-center">
    <div className="mt-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Gestion des Ventes</h1>
      {/* Autres éléments */}
    </div>
  </div>
</div>


<Button
  style={{
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 9999,
  }}
  color="light"
  title="Panier"
>
  <FaShoppingCart size={24} />
  {totalArticles > 0 && (
    <Badge
      color="danger"
      pill
      className="position-absolute top-0 start-100 translate-middle"
    >
      {totalArticles}
    </Badge>
  )}
</Button>



      {error && <div className="alert alert-danger">{error}</div>}

      {/* Recherche instantanée */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Rechercher un produit"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Liste des produits */}
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
      {filteredProduits
        .sort((a, b) => a.nom.localeCompare(b.nom)) // Tri par ordre alphabétique
        .map((produit) => (
          <tr key={produit.id}>
            <td>{produit.nom}</td>
            <td>{produit.prix} CFA</td>
            <td>{produit.quantite}</td>
            <td>{produit.unite}</td>
            <td>
              <Button
                color="primary"
                onClick={() => handleAddToPanier(produit.id)}
              >
                <FaCartPlus /> {/* Affichage de l'icône à la place du texte */}
              </Button>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
</div>


{/* Panier */}
<h2 className="text-2xl font-semibold mb-4 text-center">Panier</h2>
<div className="overflow-x-auto">
  {panier.length === 0 ? (
    <p className="text-center text-lg text-gray-600">Le panier est vide.</p>
  ) : (
    <Table striped responsive hover>
      <thead className="bg-blue-100">
        <tr>
          <th className="text-left px-4 py-2">Produit</th>
          <th className="text-left px-4 py-2">Quantité</th>
          <th className="text-left px-4 py-2">Prix unitaire</th>
          <th className="text-left px-4 py-2">Total</th>
          <th className="text-center px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {panier.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-2">{item.nom}</td>
            <td className="px-4 py-2">
              <Input
                type="number"
                value={item.quantite}
                min={1}
                className="w-16 text-center"
                onChange={(e) => handleQuantiteChangeInPanier(e, item.id)}
              />
            </td>
            <td className="px-4 py-2">{item.prix} CFA</td>
            <td className="px-4 py-2">{item.total} CFA</td>
            <td className="text-center px-4 py-2">
              <Button
                color="danger"
                onClick={() => handleRemoveFromPanier(item.id)}
                className="ml-2"
                title="Supprimer"
              >
                <FaTrash />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )}
</div>


      
<div className="my-4 text-right">
  <h3>Total: {formatPrix(total)} CFA</h3>
  <Button color="success" onClick={handleConfirmSale}>
    Confirmer la vente
  </Button>
</div>

      
    </div>
  );
};

export default Ventes;
