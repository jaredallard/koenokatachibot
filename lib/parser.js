/**
 * parser - generates thumbnails to be posted on Twitter
 * 
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 * @version 1
 */

const debug = require('debug')('knkb:parser')
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const util = require('util');
const exec = util.promisify(require('child_process').exec)

/**
 * Get the length of a movie
 * 
 * @param {String} path movie file path
 * @returns {Number} length of the movie in seconds
 */
const getMovieLength = async path => {
  return new Promise((resolv, reject) => {
    ffmpeg.ffprobe(path, (err, data) => {
      if (err) return reject(err)
      return resolv(data.format.duration)
    })
  })
}

module.exports = async (config, movie, db) => {
  // this is really hack, I'm sorry
  if (typeof movie === 'object' && Array.isArray(movie)) {
    // get the current movie from the DB
    // otherwise default to the first one
    const currentMovie = db.get('currentMovie') || 0
    if (currentMovie === 0) {
      db.set('currentMovie', 0)
      await db.save()
    }

    // if the current movie is greater than the length of the array
    // reset it to 0
    if (currentMovie >= (movie.length-1)) {
      // reset the current movie
      db.set('currentMovie', 0)
      await db.save()
    }

    movie = movie[currentMovie]
    debug('currentMovie', currentMovie, movie)
  }
    
  const movieName = path.parse(path.basename(movie)).name

  debug('loading file', movie, movieName)

  let ts = db.get(`movies.${movieName}`)
  debug('existing:ts', ts)

  if(ts === undefined) throw new Error("Invalid movie, not in database.")

  const maxLength = await getMovieLength(movie)

  const per = Math.floor((ts / maxLength) * 100)
  debug('ts', `${ts} / ${maxLength} ${per}%`)

  const saveDir = path.join(__dirname, '..', 'timestamps')
  const savePath = path.join(saveDir, `${ts}.png`)
  const mediaInfo = {
    path: savePath,
    sourceFile: movieName,
    ts: ts,
    percent: per
  }

  // if it doesn't already exist, generate it
  if (!await fs.exists(saveDir)) {
    await exec(`ffmpeg -ss ${ts} -copyts -i "${movie}" -vframes 1 -vf "subtitles='${movie}':stream_index=1" ${savePath}`)
  } else {
    debug('skipping image generation -- already exists')
  }

  ts += config.settings.movie_increment
  if (ts >= maxLength) {
    if (!config.settings.restart) {
      console.log("We're done here!")
      process.exit(0)
    }

    debug('ts:reset')
    ts = 0
    if (db.get('currentMovie') !== undefined) {
      db.set('currentMovie', db.get('currentMovie')+1)
    }
  }

  db.set(`movies.${movieName}`, ts)
  await db.save()

  return mediaInfo
}