const axios = require("axios");

const getWebjipsData = (req, res) => {
  const username = "GPAO-IndicateursProd";
  const password = "Prod_Indicateurs-20190920";

  const authString = `${username}:${password}`;
  const encodedAuthString = Buffer.from(authString).toString("base64");

  const headers = {
    Authorization: `Basic ${encodedAuthString}`,
  };

  axios
    .get(
      `https://mgta-wsgeo.jouve.com/WSGeo/geo/gpao_cumul_periode/2023-01-02/2023-01-4/MADAGASCAR/TANA?operateurs=true&filtre_optest=false`,
      { headers }
    )
    .then((response) => {
      const jsonData = response.data;
      res.json(jsonData);
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données JSON:", error);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des données JSON" });
    });
};

module.exports = { getWebjipsData };
