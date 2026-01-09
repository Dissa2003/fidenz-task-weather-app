const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

// --------------------
// Comfort Index Formula
// --------------------
function calculateComfortIndex(temp, humidity, wind, clouds) {
  let score =
    100
    - Math.abs(temp - 22) * 2
    - humidity * 0.3
    - wind * 3
    - clouds * 0.1;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// --------------------
// Test Endpoint (Single City)
// --------------------
app.get("/weather", async (req, res) => {
  const cityId = 2172797; // Cairns

  const cached = cache.get(cityId);
  if (cached) {
    return res.json({ source: "cache", data: cached });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    const d = response.data;

    const result = {
      city: d.name,
      temperature: d.main.temp,
      weather: d.weather[0].description,
      comfortScore: calculateComfortIndex(
        d.main.temp,
        d.main.humidity,
        d.wind.speed,
        d.clouds.all
      )
    };

    cache.set(cityId, result);
    res.json({ source: "api", data: result });

  } catch (err) {
    res.status(500).json({ error: "Weather fetch failed" });
  }
});

// --------------------
// Dashboard Endpoint (ALL Cities)
// --------------------
app.get("/dashboard", async (req, res) => {
  const citiesData = require("./cities.json");
  const cities = citiesData.List;

  const cached = cache.get("dashboard");
  if (cached) {
    return res.json({ source: "cache", data: cached });
  }

  try {
    const results = [];

    for (let city of cities) {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?id=${city.CityCode}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
      );

      const d = response.data;

      results.push({
        city: city.CityName,
        temperature: d.main.temp,
        weather: d.weather[0].description,
        comfortScore: calculateComfortIndex(
          d.main.temp,
          d.main.humidity,
          d.wind.speed,
          d.clouds.all
        )
      });
    }

    results.sort((a, b) => b.comfortScore - a.comfortScore);
    results.forEach((c, i) => (c.rank = i + 1));

    cache.set("dashboard", results);
    res.json({ source: "api", data: results });

  } catch (err) {
    res.status(500).json({ error: "Dashboard load failed" });
  }
});

// --------------------
// Cache Debug Endpoint
// --------------------
app.get("/cache/status", (req, res) => {
  res.json({
    weather: cache.has(2172797) ? "HIT" : "MISS",
    dashboard: cache.has("dashboard") ? "HIT" : "MISS"
  });
});

// --------------------
app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
