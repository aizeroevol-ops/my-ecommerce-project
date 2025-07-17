const { Pool } = require('pg');

let pool;

// 如果在生产环境（云端），就使用云数据库提供的 DATABASE_URL
if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // 否则，在本地开发环境，使用我们原来的配置
  pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ecommerce_1',
    password: '你的本地密码', // 别忘了这里还是你的本地密码
    port: 5432,
  });
}

module.exports = {
  query: (text, params) => pool.query(text, params),
};