// 引入 'pg' 这个包，它是 Node.js 用来连接 PostgreSQL 的工具
const { Pool } = require('pg');

// 创建一个新的连接池（可以高效地管理多个数据库连接）
const pool = new Pool({
  user: 'postgres',           // 数据库用户名 (保持 'postgres' 不变)
  host: 'localhost',          // 数据库地址 (保持 'localhost' 不变)
  database: 'ecommerce_1',      // 你的数据库名字 (我们创建的是 'ecommerce_1')
  password: 'postgres1',     // ！！！！在这里填入你安装 PostgreSQL 时设置的密码 ！！！！
  port: 5432,                 // 数据库端口号 (保持 5432 不变)
});

// 导出一个查询函数，这样其他文件就可以用它来操作数据库了
module.exports = {
  query: (text, params) => pool.query(text, params),
};