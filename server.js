// 1. 引入必要的模块
const express = require('express');
const db = require('./db');
const cors = require('cors');

// 2. 创建 Express 应用
const app = express();
app.use(cors()); // 允许所有跨域请求
const port = 3000;

// 3. 配置中间件 (让服务器能读懂 JSON) -- 正确的位置在这里！
app.use(express.json());

// 4. 创建 API 路由
// 获取所有商品
app.get('/products', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('查询商品时出错:', err);
    res.status(500).send('服务器内部错误');
  }
});

// 添加新商品
app.post('/products', async (req, res) => {
  try {
    const { name, description_en, description_zh, description_ar, price, image_url } = req.body;
    const newProduct = await db.query(
      "INSERT INTO products (name, description_en, description_zh, description_ar, price, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description_en, description_zh, description_ar, price, image_url]
    );
    res.status(201).json(newProduct.rows[0]);
    console.log('成功添加一件新商品:', newProduct.rows[0]);
  } catch (err) {
    console.error('添加商品时出错:', err);
    res.status(500).send('服务器内部错误');
  }
});
// 6. 创建一个用于更新商品的 API 路由
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params; // 从 URL 中获取商品 id
    const { name, description_en, description_zh, description_ar, price, image_url } = req.body; // 从请求体中获取新的商品数据

    const updatedProduct = await db.query(
      "UPDATE products SET name = $1, description_en = $2, description_zh = $3, description_ar = $4, price = $5, image_url = $6 WHERE id = $7 RETURNING *",
      [name, description_en, description_zh, description_ar, price, image_url, id]
    );

    // 检查是否有商品被更新。如果没有，说明这个id不存在
    if (updatedProduct.rowCount === 0) {
      return res.status(404).send('未找到该ID的商品');
    }

    // 将更新后的商品信息返回
    res.status(200).json(updatedProduct.rows[0]);
    console.log('成功更新商品:', updatedProduct.rows[0]);

  } catch (err) {
    console.error('更新商品时出错:', err);
    res.status(500).send('服务器内部错误');
  }
});// 7. 创建一个用于删除商品的 API 路由
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params; // 从 URL 中获取要删除的商品 id

    const deletedProduct = await db.query("DELETE FROM products WHERE id = $1", [id]);

    // 检查是否有商品被删除。如果没有，说明这个id不存在
    if (deletedProduct.rowCount === 0) {
      return res.status(404).send('未找到该ID的商品');
    }

    // 成功删除后，标准的做法是返回 204 No Content 状态码，表示成功但没有内容返回
    res.status(204).send();
    console.log(`成功删除商品 ID: ${id}`);

  } catch (err) {
    console.error('删除商品时出错:', err);
    res.status(500).send('服务器内部错误');
  }
});
// 5. 启动服务器 (必须是最后一步)
// 5. 启动服务器 (这是云端适应版)
// Render 会通过 process.env.PORT 提供端口号
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`服务器正在端口 ${PORT} 上运行`); // 修改了日志输出
  try {
    // 我们在这里不再测试数据库连接，因为 Render 已经帮我们做了
    // 如果环境变量里的 DATABASE_URL 有问题，服务根本就启动不起来
    // 这种做法更符合云部署的实践
  } catch (err) {
    // 这段 catch 实际上可以简化或移除，因为连接失败会在服务启动前就报错
    console.error('启动时发生错误:', err);
  }
});