import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';

function CommandesApprovisionnement() {
  const [produits, setProduits] = useState([
    { id: 1, nom: 'Produit X', prix: 10.0 },
    { id: 2, nom: 'Produit Y', prix: 20.0 },
    { id: 3, nom: 'Produit Z', prix: 15.0 },
  ]);

  const [commandes, setCommandes] = useState([
    { id: 1, fournisseur: 'Fournisseur A', produit: 'Produit X', quantite: 100, date: '2024-11-20', statut: 'En attente' },
    { id: 2, fournisseur: 'Fournisseur B', produit: 'Produit Y', quantite: 50, date: '2024-11-21', statut: 'Livrée' },
  ]);

  const [filtreStatut, setFiltreStatut] = useState('');
  const [formCommande, setFormCommande] = useState({
    fournisseur: '',
    produit: '',
    quantite: '',
  });

  const commandesFiltrees = filtreStatut
    ? commandes.filter((commande) => commande.statut === filtreStatut)
    : commandes;

  const handleAjouterCommande = (e) => {
    e.preventDefault();
    const produitSelectionne = produits.find((p) => p.nom === formCommande.produit);

    if (!formCommande.fournisseur || !produitSelectionne || formCommande.quantite <= 0) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    const nouvelleCommande = {
      id: commandes.length + 1,
      fournisseur: formCommande.fournisseur,
      produit: produitSelectionne.nom,
      quantite: parseInt(formCommande.quantite),
      date: new Date().toLocaleDateString(),
      statut: 'En attente',
    };

    setCommandes([...commandes, nouvelleCommande]);
    setFormCommande({ fournisseur: '', produit: '', quantite: '' });
  };

  const handleChangerStatut = (id, nouveauStatut) => {
    setCommandes(commandes.map((commande) =>
      commande.id === id ? { ...commande, statut: nouveauStatut } : commande
    ));
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Rapport des Commandes d’Approvisionnement', 14, 10);
    doc.autoTable({
      head: [['ID', 'Fournisseur', 'Produit', 'Quantité', 'Date', 'Statut']],
      body: commandesFiltrees.map((commande) => [
        commande.id,
        commande.fournisseur,
        commande.produit,
        commande.quantite,
        commande.date,
        commande.statut,
      ]),
    });
    doc.save('rapport_commandes_approvisionnement.pdf');
  };

  return (
    <div className="container my-5">
     <h1 className="text-center text-dark mb-4">Gestion des Commandes d’Approvisionnement</h1>


      {/* Formulaire pour ajouter une commande */}
      <div className="mb-5">
        <h2 className="text-secondary">Nouvelle Commande</h2>
        <form onSubmit={handleAjouterCommande} className="row g-3">
          <div className="col-md-4">
          <input
        type="email" // Changement du type pour "email"
        className="form-control"
        placeholder="Email du fournisseur"
        value={formCommande.fournisseur}
        onChange={(e) => setFormCommande({ ...formCommande, fournisseur: e.target.value })}
        required
      />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={formCommande.produit}
              onChange={(e) => setFormCommande({ ...formCommande, produit: e.target.value })}
              required
            >
              <option value="">Sélectionnez un produit</option>
              {produits.map((produit) => (
                <option key={produit.id} value={produit.nom}>
                  {produit.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Quantité"
              value={formCommande.quantite}
              onChange={(e) => setFormCommande({ ...formCommande, quantite: e.target.value })}
              min="1"
              required
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-success w-100">
              Ajouter
            </button>
          </div>
        </form>
      </div>

      {/* Filtrage des commandes */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <select
          className="form-select w-50"
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
        >
          <option value="">Toutes les commandes</option>
          <option value="En attente">En attente</option>
          <option value="Livrée">Livrée</option>
          <option value="Annulée">Annulée</option>
        </select>
        <button className="btn btn-primary" onClick={handleDownloadPDF}>
          Télécharger en PDF
        </button>
      </div>

      {/* Tableau des commandes */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Fournisseur</th>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {commandesFiltrees.map((commande) => (
              <tr key={commande.id}>
                <td>{commande.id}</td>
                <td>{commande.fournisseur}</td>
                <td>{commande.produit}</td>
                <td>{commande.quantite}</td>
                <td>{commande.date}</td>
                <td>{commande.statut}</td>
                <td>
                  {commande.statut === 'En attente' && (
                    <>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleChangerStatut(commande.id, 'Livrée')}
                      >
                        Livrée
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleChangerStatut(commande.id, 'Annulée')}
                      >
                        Annulée
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CommandesApprovisionnement;
