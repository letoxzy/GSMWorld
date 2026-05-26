import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore'
import toast from 'react-hot-toast'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([])
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser) { setWishlistItems([]); return }
    const ref = collection(db, 'users', currentUser.uid, 'wishlist')
    const unsub = onSnapshot(ref, (snap) => {
      setWishlistItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [currentUser])

  async function addToWishlist(product) {
    if (!currentUser) { toast.error('Please login first'); return }
    const ref = doc(db, 'users', currentUser.uid, 'wishlist', product.id)
    await setDoc(ref, product)
    toast.success('Added to wishlist!')
  }

  async function removeFromWishlist(productId) {
    if (!currentUser) return
    await deleteDoc(doc(db, 'users', currentUser.uid, 'wishlist', productId))
    toast.success('Removed from wishlist')
  }

  function isWishlisted(productId) {
    return wishlistItems.some(i => i.id === productId)
  }

  function toggleWishlist(product) {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
