/**
 * Koe No Katachi Bot - Posts a movie frame by frame to Twitter.
 * 
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 * @version 1
 */

const config = require('./config/config.json')

const DB = require('./lib/storage')
const parser = require('./lib/parser')
const poster = require('./lib/poster')
const debug = require('debug')('knkb:init')
const path = require('path')
const cron = require('cron')
const CronJob = cron.CronJob

const db = new DB(path.join(__dirname, "config/db.json"))

// async wrapper
const init = async () => {
  await db.load()

  if (!db.get("movies")) {
    debug('initializing database')
    db.set("movies", {})
  }

  debug('db loaded')

  const fn = async () => {
      debug('cron', 'fire')
      const media = await parser(config, config.video.path, db)
      try {
        await poster(config, media)
      } catch(e) {
        debug('error', e)
        debug('retrying')
        await poster(config, media)
      }
      debug('cron', 'done will fire again in', job.nextDates().c)
  }

  const job = new CronJob({
    cronTime: config.settings.post_cron,
    onTick: fn,
    start: false,
    timeZone: 'America/Los_Angeles'
  })

  job.start()

  debug('cron loaded')

  // start the first one
  await fn()
}

init()