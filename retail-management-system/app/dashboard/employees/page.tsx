"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Edit, Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

// Định nghĩa kiểu dữ liệu cho nhân viên
interface Employee {
  id: number
  username: string
  full_name: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    role: "staff",
    password: "",
    confirmPassword: "",
  })
  const [user, setUser] = useState<{ role: string } | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Hàm lấy danh sách nhân viên từ API
  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          variant: "destructive",
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại",
        })
        return
      }

      const response = await fetch(`http://localhost:5000/api/users?search=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách nhân viên")
      }

      const data = await response.json()
      setEmployees(data.users)
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể lấy danh sách nhân viên. Vui lòng thử lại sau.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      if (parsedUser.role !== "admin") {
        toast({
          variant: "destructive",
          title: "Truy cập bị từ chối",
          description: "Bạn không có quyền truy cập trang này",
        })
      } else {
        fetchEmployees()
      }
    }
  }, [toast])

  // Gọi lại API khi thay đổi từ khóa tìm kiếm
  useEffect(() => {
    if (user?.role === "admin") {
      const delayDebounceFn = setTimeout(() => {
        fetchEmployees()
      }, 500)
      return () => clearTimeout(delayDebounceFn)
    }
  }, [searchTerm, user?.role])

  if (!isMounted || !user || user.role !== "admin") {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddEmployee = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Mật khẩu không khớp",
        description: "Vui lòng đảm bảo mật khẩu xác nhận khớp với mật khẩu",
      })
      return
    }

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

      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Không thể thêm nhân viên")
      }

      await fetchEmployees()
      setIsAddDialogOpen(false)
      setFormData({
        username: "",
        full_name: "",
        role: "staff",
        password: "",
        confirmPassword: "",
      })

      toast({
        title: "Thêm nhân viên thành công",
        description: `${formData.full_name} đã được thêm thành công`,
      })
    } catch (error) {
      console.error("Lỗi khi thêm nhân viên:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể thêm nhân viên. Vui lòng thử lại sau.",
      })
    }
  }

  const handleEditEmployee = async () => {
    if (!currentEmployee) return

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

      const updateData: any = {
        username: formData.username,
        full_name: formData.full_name,
        role: formData.role,
      }

      // Chỉ cập nhật mật khẩu nếu người dùng nhập mật khẩu mới
      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch(`http://localhost:5000/api/users/${currentEmployee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Không thể cập nhật nhân viên")
      }

      await fetchEmployees()
      setIsEditDialogOpen(false)
      setCurrentEmployee(null)

      toast({
        title: "Cập nhật nhân viên thành công",
        description: `${formData.full_name} đã được cập nhật thành công`,
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật nhân viên:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật nhân viên. Vui lòng thử lại sau.",
      })
    }
  }

  const handleDeleteEmployee = async () => {
    if (!currentEmployee) return

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

      const response = await fetch(`http://localhost:5000/api/users/${currentEmployee.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Không thể xóa nhân viên")
      }

      await fetchEmployees()
      setIsDeleteDialogOpen(false)
      setCurrentEmployee(null)

      toast({
        title: "Xóa nhân viên thành công",
        description: "Nhân viên đã được xóa thành công",
      })
    } catch (error) {
      console.error("Lỗi khi xóa nhân viên:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa nhân viên. Vui lòng thử lại sau.",
      })
    }
  }

  const openEditDialog = (employee: Employee) => {
    setCurrentEmployee(employee)
    setFormData({
      username: employee.username,
      full_name: employee.full_name,
      role: employee.role,
      password: "",
      confirmPassword: "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (employee: Employee) => {
    setCurrentEmployee(employee)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý nhân viên</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm nhân viên
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm nhân viên mới</DialogTitle>
              <DialogDescription>Nhập thông tin của nhân viên mới.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="full_name">Họ và tên</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                    <SelectItem value="staff">Nhân viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Xác nhận mật khẩu"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddEmployee}>Thêm nhân viên</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm nhân viên..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Không tìm thấy nhân viên nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.username}</TableCell>
                        <TableCell>{employee.full_name}</TableCell>
                        <TableCell className="capitalize">
                          {employee.role === "admin" ? "Quản trị viên" : "Nhân viên"}
                        </TableCell>
                        <TableCell>
                          {new Date(employee.createdAt).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(employee)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Sửa</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(employee)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Xóa</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa thông tin nhân viên</DialogTitle>
            <DialogDescription>Cập nhật thông tin của nhân viên.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Tên đăng nhập</Label>
              <Input id="edit-username" name="username" value={formData.username} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-full_name">Họ và tên</Label>
              <Input id="edit-full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Vai trò</Label>
              <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="staff">Nhân viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">Mật khẩu mới (để trống nếu không muốn thay đổi)</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="edit-confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Xác nhận mật khẩu mới"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditEmployee}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa nhân viên</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
