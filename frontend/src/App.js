import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import "./App.css";

function App() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently
  } = useAuth0();

  const [cities, setCities] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard data ONLY after login
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = await getAccessTokenSilently();

        const res = await axios.get("http://localhost:3001/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setCities(res.data.data);
        setLoadingData(false);
      } catch (err) {
        setError("Failed to load dashboard");
        setLoadingData(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // Auth0 loading
  if (isLoading) {
    return <h2 style={{ textAlign: "center" }}>Loading authentication…</h2>;
  }

  // Not logged in screen
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <h1>😶‍🌫️ Weather Comfort Index</h1>
        <p>You must log in to view the dashboard</p>
        <button onClick={() => loginWithRedirect()}>
          Login
        </button>
      </div>
    );
  }

  // Dashboard loading
  if (loadingData) {
    return <h2 style={{ textAlign: "center" }}>Loading weather data… 🌤️</h2>;
  }

  // Error state
  if (error) {
    return <h2 style={{ textAlign: "center", color: "red" }}>{error}</h2>;
  }

  // Dashboard UI
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <div style={{ textAlign: "right" }}>
        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
        >
          Logout
        </button>
      </div>

      <h1 style={{ textAlign: "center" }}>
        🌍 Weather Comfort Index Dashboard
      </h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px"
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={thStyle}>Rank</th>
            <th style={thStyle}>City</th>
            <th style={thStyle}>Temperature (°C)</th>
            <th style={thStyle}>Weather</th>
            <th style={thStyle}>Comfort Score</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city) => (
            <tr key={city.rank}>
              <td style={tdStyle}>{city.rank}</td>
              <td style={tdStyle}>{city.city}</td>
              <td style={tdStyle}>{city.temperature}</td>
              <td style={tdStyle}>{city.weather}</td>
              <td style={tdStyle}>{city.comfortScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center"
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center"
};

export default App;
