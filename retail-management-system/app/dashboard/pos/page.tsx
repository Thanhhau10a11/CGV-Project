"use client"

import { useState, useEffect } from "react"
import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

// Sample product data
const allProducts = [
  {
    id: 1,
    name: "Popcorn Large",
    category: "Food",
    price: 5.99,
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Coca Cola 500ml",
    category: "Drinks",
    price: 2.49,
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Nachos with Cheese",
    category: "Food",
    price: 4.99,
    image: "/placeholder.svg",
  },
  {
    id: 4,
    name: "Movie Souvenir Cup",
    category: "Merchandise",
    price: 9.99,
    image: "/placeholder.svg",
  },
  {
    id: 5,
    name: "Caramel Popcorn",
    category: "Food",
    price: 6.99,
    image: "/placeholder.svg",
  },
  {
    id: 6,
    name: "Bottled Water",
    category: "Drinks",
    price: 1.99,
    image: "/placeholder.svg",
  },
  {
    id: 7,
    name: "Movie Poster",
    category: "Merchandise",
    price: 14.99,
    image: "/placeholder.svg",
  },
  {
    id: 8,
    name: "Hot Dog",
    category: "Food",
    price: 3.99,
    image: "/placeholder.svg",
  },
  {
    id: 9,
    name: "Combo #1 (Popcorn + Drink)",
    category: "Combo",
    price: 7.99,
    image: "/placeholder.svg",
  },
  {
    id: 10,
    name: "Collectible Figurine",
    category: "Merchandise",
    price: 19.99,
    image: "/placeholder.svg",
  },
]

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [amountPaid, setAmountPaid] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "all" || product.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", "Food", "Drinks", "Merchandise", "Combo"]

  const addToCart = (product: (typeof allProducts)[0]) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === id)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
      } else {
        return prevCart.filter((item) => item.id !== id)
      }
    })
  }

  const deleteFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  const handleCheckout = () => {
    const paid = Number.parseFloat(amountPaid)
    if (isNaN(paid) || paid < total) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount that covers the total",
      })
      return
    }

    const change = paid - total
    toast({
      title: "Order completed",
      description: `Change: $${change.toFixed(2)}`,
    })

    // Create a new order
    const newOrderId = Math.floor(1000 + Math.random() * 9000)
    console.log("New order created:", {
      id: newOrderId,
      items: cart,
      total,
      date: new Date(),
    })

    // Reset
    setCart([])
    setAmountPaid("")
    setIsCheckoutOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Point of Sale</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Product Selection */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="mb-4 flex flex-wrap">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="capitalize">
                      {category === "all" ? "All Products" : category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={activeCategory} className="m-0">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="cursor-pointer overflow-hidden transition-all hover:border-primary"
                        onClick={() => addToCart(product)}
                      >
                        <div className="aspect-square w-full bg-muted">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={200}
                            height={200}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <CardContent className="p-3">
                          <div className="text-sm font-medium line-clamp-1">{product.name}</div>
                          <div className="mt-1 font-bold">${product.price.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Cart */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Current Order
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {cart.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
                  <ShoppingCart className="mb-2 h-10 w-10" />
                  <p>Your cart is empty</p>
                  <p className="text-sm">Add products by clicking on them</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => addToCart(allProducts.find((p) => p.id === item.id)!)}
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col border-t p-4">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={clearCart} disabled={cart.length === 0}>
                  Clear
                </Button>
                <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={cart.length === 0}>Checkout</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Complete Order</DialogTitle>
                      <DialogDescription>Enter payment details to complete the order.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax (10%)</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Amount Paid</span>
                          <div className="relative w-32">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min={total}
                              className="pl-7"
                              value={amountPaid}
                              onChange={(e) => setAmountPaid(e.target.value)}
                            />
                          </div>
                        </div>
                        {amountPaid && !isNaN(Number.parseFloat(amountPaid)) && (
                          <div className="flex justify-between">
                            <span>Change</span>
                            <span>${Math.max(0, Number.parseFloat(amountPaid) - total).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCheckout}>Complete Order</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
