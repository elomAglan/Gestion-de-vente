import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Button,
  Table,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Col,
  Alert,
  Pagination,
  PaginationItem,
  PaginationLink
} from 'reactstrap';

function Stock() {
  const [articles, setArticles] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    quantite: '',
    type: 'Entrée',
    fournisseur: ''
  });
  const [alert, setAlert] = useState({ visible: false, message: '', color: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mouvementsPerPage] = useState(10);  // Pagination par 10

  // Récupérer les articles et les mouvements au démarrage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesResponse, mouvementsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/produits'),
          fetch('http://localhost:5000/api/mouvements')
        ]);

        if (articlesResponse.ok && mouvementsResponse.ok) {
          const articlesData = await articlesResponse.json();
          const mouvementsData = await mouvementsResponse.json();
          setArticles(articlesData);
          setMouvements(mouvementsData);
        } else {
          showAlert('Erreur lors du chargement des données.', 'danger');
        }
      } catch (error) {
        console.error('Erreur réseau :', error);
        showAlert('Erreur réseau. Veuillez réessayer plus tard.', 'danger');
      }
    };

    fetchData();
  }, []);

  // Afficher les alertes
  const showAlert = (message, color) => {
    setAlert({ visible: true, message, color });
    setTimeout(() => setAlert({ visible: false, message: '', color: '' }), 3000);
  };

  // Mettre à jour la quantité d'un article
  const handleUpdateQuantite = async (produitId, quantite) => {
    try {
      const response = await fetch(`http://localhost:5000/api/produits/${produitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantite })
      });

      if (response.ok) {
        setArticles((prev) =>
          prev.map((article) =>
            article.id === produitId ? { ...article, quantite } : article
          )
        );
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
    }
  };

  // Gérer les mouvements (ajouter ou retirer du stock)
  const handleMouvement = async () => {
    const article = articles.find((a) => a.nom === formData.nom);
    if (!article) {
      showAlert('Produit introuvable.', 'danger');
      return;
    }

    const quantite = parseInt(formData.quantite, 10);
    const nouveauStock =
      formData.type === 'Entrée' ? article.quantite + quantite : article.quantite - quantite;

    if (nouveauStock < 0) {
      showAlert('Quantité insuffisante en stock.', 'warning');
      return;
    }

    // Mettre à jour la quantité du produit dans la base
    await handleUpdateQuantite(article.id, nouveauStock);

    const nouveauMouvement = {
      produit_id: article.id,
      type_mouvement: formData.type,
      quantite,
      date_mouvement: new Date().toISOString(),
      fournisseur: formData.fournisseur
    };

    // Ajouter un nouveau mouvement à la base de données
    try {
      const response = await fetch('http://localhost:5000/api/mouvements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouveauMouvement)
      });

      if (response.ok) {
        setMouvements((prev) => [...prev, { ...nouveauMouvement, nom: article.nom }]);
        setFormData({ nom: '', quantite: '', type: 'Entrée', fournisseur: '' });
        showAlert('Mouvement enregistré avec succès.', 'success');
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
      showAlert('Erreur lors de l\'enregistrement.', 'danger');
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.quantite > 0) {
      handleMouvement();
    } else {
      showAlert('Veuillez entrer une quantité valide.', 'warning');
    }
  };

  // Fonction de recherche
  const filteredMouvements = mouvements.filter((mouvement) =>
    mouvement.produit_id
      ? articles.find((article) => article.id === mouvement.produit_id)?.nom
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : false
  );

  // Trier les mouvements par date décroissante
  const sortedMouvements = filteredMouvements.sort((a, b) => {
    return new Date(b.date_mouvement) - new Date(a.date_mouvement);
  });

  // Pagination: obtenir les mouvements de la page actuelle
  const indexOfLastMovement = currentPage * mouvementsPerPage;
  const indexOfFirstMovement = indexOfLastMovement - mouvementsPerPage;
  const currentMouvements = sortedMouvements.slice(indexOfFirstMovement, indexOfLastMovement);

  // Gérer la pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container my-5">
      <h1 className="text-center text-dark mb-4">Gestion du Stock</h1>

      <Alert color={alert.color} isOpen={alert.visible}>
        {alert.message}
      </Alert>

      <Card className="p-4 shadow-lg border-0">
        <CardBody>
          <h2 className="card-title mb-4 text-success">Entrée / Sortie de Stock</h2>
          <Form onSubmit={handleSubmit}>
            <FormGroup row>
              <Col sm={6}>
                <Label for="nom">Produit</Label>
                <Input
                  type="select"
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                >
                  <option value="">Sélectionnez un produit</option>
                  {articles.map((article) => (
                    <option key={article.id} value={article.nom}>
                      {article.nom}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col sm={3}>
                <Label for="quantite">Quantité</Label>
                <Input
                  type="number"
                  id="quantite"
                  value={formData.quantite}
                  onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                  required
                />
              </Col>
              <Col sm={3}>
                <Label for="type">Type</Label>
                <Input
                  type="select"
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Entrée">Entrée</option>
                  <option value="Sortie">Sortie</option>
                </Input>
              </Col>
            </FormGroup>
            <FormGroup>
              <Label for="fournisseur">Fournisseur</Label>
              <Input
                type="text"
                id="fournisseur"
                value={formData.fournisseur}
                onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
              />
            </FormGroup>
            <Button type="submit" color="primary" className="mt-3 w-100">
              {formData.type === 'Entrée' ? 'Ajouter au stock' : 'Retirer du stock'}
            </Button>
          </Form>
        </CardBody>
      </Card>

      <div className="mt-5">
        <h2 className="mb-4 text-success">Historique des Mouvements</h2>
        
        {/* Champ de recherche */}
        <Input
          type="text"
          placeholder="Rechercher un produit..."
          className="mb-3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Table bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Produit</th>
              <th>Type</th>
              <th>Quantité</th>
              <th>Date</th>
              <th>Fournisseur</th>
            </tr>
          </thead>
          <tbody>
            {currentMouvements.map((mouvement, index) => (
              <tr key={index}>
                <td>{articles.find((a) => a.id === mouvement.produit_id)?.nom || 'N/A'}</td>
                <td>{mouvement.type_mouvement}</td>
                <td>{mouvement.quantite}</td>
                <td>{new Date(mouvement.date_mouvement).toLocaleString()}</td>
                <td>{mouvement.fournisseur}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Pagination */}
        <Pagination>
          {Array.from({ length: Math.ceil(sortedMouvements.length / mouvementsPerPage) }).map((_, index) => (
            <PaginationItem key={index} active={currentPage === index + 1}>
              <PaginationLink onClick={() => paginate(index + 1)}>
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
        </Pagination>
      </div>
    </div>
  );
}

export default Stock;
