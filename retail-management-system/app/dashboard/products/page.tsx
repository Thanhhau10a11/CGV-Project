"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Download, Plus, Search, SlidersHorizontal } from "lucide-react"
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

// Sample product data
const products = [
  {
    id: 1,
    name: "Popcorn Large",
    code: "POP001",
    category: "Food",
    price: 5.99,
    stock: 150,
    status: "Active",
  },
  {
    id: 2,
    name: "Coca Cola 500ml",
    code: "BEV001",
    category: "Drinks",
    price: 2.49,
    stock: 200,
    status: "Active",
  },
  {
    id: 3,
    name: "Nachos with Cheese",
    code: "FOOD002",
    category: "Food",
    price: 4.99,
    stock: 80,
    status: "Active",
  },
  {
    id: 4,
    name: "Movie Souvenir Cup",
    code: "MERCH001",
    category: "Merchandise",
    price: 9.99,
    stock: 50,
    status: "Active",
  },
  {
    id: 5,
    name: "Caramel Popcorn",
    code: "POP002",
    category: "Food",
    price: 6.99,
    stock: 100,
    status: "Active",
  },
  {
    id: 6,
    name: "Bottled Water",
    code: "BEV002",
    category: "Drinks",
    price: 1.99,
    stock: 300,
    status: "Active",
  },
  {
    id: 7,
    name: "Movie Poster",
    code: "MERCH002",
    category: "Merchandise",
    price: 14.99,
    stock: 30,
    status: "Low Stock",
  },
  {
    id: 8,
    name: "Hot Dog",
    code: "FOOD003",
    category: "Food",
    price: 3.99,
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: 9,
    name: "Combo #1 (Popcorn + Drink)",
    code: "COMBO001",
    category: "Combo",
    price: 7.99,
    stock: 100,
    status: "Active",
  },
  {
    id: 10,
    name: "Collectible Figurine",
    code: "MERCH003",
    category: "Merchandise",
    price: 19.99,
    stock: 15,
    status: "Low Stock",
  },
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [user, setUser] = useState<{ role: string } | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  if (!isMounted) {
    return null
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus

    let matchesStock = true
    if (stockFilter === "low") {
      matchesStock = product.stock > 0 && product.stock <= 30
    } else if (stockFilter === "out") {
      matchesStock = product.stock === 0
    } else if (stockFilter === "in") {
      matchesStock = product.stock > 30
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesStock
  })

  const categories = ["Food", "Drinks", "Merchandise", "Combo"]
  const statuses = ["Active", "Low Stock", "Out of Stock", "Discontinued"]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        {user?.role === "admin" && (
          <Link href="/dashboard/products/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
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
                  placeholder="Search products by name or code..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Stock Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Levels</SelectItem>
                    <SelectItem value="in">In Stock</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="sr-only">More filters</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filters</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>Show discontinued</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked>Show price</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked>Show stock level</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download product list</span>
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.code}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{product.stock}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.status === "Active"
                                ? "default"
                                : product.status === "Low Stock"
                                  ? "warning"
                                  : "destructive"
                            }
                          >
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/products/${product.id}`}>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                            {user?.role === "admin" && (
                              <Link href={`/dashboard/products/${product.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                              </Link>
                            )}
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
    </div>
  )
}
