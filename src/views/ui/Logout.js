import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Suppression des données utilisateur du stockage local ou session
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');

    // Redirection vers la page de connexion
    navigate('/login');
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="p-4 shadow-sm text-center" style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body>
          <h2 className="mb-4">Déconnexion</h2>
          <p className="text-muted mb-4">Êtes-vous sûr de vouloir vous déconnecter ?</p>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="danger" onClick={handleLogout}>
              Oui, déconnecter
            </Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Annuler
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Logout;
