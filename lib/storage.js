/**
 * storage - Quick storage layer for a flat db
 * 
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 * @version 1
 */

const fs = require('fs-extra')
const get = require('lodash.get')
const set = require('lodash.set')
const debug = require('debug')('knkb:db')

/**
 * DB Interface for a key, value storage 
 * @class DB
 */
class DB {
  constructor(path) {
    if (!path || path === "") {
      throw new Error("path should not be undefined or emtpy")
    }
  
    this.path = path
    this.data = {}

  }

  async save() {
    return fs.writeFile(this.path, JSON.stringify(this.data), 'utf8')
  }

  async load() {
    if (!await fs.exists(this.path)) {
      return
    }
    
    const bytes = await fs.readFile(this.path, 'utf8')
    this.data = JSON.parse(bytes)
  }

  get(path) {
    return get(this.data, path, 0)
  }

  set(path, value) {
    return set(this.data, path, value)
  }
}

module.exports = DB;