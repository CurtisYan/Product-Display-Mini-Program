// 模拟 API 数据，实际项目中应从服务器获取
import { getProducts } from '../../shared/products.js'

// 分类结构定义 - 仅维护产品ID列表，具体产品数据从统一产品库获取
const categoryStructure = [
  {
    id: 'packaging',
    name: '塑料包装',
    children: [
      {
        id: 'bags',
        name: '塑料袋',
        productIds: ['zip', 'trash', 'food-bag', 'vacuum', 'mail', 'tshirt']
      },
      {
        id: 'bottles',
        name: '塑料瓶',
        productIds: ['pet-500', 'hdpe-milk', 'cos-100', 'pump', 'spray']
      },
      {
        id: 'boxes',
        name: '塑料盒',
        productIds: ['food-box', 'fresh-box', 'component-box']
      }
    ]
  }
]

// 将分类结构转换为包含完整产品数据的格式
function buildCategoriesWithProducts() {
  return categoryStructure.map(category => ({
    ...category,
    children: category.children.map(subcategory => ({
      ...subcategory,
      products: getProducts(subcategory.productIds) // 从产品库获取完整产品数据
    }))
  }))
}

// 模拟异步获取分类数据
export function fetchCategories() {
  return new Promise((resolve) => {
    // 立即返回数据，不添加人为延迟
    resolve(buildCategoriesWithProducts())
  })
}
