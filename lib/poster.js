/**
 * Poster - Posts the image it's given to some social media site
 * 
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 * @version 1
 */

const Twit = require('twit')
const fs = require('fs-extra')
const debug = require('debug')('knkb:poster')

// post to twitter
module.exports = async (config, imagePath) => {
  debug('upload image', imagePath)

  const T = new Twit(config.twitter)

  // sadness
  return new Promise((resolv, reject) => {
    T.postMediaChunked({
      file_path: imagePath
    }, (err, data) => {
      if (err) return reject(err)

      debug('image uploaded')

      T.post('statuses/update', {
        skip_status: true,
        media_ids: [
          data.media_id_string
        ]
      }, (err, data) => {
        debug('created status (finished)')
        return resolv()
      })
    })
  })
}