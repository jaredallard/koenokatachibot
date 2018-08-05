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
      
      debug('metadata', data)

      return resolv(data.format.duration)
    })
  })
}

// TODO: calculate the lengh of the movie so we don't
// start crashing when we go through the entire movie
module.exports = async (config, movie, db) => {
  const movieName = path.parse(path.basename(movie)).name

  debug('loading file', movie, movieName)

  let pos = db.get(`movies.${movieName}`)
  debug('existing:pos', pos)

  if(pos === undefined) throw new Error("Invalid movie, not in database.")

  const maxLength = await getMovieLength(movie)

  const per = Math.floor((pos / maxLength) * 100)
  debug('pos', `${pos} / ${maxLength} ${per}%`)

  const saveDir = path.join(__dirname, '..', 'timestamps')
  const savePath = path.join(saveDir, `${pos}.png`)

  return new Promise((resolv, reject) => {
    ffmpeg(movie)
    .screenshot({
      timestamps: [ pos ],
      folder: saveDir,
      filename: path.basename(savePath),
      size: '800x?'
    })
    .on('end', async () => {
      debug('finished')

      pos += config.settings.movie_increment

      if (pos >= maxLength) {
        debug('pos:reset')
        pos = 0
      }

      db.set(`movies.${movieName}`, pos)
      await db.save()
  
      return resolv(savePath)
    })
  })
}