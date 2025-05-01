"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { use } from "react"

// Định nghĩa kiểu dữ liệu cho sản phẩm
interface Product {
  id: number
  category_id: number
  name: string
  code: string
  description: string
  price: string
  stock_quantity: number
  status: string
  image: string
  createdAt: string
  updatedAt: string
}

// Định nghĩa kiểu dữ liệu cho order detail
interface OrderDetail {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: string
  createdAt: string
  updatedAt: string
  product: Product
}

// Định nghĩa kiểu dữ liệu cho user
interface User {
  id: number
  username: string
  full_name: string
  role: string
  createdAt: string
  updatedAt: string
}

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
  orderDetails: OrderDetail[]
  user: User
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const orderId = resolvedParams.id

  // Lấy thông tin chi tiết đơn hàng từ API
  const fetchOrderDetail = async () => {
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

      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Không thể lấy thông tin đơn hàng")
      }

      const data = await response.json()
      console.log("Dữ liệu đơn hàng:", data)
      setOrder(data)
    } catch (error) {
      console.error("Lỗi khi lấy thông tin đơn hàng:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lấy thông tin đơn hàng",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      fetchOrderDetail()
    } else {
      router.push("/login")
    }
  }, [orderId])

  if (!isMounted) {
    return null
  }

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành"
      case "processing":
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
      case "processing":
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="mb-4">Không tìm thấy thông tin đơn hàng</p>
        <Button asChild>
          <Link href="/dashboard/orders">Quay lại danh sách đơn hàng</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/orders">
            <ChevronLeft className="h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Chi tiết đơn hàng #{order.id}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            In đơn hàng
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Tải xuống
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin đơn hàng</CardTitle>
            <CardDescription>Chi tiết về đơn hàng và sản phẩm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge variant={getStatusVariant(order.status)} className="mt-1">
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Ngày đặt hàng</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Sản phẩm</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderDetails && order.orderDetails.length > 0 ? (
                      order.orderDetails.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(parseFloat(item.price) * item.quantity)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Không có sản phẩm nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="w-1/3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng tiền hàng:</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
            <CardDescription>Chi tiết về khách hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Tên khách hàng</p>
                <p className="font-medium">{order.user?.full_name || "Khách lẻ"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
                <p className="font-medium">
                  {order.payment_method === "cash" ? "Tiền mặt" : 
                   order.payment_method === "card" ? "Thẻ" : 
                   order.payment_method === "transfer" ? "Chuyển khoản" : 
                   order.payment_method}
                </p>
              </div>

              {order.note && (
                <div>
                  <p className="text-sm text-muted-foreground">Ghi chú</p>
                  <p className="font-medium">{order.note}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 