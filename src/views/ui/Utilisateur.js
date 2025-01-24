import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Utilisateur() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUtilisateurs = async () => {
      try {
        const token = localStorage.getItem('token'); // Récupère le token JWT depuis le stockage local
        const response = await fetch('http://localhost:5000/api/utilisateurs', {
          headers: {
            Authorization: `Bearer ${token}`, // Ajoute le token au header Authorization
          },
        });
  
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des utilisateurs.');
        }
  
        const data = await response.json();
        if (Array.isArray(data)) {
          setUtilisateurs(data);
        } else {
          throw new Error('Données reçues invalides.');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        setError('Impossible de charger les utilisateurs. Veuillez réessayer plus tard.');
      }
    };
  
    fetchUtilisateurs();
  }, []);
  

  // Récupération des utilisateurs depuis le backend
  useEffect(() => {
    const fetchUtilisateurs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/utilisateurs');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des utilisateurs.');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setUtilisateurs(data);
        } else {
          throw new Error('Données reçues invalides.');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        setError('Impossible de charger les utilisateurs. Veuillez réessayer plus tard.');
      }
    };
    fetchUtilisateurs();
  }, []);

  // Suppression d'un utilisateur
  const handleDeleteUser = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/utilisateurs/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Erreur lors de la suppression.');
        }
        const data = await response.json();
        if (data.message === 'Utilisateur supprimé avec succès') {
          setUtilisateurs((prevUtilisateurs) =>
            prevUtilisateurs.filter((user) => user.id !== id)
          );
          alert('Utilisateur supprimé avec succès !');
        } else {
          throw new Error('Message inattendu du serveur.');
        }
      } catch (err) {
        console.error('Erreur lors de la suppression de l’utilisateur:', err);
        alert('Une erreur est survenue lors de la suppression. Veuillez réessayer.');
      }
    }
  };

  // Mise à jour du rôle directement
  const handleChangeRole = async (id, role) => {
    try {
      const response = await fetch(`http://localhost:5000/api/utilisateurs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour.');
      }
      const data = await response.json();
      if (data.message === 'Rôle mis à jour avec succès') {
        setUtilisateurs((prevUtilisateurs) =>
          prevUtilisateurs.map((user) =>
            user.id === id ? { ...user, role } : user
          )
        );
        alert('Rôle modifié avec succès !');
      } else {
        throw new Error('Message inattendu du serveur.');
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du rôle:', err);
      alert('Une erreur est survenue lors de la mise à jour. Veuillez réessayer.');
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center text-dark mb-4">Gestion des Utilisateurs et des Rôles</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-bordered table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.length > 0 ? (
              utilisateurs.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className="form-select"
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      aria-label="Changer le rôle de l'utilisateur"
                    >
                      <option value="Utilisateur">Utilisateur</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(user.id)}
                      aria-label="Supprimer cet utilisateur"
                    >
                      <i className="bi bi-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Utilisateur;
