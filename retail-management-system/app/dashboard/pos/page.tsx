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

interface Category {
  id: string | number
  name: string
}

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: {
    id: number
    name: string
    description: string
    status: string
    createdAt: string
    updatedAt: string
  }
}

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
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          variant: "destructive",
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại",
        })
        return
      }

      // Xây dựng URL với các tham số lọc
      let url = "http://localhost:5000/api/products?"
      if (searchTerm) url += `name=${encodeURIComponent(searchTerm)}&`
      if (activeCategory !== "all") url += `category_id=${activeCategory}&`
      url += `status=selling&` // Chỉ lấy sản phẩm đang bán
      url += `min_stock=1&` // Chỉ lấy sản phẩm còn hàng
      url += `page=1&limit=100` // Lấy nhiều sản phẩm để hiển thị

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách sản phẩm")
      }

      const data = await response.json()
      
      // Kiểm tra cấu trúc dữ liệu trả về
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          // API trả về mảng sản phẩm trực tiếp
          setProducts(data)
        } else if (data.data && Array.isArray(data.data)) {
          // API trả về dạng { data: [...] }
          setProducts(data.data)
        } else if (data.products && Array.isArray(data.products)) {
          // API trả về dạng { products: [...] }
          setProducts(data.products)
        } else {
          console.error("Dữ liệu API không đúng định dạng:", data)
          setProducts([])
        }
      } else {
        console.error("Dữ liệu API không hợp lệ:", data)
        setProducts([])
      }
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lấy danh sách sản phẩm",
      })
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return null
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "all" || product.category.id === Number(activeCategory)
    return matchesSearch && matchesCategory
  })

  const categories: Category[] = [
    { id: "all", name: "Tất cả" },
    ...Array.from(new Set(products.map(p => p.category.id))).map(id => {
      const category = products.find(p => p.category.id === id)?.category
      return { id, name: category?.name || "" }
    })
  ]

  const addToCart = (product: Product) => {
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
  const total = subtotal // Bỏ thuế

  const handleCheckout = async () => {
    const paid = Number.parseFloat(amountPaid)
    if (isNaN(paid) || paid < total) {
      toast({
        variant: "destructive",
        title: "Số tiền không hợp lệ",
        description: "Vui lòng nhập số tiền lớn hơn hoặc bằng tổng tiền",
      })
      return
    }

    try {
      const orderData = {
        payment_method: "cash",
        note: `Thanh toán tiền mặt: ${paid.toLocaleString('vi-VN')}đ, Tiền thừa: ${(paid - total).toLocaleString('vi-VN')}đ`,
        total_amount: total,
        products: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        }))
      }

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tạo đơn hàng')
      }
      alert("Thanh toán thành công!")
      toast({
        title: "Thanh toán thành công",
        description: (
          <div className="space-y-1">
            <p>Mã đơn hàng: {data.id}</p>
            <p>Tổng tiền: {total.toLocaleString('vi-VN')}đ</p>
            <p>Tiền nhận: {paid.toLocaleString('vi-VN')}đ</p>
            <p>Tiền thừa: {(paid - total).toLocaleString('vi-VN')}đ</p>
          </div>
        ),
      })

      // Reset
      setCart([])
      setAmountPaid("")
      setIsCheckoutOpen(false)
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo đơn hàng",
      })
    }
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
                    placeholder="Tìm kiếm sản phẩm..."
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
                    <TabsTrigger key={String(category.id)} value={String(category.id)} className="capitalize">
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={activeCategory} className="m-0">
                  {isLoading ? (
                    <div className="flex h-40 items-center justify-center">
                      <p>Đang tải sản phẩm...</p>
                    </div>
                  ) : (
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
                            <div className="mt-1 font-bold">{product.price.toLocaleString('vi-VN')}đ</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
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
                Đơn hàng hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {cart.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
                  <ShoppingCart className="mb-2 h-10 w-10" />
                  <p>Giỏ hàng trống</p>
                  <p className="text-sm">Nhấp vào sản phẩm để thêm vào giỏ</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.price.toLocaleString('vi-VN')}đ x {item.quantity}
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
                          <span className="sr-only">Giảm số lượng</span>
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => addToCart(products.find((p) => p.id === item.id)!)}
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Tăng số lượng</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Xóa sản phẩm</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col border-t p-4">
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Tổng cộng</span>
                  <span>{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={clearCart} disabled={cart.length === 0}>
                  Xóa giỏ
                </Button>
                <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={cart.length === 0} onClick={() => setAmountPaid(total.toString())}>
                      Thanh toán
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hoàn tất đơn hàng</DialogTitle>
                      <DialogDescription>Nhập thông tin thanh toán để hoàn tất đơn hàng.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between font-bold">
                          <span>Tổng cộng</span>
                          <span>{total.toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Số tiền thanh toán</span>
                          <div className="relative w-32">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                              đ
                            </span>
                            <Input
                              type="number"
                              step="1000"
                              min={total}
                              className="pl-7"
                              value={amountPaid}
                              onChange={(e) => setAmountPaid(e.target.value)}
                            />
                          </div>
                        </div>
                        {amountPaid && !isNaN(Number.parseFloat(amountPaid)) && (
                          <div className="flex justify-between">
                            <span>Tiền thừa</span>
                            <span>{Math.max(0, Number.parseFloat(amountPaid) - total).toLocaleString('vi-VN')}đ</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                        Hủy
                      </Button>
                      <Button onClick={handleCheckout}>Hoàn tất</Button>
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
