const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

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
  response.send(
    movieArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
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
  response.send("Movie Successfully Added");
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const getResponse = await db.get(getQuery);
  response.send(getResponse);
});
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updatePutQuery = `UPDATE movie 
    SET director_id = "${directorId}",
    movie_name = "${movieName}",
    lead_actor = "${leadActor}"
    WHERE movie_id = ${movieId};`;
  const updateResponse = await db.run(updatePutQuery);
  response.send("Movie Details Updated");
  console.log(request.body);
});
module.exports = app;
