require('dotenv').config()

const client = (process.env.DB_CLIENT || 'sqlite3').toLowerCase()
const isMySQL = client === 'mysql2' || client === 'mysql'

const base = {
  migrations: {
    directory: './migrations'
  },
  useNullAsDefault: !isMySQL
}

const sqlite = {
  client: 'sqlite3',
  connection: {
    filename: process.env.SQLITE_FILE || process.env.SQLITE_PATH || './dev.sqlite3'
  }
}

const mysql = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'ticktick'
  }
}

module.exports = {
  development: {
    ...base,
    ...(isMySQL ? mysql : sqlite)
  },
  production: {
    ...base,
    ...(isMySQL ? mysql : sqlite)
  }
}
