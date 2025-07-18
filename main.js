document.addEventListener('DOMContentLoaded', () => {

  const productsList = document.getElementById('products-list');
  const addProductForm = document.getElementById('add-product-form');

  // --- 关键配置：从环境变量中读取 Supabase URL 和 Anon Key ---
  // 确保这些环境变量在 Netlify 中设置了 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // --- 调试：请确保这两行存在 ---
  console.log('DEBUG: SUPABASE_URL is', SUPABASE_URL);
  console.log('DEBUG: SUPABASE_ANON_KEY is', SUPABASE_ANON_KEY);
  // --- 调试结束 ---

  // --- 获取商品列表的函数 ---
  async function fetchProducts() {
    try {
      // 在发起请求前，检查 Supabase 配置是否已加载
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error("Supabase URL or Anon Key is missing. Please check your Netlify environment variables.");
        productsList.innerHTML = '<li>加载商品失败：配置错误。</li>';
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
        headers: { 'apikey': SUPABASE_ANON_KEY }
      });

      if (!response.ok) {
        // 如果响应不成功（例如 401 Unauthorized, 403 Forbidden），抛出错误
        const errorData = await response.json();
        throw new Error(`获取商品失败：${response.status} - ${errorData.message || response.statusText}`);
      }

      const products = await response.json();
      displayProducts(products);
    } catch (error) {
      console.error("无法获取商品:", error);
      productsList.innerHTML = `<li>加载商品失败：${error.message || '未知错误'}。</li>`;
    }
  }

  // --- 显示商品列表的函数 ---
  function displayProducts(products) {
    productsList.innerHTML = ''; // 清空现有列表
    if (products.length === 0) {
      productsList.innerHTML = '<li>当前没有商品。</li>';
      return;
    }
    products.forEach(product => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <h3>${product.name}</h3>
        <p><strong>描述(英文):</strong> ${product.description_en || '无'}</p>
        <p><strong>描述(中文):</strong> ${product.description_zh || '无'}</p>
        <p><strong>描述(阿拉伯语):</strong> ${product.description_ar || '无'}</p>
        <p><strong>价格:</strong> $${product.price ? product.price.toFixed(2) : 'N/A'}</p>
        ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" style="max-width:100px; max-height:100px;">` : ''}
        <button class="delete-btn" data-id="${product.id}">删除</button>
      `;
      productsList.appendChild(listItem);
    });

    // 为所有删除按钮添加事件监听器
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', async (event) => {
        const productId = event.target.dataset.id;
        if (confirm(`确定要删除商品 ID: ${productId} 吗？`)) {
          await deleteProduct(productId);
          fetchProducts(); // 重新加载商品列表
        }
      });
    });
  }

  // --- 添加商品的函数 ---
  async function addProduct(productData) {
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error("Supabase URL or Anon Key is missing. Cannot add product.");
      }
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY // 使用 anon key 进行插入操作
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`添加商品失败：${response.status} - ${errorData.message || response.statusText}`);
      }

      console.log('商品添加成功！');
      addProductForm.reset(); // 清空表单
      fetchProducts(); // 重新加载商品列表
    } catch (error) {
      console.error("无法添加商品:", error);
      alert("添加商品失败：" + (error.message || '未知错误'));
    }
  }

  // --- 删除商品的函数 ---
  async function deleteProduct(productId) {
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error("Supabase URL or Anon Key is missing. Cannot delete product.");
      }
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY // 使用 anon key 进行删除操作
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`删除商品失败：${response.status} - ${errorData.message || response.statusText}`);
      }

      console.log(`商品 ID: ${productId} 删除成功！`);
    } catch (error) {
      console.error("无法删除商品:", error);
      alert("删除商品失败：" + (error.message || '未知错误'));
    }
  }

  // --- 表单提交事件监听器 ---
  addProductForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // 阻止表单默认提交行为

    const productData = {
      name: document.getElementById('product-name').value,
      description_en: document.getElementById('product-desc-en').value,
      description_zh: document.getElementById('product-desc-zh').value,
      description_ar: document.getElementById('product-desc-ar').value,
      price: parseFloat(document.getElementById('product-price').value), // 转换为浮点数
      image_url: document.getElementById('product-image').value
    };

    // 可以在这里添加一些基本的表单验证
    if (!productData.name || isNaN(productData.price)) {
      alert('请输入商品名称和有效价格。');
      return;
    }

    await addProduct(productData);
  });

  // --- 页面加载时初始获取商品列表 ---
  fetchProducts();

});