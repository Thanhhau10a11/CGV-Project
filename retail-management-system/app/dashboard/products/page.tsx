"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Download, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

// Định nghĩa kiểu dữ liệu cho response API
interface ProductsResponse {
  total: number
  totalPages: number
  currentPage: number
  products: Product[]
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [user, setUser] = useState<{ role: string } | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const { toast } = useToast()

  // Lấy danh sách sản phẩm từ API
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
      if (selectedCategory !== "all") url += `category_id=${selectedCategory}&`
      if (selectedStatus !== "all") url += `status=${selectedStatus}&`
      if (stockFilter === "low") url += `min_stock=0&max_stock=30&`
      if (stockFilter === "out") url += `min_stock=0&max_stock=0&`
      if (stockFilter === "in") url += `min_stock=31&`
      
      // Thêm tham số phân trang
      url += `page=${pagination.currentPage}&limit=10`

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
      if (data && typeof data === 'object' && 'products' in data) {
        // API trả về đối tượng có cấu trúc { total, totalPages, currentPage, products }
        setProducts(Array.isArray(data.products) ? data.products : [])
        setPagination({
          total: data.total || 0,
          totalPages: data.totalPages || 0,
          currentPage: data.currentPage || 1,
        })
      } else if (Array.isArray(data)) {
        // API trả về mảng sản phẩm trực tiếp
        setProducts(data)
      } else {
        // Dữ liệu không đúng định dạng
        setProducts([])
        console.error("Dữ liệu API không đúng định dạng:", data)
      }
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lấy danh sách sản phẩm",
      })
      // Đặt products là mảng rỗng khi có lỗi
      setProducts([])
    } finally {
      setIsLoading(false)
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
      // Đảm bảo data là một mảng
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error)
      // Đặt categories là mảng rỗng khi có lỗi
      setCategories([])
    }
  }

  // Xóa sản phẩm
  const handleDeleteProduct = async (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  // Xác nhận xóa sản phẩm
  const confirmDelete = async () => {
    if (!productToDelete) return

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

      const response = await fetch(`http://localhost:5000/api/products/${productToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Không thể xóa sản phẩm")
      }

      toast({
        title: "Xóa sản phẩm thành công",
        description: `${productToDelete.name} đã được xóa thành công`,
      })

      // Cập nhật lại danh sách sản phẩm
      fetchProducts()
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa sản phẩm",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      fetchCategories()
      fetchProducts()
    }
  }, [])

  // Cập nhật danh sách sản phẩm khi thay đổi bộ lọc
  useEffect(() => {
    if (isMounted && user) {
      fetchProducts()
    }
  }, [searchTerm, selectedCategory, selectedStatus, stockFilter, pagination.currentPage])

  if (!isMounted) {
    return null
  }

  const statuses = ["selling", "discontinued", "out_of_stock"]

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "selling":
        return "Đang bán"
      case "discontinued":
        return "Ngừng kinh doanh"
      case "out_of_stock":
        return "Hết hàng"
      default:
        return status
    }
  }

  // Hàm lấy màu cho badge dựa trên trạng thái
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "selling":
        return "default"
      case "discontinued":
        return "secondary"
      case "out_of_stock":
        return "destructive"
      default:
        return "default"
    }
  }

  // Hàm xử lý khi chuyển trang
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Sản phẩm</h1>
        {user?.role === "admin" && (
          <Link href="/dashboard/products/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Mức tồn kho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả mức tồn kho</SelectItem>
                    <SelectItem value="in">Còn hàng</SelectItem>
                    <SelectItem value="low">Sắp hết</SelectItem>
                    <SelectItem value="out">Hết hàng</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="sr-only">Thêm bộ lọc</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Bộ lọc</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>Hiển thị sản phẩm ngừng kinh doanh</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked>Hiển thị giá</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked>Hiển thị mức tồn kho</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Tải danh sách sản phẩm</span>
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Mã</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-right">Tồn kho</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Không tìm thấy sản phẩm nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.code}</TableCell>
                        <TableCell>{product.category_name || "Chưa phân loại"}</TableCell>
                        <TableCell className="text-right">{product.price.toLocaleString('vi-VN')}đ</TableCell>
                        <TableCell className="text-right">{product.stock_quantity}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(product.status)}>
                            {getStatusLabel(product.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {user?.role === "admin" && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                                <Link href={`/dashboard/products/${product.id}/edit`}>
                                  <Button variant="ghost" size="sm">
                                    Sửa
                                  </Button>
                                </Link>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Phân trang */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Trước
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === pagination.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Sau
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog xác nhận xóa sản phẩm */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm "{productToDelete?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
