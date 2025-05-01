"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

// Định nghĩa kiểu dữ liệu cho order
interface Order {
  id: number
  user_id: number
  total_amount: string
  status: string
  payment_method: string
  note: string
  createdAt: string
  updatedAt: string
  orderDetails: any[]
  user: {
    id: number
    username: string
    full_name: string
    role: string
  }
}

// Định nghĩa kiểu dữ liệu cho response API
interface OrdersResponse {
  total: number
  totalPages: number
  currentPage: number
  orders: Order[]
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [isMounted, setIsMounted] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  })
  const { toast } = useToast()
  const router = useRouter()

  // Lấy danh sách đơn hàng từ API
  const fetchOrders = async () => {
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
      let url = "http://localhost:5000/api/orders?"
      if (searchTerm) url += `id=${encodeURIComponent(searchTerm)}&`
      if (selectedStatus !== "all") url += `status=${selectedStatus}&`
      
      // Thêm tham số phân trang
      url += `page=${pagination.currentPage}&limit=10`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách đơn hàng")
      }

      const data = await response.json()
      console.log("Dữ liệu đơn hàng:", data)
      
      // Kiểm tra cấu trúc dữ liệu trả về
      if (data && typeof data === 'object' && 'orders' in data) {
        // API trả về đối tượng có cấu trúc { total, totalPages, currentPage, orders }
        setOrders(Array.isArray(data.orders) ? data.orders : [])
        setPagination({
          total: data.total || 0,
          totalPages: data.totalPages || 0,
          currentPage: data.currentPage || 1,
        })
      } else if (Array.isArray(data)) {
        // API trả về mảng đơn hàng trực tiếp
        setOrders(data)
      } else {
        // Dữ liệu không đúng định dạng
        setOrders([])
        console.error("Dữ liệu API không đúng định dạng:", data)
      }
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lấy danh sách đơn hàng",
      })
      // Đặt orders là mảng rỗng khi có lỗi
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      fetchOrders()
    } else {
      router.push("/login")
    }
  }, [])

  // Cập nhật danh sách đơn hàng khi thay đổi bộ lọc
  useEffect(() => {
    if (isMounted) {
      fetchOrders()
    }
  }, [searchTerm, selectedStatus, pagination.currentPage])

  if (!isMounted) {
    return null
  }

  const statuses = ["completed", "pending", "cancelled"]

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành"
      case "pending":
        return "Đang xử lý"
      case "cancelled":
        return "Đã hủy"
      default:
        return status
    }
  }

  // Hàm lấy màu cho badge dựa trên trạng thái
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "default"
    }
  }

  // Hàm định dạng ngày tháng
  const formatDate = (dateString: string) => {
    if (!dateString) return "Không có ngày"
    try {
      return new Date(dateString).toLocaleString('vi-VN')
    } catch (error) {
      return dateString
    }
  }

  // Hàm định dạng tiền tệ
  const formatCurrency = (amount: string | number | undefined | null) => {
    if (amount === undefined || amount === null) return "0đ"
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return numericAmount.toLocaleString('vi-VN') + "đ"
  }

  // Hàm xử lý khi chuyển trang
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Đơn hàng</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm đơn hàng theo ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
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

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Ngày" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả ngày</SelectItem>
                    <SelectItem value="today">Hôm nay</SelectItem>
                    <SelectItem value="yesterday">Hôm qua</SelectItem>
                    <SelectItem value="week">7 ngày qua</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Tải danh sách đơn hàng</span>
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                    <TableHead className="text-right">Số sản phẩm</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
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
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Không tìm thấy đơn hàng nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>{order.user?.full_name || 'Khách lẻ'}</TableCell>
                        <TableCell className="text-right">{order.orderDetails?.length || 0}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              Xem
                            </Button>
                          </Link>
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
    </div>
  )
}
