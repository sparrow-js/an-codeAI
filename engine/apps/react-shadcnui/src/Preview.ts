export default {
    '/src/Preview.jsx': `
import { Search } from 'lucide-react';
import { Button } from 'components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from 'components/card';

export default function VxDev() {
    return (
    <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center space-x-2 mb-8">
        <div className="flex items-center bg-white shadow rounded overflow-hidden w-full">
            <span className="p-4">
            <Search className="w-5 h-5 text-gray-500" />
            </span>
            <input
            type="text"
            placeholder="Search for villas"
            className="p-4 w-full"
            defaultValue="Villa"
            />
        </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Villa 1 */}
        <Card>
            <img
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&dpr=2&q=80"
            alt="The Royal Bali Villas"
            className="w-full h-64 object-cover"
            />
            <CardHeader>
            <CardTitle>The Royal Bali Villas</CardTitle>
            <CardDescription>Canggu</CardDescription>
            </CardHeader>
            <CardContent>
            <p className="text-lg font-semibold">$300 / night</p>
            <p className="text-sm text-gray-600">Canggu</p>
            <p className="text-sm">Rating: <span className="text-yellow-400">★★★★★</span></p>
            </CardContent>
            <CardFooter>
            <Button variant="solid" className="w-full bg-blue-500 hover:bg-blue-600 text-white">Learn More</Button>
            </CardFooter>
        </Card>
        {/* Villa 2 */}
        <Card>
            <img
            src="https://images.unsplash.com/photo-1590486803837-92e1a4e481aa?w=800&dpr=2&q=80"
            alt="Villa Maxceo"
            className="w-full h-64 object-cover"
            />
            <CardHeader>
            <CardTitle>Villa Maxceo</CardTitle>
            <CardDescription>Canggu</CardDescription>
            </CardHeader>
            <CardContent>
            <p className="text-lg font-semibold">$290 / night</p>
            <p className="text-sm text-gray-600">Canggu</p>
            <p className="text-sm">Rating: <span className="text-yellow-400">★★★★☆</span></p>
            </CardContent>
            <CardFooter>
            <Button variant="solid" className="w-full bg-blue-500 hover:bg-blue-600 text-white">Learn More</Button>
            </CardFooter>
        </Card>
        {/* Villa 3 */}
        <Card>
            <img
            src="https://images.unsplash.com/photo-1570213489059-0aac6626cade?w=800&dpr=2&q=80"
            alt="Fella Villa"
            className="w-full h-64 object-cover"
            />
            <CardHeader>
            <CardTitle>Fella Villa</CardTitle>
            <CardDescription>Canggu</CardDescription>
            </CardHeader>
            <CardContent>
            <p className="text-lg font-semibold">$290 / night</p>
            <p className="text-sm text-gray-600">Canggu</p>
            <p className="text-sm">Rating: <span className="text-yellow-400">★★★★★</span></p>
            </CardContent>
            <CardFooter>
            <Button variant="solid" className="w-full bg-blue-500 hover:bg-blue-600 text-white">Learn More</Button>
            </CardFooter>
        </Card>
        </div>
    </div>
    );
}
    `
}