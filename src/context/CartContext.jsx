import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, onSnapshot
} from 'firebase/firestore'
import toast from 'react-hot-toast'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser) { setCartItems([]); return }
    const ref = collection(db, 'users', currentUser.uid, 'cart')
    const unsub = onSnapshot(ref, (snap) => {
      setCartItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [currentUser])

  async function addToCart(product) {
    if (!currentUser) { toast.error('Please login to add to cart'); return }
    const ref = doc(db, 'users', currentUser.uid, 'cart', product.id)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      await updateDoc(ref, { quantity: snap.data().quantity + 1 })
    } else {
      await setDoc(ref, { ...product, quantity: 1 })
    }
    toast.success('Added to cart!')
  }

  async function removeFromCart(productId) {
    if (!currentUser) return
    await deleteDoc(doc(db, 'users', currentUser.uid, 'cart', productId))
    toast.success('Removed from cart')
  }

  async function updateQuantity(productId, quantity) {
    if (!currentUser) return
    if (quantity < 1) { await removeFromCart(productId); return }
    await updateDoc(doc(db, 'users', currentUser.uid, 'cart', productId), { quantity })
  }

  async function clearCart() {
    if (!currentUser) return
    const promises = cartItems.map(item =>
      deleteDoc(doc(db, 'users', currentUser.uid, 'cart', item.id))
    )
    await Promise.all(promises)
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ cartItems, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
