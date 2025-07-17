// 当整个HTML页面加载完毕后，再执行我们的代码
document.addEventListener('DOMContentLoaded', () => {

  // --- 集中获取页面元素，方便管理 ---
  const productsList = document.getElementById('products-list');
  const addProductForm = document.getElementById('add-product-form');

  // ---------------------------------------------
  // --- 函数定义区 (我们所有的“能力”都定义在这里) ---
  // ---------------------------------------------

  // 1. 能力：获取所有商品
  async function fetchProducts() {
    try {
      const response = await fetch('http://localhost:3000/products');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const products = await response.json();
      displayProducts(products);
    } catch (error) {
      console.error("无法获取商品:", error);
      productsList.innerHTML = '<li>加载商品失败，请确认后端服务器是否正在运行。</li>';
    }
  }

  // 2. 能力：将商品显示在页面上
  function displayProducts(products) {
    productsList.innerHTML = '';
    if (products.length === 0) {
      productsList.innerHTML = '<li>当前没有商品。</li>';
      return;
    }
    products.forEach(product => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <h3>${product.name}</h3>
        <p><strong>描述:</strong> ${product.description_en}</p>
        <p><strong>价格:</strong> $${product.price}</p>
        <button class="edit-btn" data-id="${product.id}">编辑</button>
        <button class="delete-btn" data-id="${product.id}">删除</button>
      `;
      productsList.appendChild(listItem);
    });
  }

  // 3. 能力：删除一个商品
  async function deleteProduct(id) {
    try {
      const response = await fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('删除请求失败');
      console.log(`ID为 ${id} 的商品已成功从数据库删除`);
      fetchProducts();
    } catch (error) {
      console.error('删除商品时出错:', error);
      alert('删除商品失败！');
    }
  }

  // 4. 能力：更新一个商品
  async function updateProduct(id, data) {
    try {
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('更新请求失败');
      console.log(`ID为 ${id} 的商品已成功更新`);
      fetchProducts();
    } catch (error) {
      console.error('更新商品时出错:', error);
      alert('更新商品失败！');
    }
  }

  // ----------------------------------------------------
  // --- 事件监听区 (我们所有的“扳机”和“开关”都在这里) ---
  // ----------------------------------------------------

  // 扳机1：监听“添加新商品”表单的提交
  addProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const productData = {
      name: document.getElementById('product-name').value,
      description_en: document.getElementById('product-desc-en').value,
      description_zh: document.getElementById('product-desc-zh').value,
      description_ar: document.getElementById('product-desc-ar').value,
      price: parseFloat(document.getElementById('product-price').value),
      image_url: document.getElementById('product-image').value
    };
    try {
      const response = await fetch('http://localhost:3000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (!response.ok) throw new Error('Network response was not ok');
      addProductForm.reset();
      fetchProducts();
    } catch (error) {
      console.error('添加商品失败:', error);
      alert('添加商品失败，请检查控制台获取更多信息。');
    }
  });

  // 扳机2：监听商品列表中的所有点击（编辑/保存/取消/删除）
  productsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
      const isConfirmed = confirm('你确定要删除这件商品吗？');
      if (isConfirmed) {
        const productId = event.target.dataset.id;
        deleteProduct(productId);
      }
    }
    if (event.target.classList.contains('edit-btn')) {
      const editButton = event.target;
      const listItem = editButton.closest('li');
      const productId = editButton.dataset.id;
      const originalName = listItem.querySelector('h3').textContent;
      const originalDesc = listItem.querySelector('p:nth-of-type(1)').textContent.replace('描述: ', '');
      const originalPrice = listItem.querySelector('p:nth-of-type(2)').textContent.replace('价格: $', '');
      listItem.innerHTML = `
        <input type="text" class="edit-name" value="${originalName}">
        <input type="text" class="edit-desc" value="${originalDesc}">
        <input type="number" step="0.01" class="edit-price" value="${originalPrice}">
        <button class="save-btn" data-id="${productId}">保存</button>
        <button class="cancel-btn">取消</button>
      `;
    }
    if (event.target.classList.contains('save-btn')) {
      const saveButton = event.target;
      const listItem = saveButton.closest('li');
      const productId = saveButton.dataset.id;
      const updatedData = {
        name: listItem.querySelector('.edit-name').value,
        description_en: listItem.querySelector('.edit-desc').value,
        price: parseFloat(listItem.querySelector('.edit-price').value),
        description_zh: "（已更新）",
        description_ar: "（已更新）",
        image_url: "http://example.com/updated.jpg"
      };
      updateProduct(productId, updatedData);
    }
    if (event.target.classList.contains('cancel-btn')) {
      fetchProducts();
    }
  });

  // -----------------------------------
  // --- 初始加载 (程序的起点) ---
  // -----------------------------------
  fetchProducts();

});