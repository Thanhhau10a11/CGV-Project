"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample order data
const orders = [
  {
    id: 1001,
    date: "2023-04-28T14:30:00",
    customer: "Walk-in Customer",
    total: 18.97,
    items: 3,
    status: "Completed",
  },
  {
    id: 1002,
    date: "2023-04-28T15:45:00",
    customer: "Walk-in Customer",
    total: 24.99,
    items: 4,
    status: "Completed",
  },
  {
    id: 1003,
    date: "2023-04-28T16:20:00",
    customer: "Walk-in Customer",
    total: 12.48,
    items: 2,
    status: "Completed",
  },
  {
    id: 1004,
    date: "2023-04-28T17:10:00",
    customer: "Walk-in Customer",
    total: 32.97,
    items: 5,
    status: "Completed",
  },
  {
    id: 1005,
    date: "2023-04-28T18:05:00",
    customer: "Walk-in Customer",
    total: 9.99,
    items: 1,
    status: "Completed",
  },
  {
    id: 1006,
    date: "2023-04-29T10:15:00",
    customer: "Walk-in Customer",
    total: 27.96,
    items: 3,
    status: "Completed",
  },
  {
    id: 1007,
    date: "2023-04-29T11:30:00",
    customer: "Walk-in Customer",
    total: 15.98,
    items: 2,
    status: "Completed",
  },
  {
    id: 1008,
    date: "2023-04-29T12:45:00",
    customer: "Walk-in Customer",
    total: 42.95,
    items: 6,
    status: "Completed",
  },
  {
    id: 1009,
    date: "2023-04-29T13:20:00",
    customer: "Walk-in Customer",
    total: 8.99,
    items: 1,
    status: "Completed",
  },
  {
    id: 1010,
    date: "2023-04-29T14:10:00",
    customer: "Walk-in Customer",
    total: 21.97,
    items: 3,
    status: "Completed",
  },
]

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toString().includes(searchTerm)
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus

    let matchesDate = true
    const orderDate = new Date(order.date)
    const today = new Date()

    if (dateFilter === "today") {
      matchesDate =
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
    } else if (dateFilter === "yesterday") {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      matchesDate =
        orderDate.getDate() === yesterday.getDate() &&
        orderDate.getMonth() === yesterday.getMonth() &&
        orderDate.getFullYear() === yesterday.getFullYear()
    } else if (dateFilter === "week") {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      matchesDate = orderDate >= weekAgo
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const statuses = ["Completed", "Processing", "Cancelled"]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search order by ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
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

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download order list</span>
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell className="text-right">{order.items}</TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "Completed"
                                ? "default"
                                : order.status === "Processing"
                                  ? "outline"
                                  : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
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
