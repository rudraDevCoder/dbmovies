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
const convertDbObjectToResponseObjectMovie = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
const convertDbObjectToResponseObjectDirector = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
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
    movieArray.map((eachPlayer) =>
      convertDbObjectToResponseObjectMovie(eachPlayer)
    )
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
  response.send(convertDbObjectToResponseObject(getResponse));
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
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  const deleteItem = await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorNameQuery = `
    SELECT
      *
    FROM
      director`;
  const directorArray = await db.all(getDirectorNameQuery);
  response.send(
    directorArray.map((eachPlayer) =>
      convertDbObjectToResponseObjectDirector(eachPlayer)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directedMovies = `
    SELECT movie.movie_name AS movieName FROM director INNER JOIN movie ON director.director_id = movie.director_id
    WHERE movie.director_id = ${directorId};`;
  const getDirectorsMovies = await db.all(directedMovies);
  response.send(getDirectorsMovies);
});

module.exports = app;
