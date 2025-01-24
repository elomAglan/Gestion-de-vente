import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Une erreur est survenue.');
        return;
      }

      const data = await response.json();
      console.log('Connexion réussie :', data);

      // Enregistrer le rôle dans localStorage pour une utilisation ultérieure
      localStorage.setItem('role', data.role);

      // Redirection vers la page d'accueil (par exemple, /starter pour un utilisateur)
      navigate('/starter');
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      setErrorMessage('Erreur de connexion au serveur. Veuillez réessayer.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">Connexion</h2>
              {errorMessage && (
                <div className="alert alert-danger text-center">{errorMessage}</div>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Entrez votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mb-3">
                  Se connecter
                </Button>
                <div className="text-center mt-3">
                  <span>Vous n'avez pas de compte ? </span>
                  <Link to="/register" className="text-primary">Créer un compte</Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
