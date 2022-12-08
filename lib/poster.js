/**
 * Poster - Posts the image it's given to some social media site
 * 
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 * @version 1
 */

const { login } = require('masto')
const fs = require('fs')
const debug = require('debug')('knkb:poster')

const toHHMMSS = (str) => {
  var sec_num = parseInt(str, 10); // don't forget the second param
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  return minutes + ':' + seconds;
}

// post to twitter
module.exports = async (config, media) => {
  debug('upload image', media.path)

  const masto = await login(config.masto+{
    timeout: 15 * 1000, // 15 seconds
  })

  const status_text = `${media.sourceFile.replace('Kanojo, Okarishimasu ', '').replace('E', ' Ep ')} - ${toHHMMSS(media.ts)} (${media.percent}%)`

  const mediaAttachment = await masto.mediaAttachments.create({
    file: fs.createReadStream(media.path),
  })
  const status = await masto.statuses.create({
    status: status_text,
    media_ids: [mediaAttachment.id],
  })
  debug('posted', {
    status_url: status.url,
    media_url: mediaAttachment.url,
  })

  return
}