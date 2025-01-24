import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, CardTitle, CardSubtitle, Button } from "reactstrap";
import axios from "axios";
import { format } from 'date-fns'; // Importer la fonction pour formater les dates
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { parseISO, format as formatDate, startOfWeek, endOfWeek } from 'date-fns';

// Importation des icônes depuis react-icons
import { FaDollarSign, FaBoxOpen, FaTag } from "react-icons/fa"; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState({
    ventes: [],
    stock: [],
    produits: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("day");

  const fetchData = async () => {
    try {
      console.log("Chargement des données...");
      const [ventesRes, stockRes, produitsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/ventes"),
        axios.get("http://localhost:5000/api/mouvements"),
        axios.get("http://localhost:5000/api/produits"),
      ]);

      setData({
        ventes: ventesRes.data,
        stock: stockRes.data,
        produits: produitsRes.data,
      });
    } catch (error) {
      setError("Erreur lors du chargement des données");
      console.error("Erreur lors du chargement des données :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCFA = (amount) => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      return "Erreur";
    }
    return numericAmount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });
  };

  const filteredVentes = data.ventes.filter(vente => {
    const venteDate = parseISO(vente.date_vente);
    const today = new Date();

    if (selectedPeriod === "day") {
      return venteDate.getDate() === today.getDate() && venteDate.getMonth() === today.getMonth() && venteDate.getFullYear() === today.getFullYear();
    } else if (selectedPeriod === "week") {
      const startOfWeekDate = startOfWeek(today, { weekStartsOn: 1 });
      const endOfWeekDate = endOfWeek(today, { weekStartsOn: 1 });
      return venteDate >= startOfWeekDate && venteDate <= endOfWeekDate;
    } else if (selectedPeriod === "month") {
      return venteDate.getMonth() === today.getMonth() && venteDate.getFullYear() === today.getFullYear();
    }
  });

  const totalVentesPeriode = filteredVentes.reduce((sum, vente) => {
    const totalVente = parseFloat(vente.total);
    if (isNaN(totalVente)) {
      return sum;
    }
    return sum + totalVente;
  }, 0);

  const stockTotal = data.produits.reduce((sum, produit) => sum + produit.quantite, 0);

  const ventesParPeriode = filteredVentes.reduce((acc, vente) => {
    const venteDate = parseISO(vente.date_vente);
    let periodKey = "";

    if (selectedPeriod === "day") {
      periodKey = formatDate(venteDate, 'dd/MM');
    } else if (selectedPeriod === "week") {
      periodKey = formatDate(startOfWeek(venteDate), 'dd/MM') + " - " + formatDate(endOfWeek(venteDate), 'dd/MM');
    } else if (selectedPeriod === "month") {
      periodKey = formatDate(venteDate, 'MMM yyyy');
    }

    if (!acc[periodKey]) {
      acc[periodKey] = 0;
    }

    acc[periodKey] += parseFloat(vente.total);
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(ventesParPeriode),
    datasets: [
      {
        label: "Ventes (CFA)",
        data: Object.values(ventesParPeriode),
        backgroundColor: "rgba(75,192,192,0.5)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatCFA(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Période" },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Montant (CFA)" },
        grid: { color: "rgba(200,200,200,0.2)" },
        ticks: {
          callback: (value) => formatCFA(value),
        },
      },
    },
    datasets: {
      bar: {
        barThickness: 'flex', // Ajuste automatiquement la largeur des barres
        maxBarThickness: 40, // Définit une largeur maximale réaliste
        categoryPercentage: 0.8, // Ajuste l'espace entre les groupes
        barPercentage: 0.9, // Réduit légèrement la largeur relative des barres
      },
    },
  };
  
  

  const produitsTotal = data.produits.length;

  const handlePeriodChange = (event) => {
    setSelectedPeriod(event.target.value);
  };

  if (loading) {
    return <div className="text-center my-5">Chargement des données...</div>;
  }

  if (error) {
    return <div className="text-center my-5 text-danger">{error}</div>;
  }

  return (
    <div className="container my-5">
      <h1 className="text-center text-primary mb-5">Tableau de Bord</h1>
      
      <Row className="mb-4">
        <Col sm="12" md="4">
          <Card className="shadow-lg text-center" style={{ backgroundColor: '#007BFF', color: 'white' }}>
            <CardBody>
              <CardTitle tag="h5">
                <FaDollarSign className="mr-2" />
                Total des Ventes
              </CardTitle>
              <CardSubtitle className="mb-2">{formatCFA(totalVentesPeriode)}</CardSubtitle>
            </CardBody>
          </Card>
        </Col>
        <Col sm="12" md="4">
          <Card className="shadow-lg text-center" style={{ backgroundColor: '#FFA000', color: 'white' }}>
            <CardBody>
              <CardTitle tag="h5">
                <FaTag className="mr-2" />
                Produits
              </CardTitle>
              <CardSubtitle className="mb-2">{produitsTotal} produits</CardSubtitle>
            </CardBody>
          </Card>
        </Col>
        <Col sm="12" md="4">
          <Card className="shadow-lg text-center" style={{ backgroundColor: '#28A745', color: 'white' }}>
            <CardBody>
              <CardTitle tag="h5">
                <FaBoxOpen className="mr-2" />
                Stock
              </CardTitle>
              <CardSubtitle className="mb-2">{stockTotal} articles</CardSubtitle>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col sm="12">
          <div className="d-flex justify-content-start mb-3">
            <Button 
              color={selectedPeriod === 'day' ? 'primary' : 'secondary'} 
              onClick={() => handlePeriodChange({ target: { value: 'day' } })}
              className="mx-2">
              Jour
            </Button>
            <Button 
              color={selectedPeriod === 'month' ? 'primary' : 'secondary'} 
              onClick={() => handlePeriodChange({ target: { value: 'month' } })}
              className="mx-2">
              Mois
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col sm="12">
          <Card className="shadow-lg">
            <CardBody>
              <CardTitle tag="h5">Graphique des Ventes</CardTitle>
              <Bar data={chartData} options={chartOptions} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
