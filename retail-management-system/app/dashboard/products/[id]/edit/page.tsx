"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

// Định nghĩa kiểu dữ liệu cho product
interface Product {
  id: number
  name: string
  code: string
  category_id: number
  category_name?: string
  price: number
  stock_quantity: number
  status: string
  description?: string
  image_url?: string
}

// Định nghĩa kiểu dữ liệu cho category
interface Category {
  id: number
  name: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<{ role: string } | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const productId = params.id

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category_id: "",
    price: "",
    stock_quantity: "",
    description: "",
    status: "selling",
  })

  // Lấy thông tin sản phẩm từ API
  const fetchProduct = async () => {
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

      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Không thể lấy thông tin sản phẩm")
      }

      const product = await response.json()
      
      // Cập nhật form với dữ liệu sản phẩm
      setFormData({
        name: product.name,
        code: product.code,
        category_id: product.category_id.toString(),
        price: product.price.toString(),
        stock_quantity: product.stock_quantity.toString(),
        description: product.description || "",
        status: product.status,
      })

      // Hiển thị ảnh sản phẩm nếu có
      if (product.image_url) {
        setImagePreview(product.image_url)
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin sản phẩm:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lấy thông tin sản phẩm",
      })
    } finally {
      setIsLoadingProduct(false)
    }
  }

  // Lấy danh sách danh mục từ API
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return
      }

      const response = await fetch("http://localhost:5000/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách danh mục")
      }

      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lấy danh sách danh mục",
      })
    }
  }

  useEffect(() => {
    setIsMounted(true)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      if (parsedUser.role !== "admin") {
        router.push("/dashboard/products")
        toast({
          variant: "destructive",
          title: "Truy cập bị từ chối",
          description: "Bạn không có quyền truy cập trang này",
        })
      } else {
        fetchCategories()
        fetchProduct()
      }
    } else {
      router.push("/login")
    }
  }, [router, toast, productId])

  if (!isMounted || !user || user.role !== "admin") {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Tạo URL để xem trước ảnh
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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

      // Tạo FormData để gửi cả dữ liệu và file
      const formDataToSend = new FormData()
      
      // Thêm dữ liệu sản phẩm
      formDataToSend.append("name", formData.name)
      formDataToSend.append("code", formData.code)
      formDataToSend.append("category_id", formData.category_id)
      formDataToSend.append("price", formData.price)
      formDataToSend.append("stock_quantity", formData.stock_quantity)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("status", formData.status)
      
      // Thêm ảnh sản phẩm nếu có
      const imageFile = fileInputRef.current?.files?.[0]
      if (imageFile) {
        formDataToSend.append("image", imageFile)
      }

      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Không thể cập nhật sản phẩm")
      }

      toast({
        title: "Cập nhật sản phẩm thành công",
        description: `${formData.name} đã được cập nhật thành công`,
      })

      router.push("/dashboard/products")
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật sản phẩm",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/products">
            <ChevronLeft className="h-4 w-4" />
            Quay lại danh sách sản phẩm
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Sửa sản phẩm</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin sản phẩm</CardTitle>
          <CardDescription>Cập nhật thông tin chi tiết cho sản phẩm.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sản phẩm</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nhập tên sản phẩm"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Mã sản phẩm</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="Nhập mã sản phẩm"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Danh mục</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleSelectChange("category_id", value)}
                  required
                >
                  <SelectTrigger id="category_id">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Giá</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">đ</span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Số lượng tồn kho</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  placeholder="Nhập số lượng tồn kho"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="selling">Đang bán</SelectItem>
                    <SelectItem value="discontinued">Ngừng kinh doanh</SelectItem>
                    <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Nhập mô tả sản phẩm"
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Ảnh sản phẩm</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Tải lên ảnh mới
                  </Button>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setImagePreview(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                    >
                      Xóa ảnh
                    </Button>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Xem trước:</p>
                    <div className="relative w-40 h-40 border rounded-md overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Xem trước ảnh sản phẩm"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/products">Hủy</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 