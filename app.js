const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasepath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasepath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const consvertingMovieDbObjectToResponse = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leaddActor: dbObject.lead_actor,
  }
}
const convertingDirectorObjectToResponse = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getAllmovieObjectQuery = `
        SELECT 
        movie_name
        FROM
        movie;`

  const movieArray = await database.all(getAllmovieObjectQuery)
  response.send(
    movieArray.map(eachMovie => ({movieaName: eachMovie.movie_name})),
  )
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const getMovieQuery = `
        SELECT *
        FROM 
        movie
        WHERE 
        movie_id = ${movieId};`
  const movie = await database.get(getMovieQuery)
  response.send(consvertingMovieDbObjectToResponse(movie))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body

  const PostQuery = `
    INSERT INTO
        movie(directorId,movieName,leadActor)
    VALUES
    (${directorId},${movieName},${leadActor});
    `
  await database.run(PostQuery)
  response.send('Movie Successfully Added')
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body

  const PutQueryToUpdate = `
    UPDATE
    movie
    SET
    director_id = ${directorId},
    movie_name = ${movieName},
    lead_actor = ${leadActor},
    `
  await database.run(PutQueryToUpdate)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const DeleteQuery = `
    DELETE FROM
    movie
    WHERE 
    movie_id = ${movieId};
    `
  await database.run(DeleteQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const {directorId} = request.body

  const getDirectorQuery = `
    SELECT 
    *
    FROM
    director;`

  const directorsArray = await database.all(getDirectorQuery)
  response.send(
    directorsArray.map(eachDirector =>
      convertingDirectorObjectToResponse(eachDirector),
    ),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params

  const getDirectorSpecificQuery = `
        SELECT 
        movie_name
        
        FROM 
        movie
        
        WHERE 
        director_id = ${directorId};`

  const moviesArray = await database.all(getDirectorSpecificQuery)

  response.send(
    moviesArray.map(eachmovie => ({movieName: eachmovie.movie_name})),
  )
})

module.exports = app
