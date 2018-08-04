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

// TODO: calculate the lengh of the movie so we don't
// start crashing when we go through the entire movie
module.exports = (config, movie, db) => {
  const movieName = path.parse(path.basename(movie)).name

  debug('loading file', movie, movieName)

  let pos = db.get(`movies.${movieName}`)
  debug('existing:pos', pos)

  if(pos === undefined) throw new Error("Invalid movie, not in database.")

  debug('starting at pos', pos)

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

      db.set(`movies.${movieName}`, pos)
      await db.save()
  
      return resolv(savePath)
    })
  })
}