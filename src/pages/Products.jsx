import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import ProductCard from '../components/ProductCard'
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi'
import '../styles/Products.css'

const CATEGORIES = ['All', 'Smartphones', 'Accessories', 'Tablets', 'Earphones', 'Chargers', 'Cases']
const BRANDS = ['All', 'Samsung', 'iPhone', 'Tecno', 'Infinix', 'Itel', 'Nokia', 'Xiaomi', 'Oppo']
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [brand, setBrand] = useState('All')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [priceRange, setPriceRange] = useState([0, 2000000])

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(collection(db, 'products'))
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setProducts(all)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  useEffect(() => {
    let result = [...products]
    if (search) result = result.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()))
    if (category !== 'All') result = result.filter(p => p.category?.toLowerCase() === category.toLowerCase())
    if (brand !== 'All') result = result.filter(p => p.brand?.toLowerCase() === brand.toLowerCase())
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') result.sort((a, b) => b.price - a.price)
    else if (sort === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setFiltered(result)
  }, [products, search, category, brand, sort, priceRange])

  function clearFilters() {
    setSearch(''); setCategory('All'); setBrand('All'); setSort('newest'); setPriceRange([0, 2000000])
    setSearchParams({})
  }

  return (
    <div className="products-page">
      {/* Top bar */}
      <div className="products-topbar">
        <div className="products-search-wrap">
          <FiSearch />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><FiX /></button>}
        </div>
        <button className="filter-toggle-btn" onClick={() => setShowFilter(!showFilter)}>
          <FiFilter /> Filters
        </button>
        <div className="sort-wrap">
          <select value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <FiChevronDown className="select-icon" />
        </div>
      </div>

      <div className="products-layout">
        {/* Sidebar Filter */}
        <aside className={`filter-sidebar ${showFilter ? 'open' : ''}`}>
          <div className="filter-header">
            <h3>Filters</h3>
            <button onClick={() => setShowFilter(false)} className="close-filter"><FiX /></button>
          </div>

          <div className="filter-group">
            <h4>Category</h4>
            {CATEGORIES.map(c => (
              <label key={c} className={`filter-option ${category === c ? 'active' : ''}`}>
                <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} />
                {c}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Brand</h4>
            {BRANDS.map(b => (
              <label key={b} className={`filter-option ${brand === b ? 'active' : ''}`}>
                <input type="radio" name="brand" value={b} checked={brand === b} onChange={() => setBrand(b)} />
                {b}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Price Range</h4>
            <div className="price-range">
              <span>₦{priceRange[0].toLocaleString()}</span>
              <span>₦{priceRange[1].toLocaleString()}</span>
            </div>
            <input
              type="range" min="0" max="2000000" step="10000"
              value={priceRange[1]}
              onChange={e => setPriceRange([0, Number(e.target.value)])}
            />
          </div>

          <button className="clear-filters-btn" onClick={clearFilters}>Clear All Filters</button>
        </aside>

        {/* Products grid */}
        <div className="products-main">
          <div className="products-results-info">
            <span>{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</span>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => <div className="product-skeleton" key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="products-grid">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
