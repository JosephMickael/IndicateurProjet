// axiosRequest.js
const axios = require("axios");

function fetchData(date) {
  const username = "GPAO-IndicateursProd";
  const password = "Prod_Indicateurs-20190920";

  const authString = `${username}:${password}`;
  const encodedAuthString = Buffer.from(authString).toString("base64");

  const headers = {
    Authorization: `Basic ${encodedAuthString}`,
  };
  return axios
    .get(
      "https://mgta-wsgeo.jouve.com/WSGeo/geo/gpao_cumul_periode/" +
        date +
        "/" +
        date +
        "/MADAGASCAR/TANA?operateurs=true&filtre_optest=false",
      { headers }
    )
    .then((response) => {
      return response.data; // Renvoie les données de la réponse
    })
    .catch((error) => {
      throw error; // Renvoie l'erreur en cas d'échec de la requête
    });
}

module.exports = fetchData; 
