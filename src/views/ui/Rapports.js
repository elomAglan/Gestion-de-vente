import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'bootstrap/dist/css/bootstrap.min.css';

function Rapports() {
  const [rapports, setRapports] = useState([
    {
      id: 1,
      produit: 'Produit A',
      type: 'Entrée',
      quantite: 20,
      date: '2024-11-28',
      fournisseur: 'Fournisseur X',
    },
    {
      id: 2,
      produit: 'Produit B',
      type: 'Sortie',
      quantite: 5,
      date: '2024-11-27',
      fournisseur: 'Client Y',
    },
  ]);

  // Fonction pour télécharger les rapports au format PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Rapports des Mouvements', 14, 20);

    const tableData = rapports.map((rapport) => [
      rapport.id,
      rapport.produit,
      rapport.type,
      rapport.quantite,
      rapport.date,
      rapport.fournisseur,
    ]);

    doc.autoTable({
      head: [['ID', 'Produit', 'Type', 'Quantité', 'Date', 'Fournisseur / Client']],
      body: tableData,
      startY: 30,
    });

    doc.save('Rapports_Mouvements.pdf');
  };

  return (
    <div className="container my-5">
      <h1 className="text-center text-dark mb-4">Rapports des Mouvements</h1>

      {/* Bouton pour télécharger en PDF */}
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-danger" onClick={handleDownloadPDF}>
          Télécharger PDF
        </button>
      </div>

      {/* Tableau des rapports */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-lg shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Produit</th>
              <th>Type</th>
              <th>Quantité</th>
              <th>Date</th>
              <th>Fournisseur / Client</th>
            </tr>
          </thead>
          <tbody>
            {rapports.map((rapport) => (
              <tr key={rapport.id}>
                <td>{rapport.id}</td>
                <td>{rapport.produit}</td>
                <td>
                  <span
                    className={`badge ${
                      rapport.type === 'Entrée' ? 'bg-success' : 'bg-danger'
                    }`}
                  >
                    {rapport.type}
                  </span>
                </td>
                <td>{rapport.quantite}</td>
                <td>{rapport.date}</td>
                <td>{rapport.fournisseur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Rapports;
