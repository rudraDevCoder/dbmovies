const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
const up = express.json();
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
app.get("/movies/", async (request, response) => {
  const getMovieNameQuery = `
    SELECT
      *
    FROM
      movie`;
  const movieArray = await db.all(getMovieNameQuery);
  response.send(movieArray);
});
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const updateMovie = `INSERT INTO movie
    (director_id,movie_name,lead_actor)
    VALUES
    ('${directorId}',
    '${movieName}',
    '${leadActor}');`;
  const updateQuery = await db.run(updateMovie);
  const movie_id = updateQuery.lastId;
  response.send(updateQuery);
});
