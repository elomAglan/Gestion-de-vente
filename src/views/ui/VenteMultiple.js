import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importer le hook useNavigate
import axios from 'axios';

const VenteMultiple = () => {
    const navigate = useNavigate(); // Initialiser le hook useNavigate
    const [produits, setProduits] = useState([]);
    const [panier, setPanier] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchProduits = async () => {
            try {
                const response = await axios.get('/api/produits');
                setProduits(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des produits :', error);
            }
        };
        fetchProduits();
    }, []);

    const ajouterAuPanier = (produit) => {
        const existe = panier.find((item) => item.id === produit.id);
        if (!existe) {
            setPanier([...panier, { ...produit, quantite: 1, prix_total: produit.prix }]);
        }
    };

    const modifierQuantite = (id, quantite) => {
        if (quantite < 1) return;
        setPanier((prevPanier) =>
            prevPanier.map((item) =>
                item.id === id
                    ? { ...item, quantite, prix_total: quantite * item.prix }
                    : item
            )
        );
    };

    const supprimerDuPanier = (id) => {
        setPanier((prevPanier) => prevPanier.filter((item) => item.id !== id));
    };

    useEffect(() => {
        const nouveauTotal = panier.reduce((sum, item) => sum + item.prix_total, 0);
        setTotal(nouveauTotal);
    }, [panier]);

    const vendre = async () => {
        try {
            await axios.post('/api/ventes', { ventes: panier });
            alert('Ventes enregistrées avec succès !');
            setPanier([]);
        } catch (error) {
            console.error('Erreur lors de la vente :', error);
            alert(error.response?.data || 'Erreur lors de la soumission des ventes');
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Bouton retour */}
            <button
                className="bg-gray-500 text-white px-4 py-2 rounded self-start"
                onClick={() => navigate(-1)} // Retourne à la page précédente
            >
                Retour
            </button>

            <div className="flex gap-4">
                {/* Liste des produits */}
                <div className="w-1/2 border p-4">
                    <h2 className="text-lg font-bold mb-4">Produits disponibles</h2>
                    <ul>
                        {produits.map((produit) => (
                            <li key={produit.id} className="mb-2 flex justify-between">
                                <span>{produit.nom} - {produit.prix} {produit.unite}</span>
                                <button
                                    className="bg-blue-500 text-white px-2 py-1 rounded"
                                    onClick={() => ajouterAuPanier(produit)}
                                >
                                    Ajouter
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Panier */}
                <div className="w-1/2 border p-4">
                    <h2 className="text-lg font-bold mb-4">Panier</h2>
                    {panier.length === 0 ? (
                        <p>Aucun produit dans le panier.</p>
                    ) : (
                        <>
                            <ul>
                                {panier.map((item) => (
                                    <li key={item.id} className="mb-2">
                                        <div className="flex justify-between items-center">
                                            <span>{item.nom}</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantite}
                                                    className="border px-2 py-1 w-16"
                                                    onChange={(e) =>
                                                        modifierQuantite(item.id, parseInt(e.target.value, 10))
                                                    }
                                                />
                                                <span>{item.prix_total.toFixed(2)}</span>
                                                <button
                                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                                    onClick={() => supprimerDuPanier(item.id)}
                                                >
                                                    Retirer
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4">
                                <h3 className="text-xl font-bold">Total : {total.toFixed(2)}</h3>
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                                    onClick={vendre}
                                >
                                    Vendre
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VenteMultiple;
