// 统一产品库 - 集中管理所有产品数据
// 分类页和展示页均从此库引用，确保数据一致性

// 包装材料产品数据库
export const PRODUCTS = {
  // 塑料袋系列
  'zip': {
    id: 'zip',
    name: '自封袋',
    sub: '透明PE材质，密封性好，可重复使用',
    description: '采用优质PE材料制作，透明度高，密封性能优异，适用于食品、文件等物品包装。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 0.05,
    category: 'bags'
  },
  'trash': {
    id: 'trash',
    name: '垃圾袋',
    sub: '加厚设计，承重力强，不易破损',
    description: '加厚HDPE材质，承重能力强，不易破损，适用于家庭、办公室垃圾收集。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 0.08,
    category: 'bags'
  },
  'food-bag': {
    id: 'food-bag',
    name: '食品袋',
    sub: '食品级材质，安全无毒，透明美观',
    description: '食品级PE材质，符合食品安全标准，透明设计便于查看内容物。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 0.06,
    category: 'bags'
  },
  'vacuum': {
    id: 'vacuum',
    name: '真空袋',
    sub: '抽真空包装，延长保鲜期，节省空间',
    description: '专用真空包装袋，可配合真空机使用，有效延长食品保鲜期。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 0.12,
    category: 'bags'
  },
  'mail': {
    id: 'mail',
    name: '快递袋',
    sub: '防水防撕，快递专用，安全可靠',
    description: '防水防撕材质，适用于快递包装，保护物品在运输过程中的安全。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 0.15,
    category: 'bags'
  },
  'tshirt': {
    id: 'tshirt',
    name: '背心袋',
    sub: '购物便民，环保实用，承重力强',
    description: '购物专用背心袋，手提方便，承重能力强，环保可回收。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 0.03,
    category: 'bags'
  },

  // 塑料瓶系列
  'pet-500': {
    id: 'pet-500',
    name: 'PET矿泉水瓶 500ml',
    sub: '透明PET材质，轻便耐用，食品级安全',
    description: '500ml容量PET瓶，透明度高，重量轻，适用于饮料、矿泉水等液体包装。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 0.25,
    category: 'bottles'
  },
  'hdpe-milk': {
    id: 'hdpe-milk',
    name: 'HDPE奶瓶 1L',
    sub: '高密度聚乙烯，耐低温，适合乳制品',
    description: '1L容量HDPE瓶，耐低温性能好，适用于牛奶等乳制品包装。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 0.45,
    category: 'bottles'
  },
  'cos-100': {
    id: 'cos-100',
    name: '化妆品瓶 100ml',
    sub: '精美外观，密封性好，适合化妆品',
    description: '100ml化妆品专用瓶，外观精美，密封性能优异，适用于乳液、精华等。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 0.80,
    category: 'bottles'
  },
  'pump': {
    id: 'pump',
    name: '泵头瓶',
    sub: '按压式设计，使用方便，定量控制',
    description: '配备按压泵头，使用方便卫生，可定量控制出液量，适用于洗手液等。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 1.20,
    category: 'bottles'
  },
  'spray': {
    id: 'spray',
    name: '喷雾瓶',
    sub: '雾化效果好，喷洒均匀，多用途',
    description: '专业喷雾头设计，雾化效果佳，适用于清洁剂、护肤水等产品。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 0.95,
    category: 'bottles'
  },

  // 塑料盒系列
  'food-box': {
    id: 'food-box',
    name: '快餐盒',
    sub: '一次性使用，环保材质，密封性好',
    description: '一次性快餐盒，采用环保PP材质，密封性好，适用于外卖打包。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 0.35,
    category: 'boxes'
  },
  'fresh-box': {
    id: 'fresh-box',
    name: '保鲜盒',
    sub: '可重复使用，保鲜效果好，多规格',
    description: '家用保鲜盒，可重复使用，密封保鲜效果好，多种规格可选。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 2.50,
    category: 'boxes'
  },
  'component-box': {
    id: 'component-box',
    name: '元件盒',
    sub: '分格设计，透明可视，整理收纳',
    description: '多格分隔设计，透明材质便于查看，适用于小零件、药品等分类收纳。',
    image: '/static/logo.png',
    images: ['/static/logo.png'],
    price: 1.80,
    category: 'boxes'
  }
}

// 获取产品的辅助函数
export function getProduct(id) {
  return PRODUCTS[id] || null
}

// 批量获取产品
export function getProducts(ids) {
  return ids.map(id => PRODUCTS[id]).filter(Boolean)
}

// 获取展示页产品列表 - 随机显示商品库中的所有商品
export function getShowcaseProducts() {
  const allProducts = Object.values(PRODUCTS)
  // 使用Fisher-Yates洗牌算法进行随机排序，确保更好的随机性
  const shuffled = [...allProducts]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled // 返回所有产品，随机排序
}

// 获取指定展示页产品列表（可用于特定展示需求）
export function getSpecificShowcaseProducts(productIds) {
  return getProducts(productIds)
}

// 根据分类获取产品
export function getProductsByCategory(category) {
  return Object.values(PRODUCTS).filter(p => p.category === category)
}

// 搜索产品
export function searchProducts(keyword) {
  const lowerKeyword = keyword.toLowerCase()
  return Object.values(PRODUCTS).filter(p => 
    p.name.toLowerCase().includes(lowerKeyword) ||
    p.sub.toLowerCase().includes(lowerKeyword) ||
    p.description.toLowerCase().includes(lowerKeyword)
  )
}
