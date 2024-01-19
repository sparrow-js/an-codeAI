
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
  Card,
  CardContent,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui";

export default function EcommerceDashboard() {
  const [selectedMenu, setSelectedMenu] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="bg-white w-64 p-6 hidden sm:block">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={selectedMenu === 'dashboard' ? 'text-blue-500' : ''}
                onClick={() => setSelectedMenu('dashboard')}
              >
                Dashboard
              </NavigationMenuTrigger>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={selectedMenu === 'orders' ? 'text-blue-500' : ''}
                onClick={() => setSelectedMenu('orders')}
              >
                Orders
              </NavigationMenuTrigger>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={selectedMenu === 'products' ? 'text-blue-500' : ''}
                onClick={() => setSelectedMenu('products')}
              >
                Products
              </NavigationMenuTrigger>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={selectedMenu === 'customers' ? 'text-blue-500' : ''}
                onClick={() => setSelectedMenu('customers')}
              >
                Customers
              </NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </aside>
      <main className="flex-1 p-6">
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>#001</TableCell>
                  <TableCell>Aug 20, 2021</TableCell>
                  <TableCell>Shipped</TableCell>
                  <TableCell>$150.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>#002</TableCell>
                  <TableCell>Aug 21, 2021</TableCell>
                  <TableCell>Processing</TableCell>
                  <TableCell>$200.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>#003</TableCell>
                  <TableCell>Aug 22, 2021</TableCell>
                  <TableCell>Delivered</TableCell>
                  <TableCell>$250.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
