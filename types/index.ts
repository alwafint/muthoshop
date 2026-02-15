export type Product = {
  id: string
  name: string
  barcode: string
  price: number
  stock: number
  image_url: string | null
}

export type CartItem = Product & {
  cartQuantity: number
}