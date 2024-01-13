export const APPLE_MOCK_CODE = `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Showcase</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto', sans-serif;
        }
    </style>
</head>
<body class="bg-black text-white">
    <nav class="py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div class="flex items-center">
                <img src="https://placehold.co/24x24" alt="Company Logo" class="mr-8">
                <a href="#" class="text-white text-sm font-medium mr-4">Store</a>
                <a href="#" class="text-white text-sm font-medium mr-4">Mac</a>
                <a href="#" class="text-white text-sm font-medium mr-4">iPad</a>
                <a href="#" class="text-white text-sm font-medium mr-4">iPhone</a>
                <a href="#" class="text-white text-sm font-medium mr-4">Watch</a>
                <a href="#" class="text-white text-sm font-medium mr-4">Vision</a>
                <a href="#" class="text-white text-sm font-medium mr-4">AirPods</a>
                <a href="#" class="text-white text-sm font-medium mr-4">TV & Home</a>
                <a href="#" class="text-white text-sm font-medium mr-4">Entertainment</a>
                <a href="#" class="text-white text-sm font-medium mr-4">Accessories</a>
                <a href="#" class="text-white text-sm font-medium">Support</a>
            </div>
            <div class="flex items-center">
                <a href="#" class="text-white text-sm font-medium mr-4"><i class="fas fa-search"></i></a>
                <a href="#" class="text-white text-sm font-medium"><i class="fas fa-shopping-bag"></i></a>
            </div>
        </div>
    </nav>

    <main class="mt-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <img src="https://placehold.co/100x100" alt="Brand Logo" class="mx-auto mb-4">
                <h1 class="text-5xl font-bold mb-4">WATCH SERIES 9</h1>
                <p class="text-2xl font-medium mb-8">Smarter. Brighter. Mightier.</p>
                <div class="flex justify-center space-x-4">
                    <a href="#" class="text-blue-600 text-sm font-medium">Learn more ></a>
                    <a href="#" class="text-blue-600 text-sm font-medium">Buy ></a>
                </div>
            </div>
            <div class="flex justify-center mt-12">
                <img src="https://placehold.co/500x300" alt="Product image of a smartwatch with a pink band and a circular interface displaying various health metrics." class="mr-8">
                <img src="https://placehold.co/500x300" alt="Product image of a smartwatch with a blue band and a square interface showing a classic analog clock face." class="ml-8">
            </div>
        </div>
    </main>
</body>
</html>
`;

export const NYTIMES_MOCK_CODE = `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The New York Times - News</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <style>
        body {
            font-family: 'Libre Franklin', sans-serif;
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4">
        <header class="border-b border-gray-300 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <button class="text-gray-700"><i class="fas fa-bars"></i></button>
                    <button class="text-gray-700"><i class="fas fa-search"></i></button>
                    <div class="text-xs uppercase tracking-widest">Tuesday, November 14, 2023<br>Today's Paper</div>
                </div>
                <div>
                    <img src="https://placehold.co/200x50?text=The+New+York+Times+Logo" alt="The New York Times Logo" class="h-8">
                </div>
                <div class="flex items-center space-x-4">
                    <button class="bg-black text-white px-4 py-1 text-xs uppercase tracking-widest">Give the times</button>
                    <div class="text-xs">Account</div>
                </div>
            </div>
            <nav class="flex justify-between items-center py-4">
                <div class="flex space-x-4">
                    <a href="#" class="text-xs uppercase tracking-widest text-gray-700">U.S.</a>
                    <!-- Add other navigation links as needed -->
                </div>
                <div class="flex space-x-4">
                    <a href="#" class="text-xs uppercase tracking-widest text-gray-700">Cooking</a>
                    <!-- Add other navigation links as needed -->
                </div>
            </nav>
        </header>
        <main>
            <section class="py-6">
                <div class="grid grid-cols-3 gap-4">
                    <div class="col-span-2">
                        <article class="mb-4">
                            <h2 class="text-xl font-bold mb-2">Israeli Military Raids Gaza’s Largest Hospital</h2>
                            <p class="text-gray-700 mb-2">Israeli troops have entered the Al-Shifa Hospital complex, where conditions have grown dire and Israel says Hamas fighters are embedded.</p>
                            <a href="#" class="text-blue-600 text-sm">See more updates <i class="fas fa-external-link-alt"></i></a>
                        </article>
                        <!-- Repeat for each news item -->
                    </div>
                    <div class="col-span-1">
                        <article class="mb-4">
                            <img src="https://placehold.co/300x200?text=News+Image" alt="Flares and plumes of smoke over the northern Gaza skyline on Tuesday." class="mb-2">
                            <h2 class="text-xl font-bold mb-2">From Elvis to Elopements, the Evolution of the Las Vegas Wedding</h2>
                            <p class="text-gray-700 mb-2">The glittering city that attracts thousands of couples seeking unconventional nuptials has grown beyond the drive-through wedding.</p>
                            <a href="#" class="text-blue-600 text-sm">8 MIN READ</a>
                        </article>
                        <!-- Repeat for each news item -->
                    </div>
                </div>
            </section>
        </main>
    </div>
</body>
</html>
`;

export const NO_IMAGES_NYTIMES_MOCK_CODE = `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The New York Times - News</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <style>
        body {
            font-family: 'Libre Franklin', sans-serif;
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4">
        <header class="border-b border-gray-300 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <button class="text-gray-700"><i class="fas fa-bars"></i></button>
                    <button class="text-gray-700"><i class="fas fa-search"></i></button>
                    <div class="text-xs uppercase tracking-widest">Tuesday, November 14, 2023<br>Today's Paper</div>
                </div>
                <div class="flex items-center space-x-4">
                    <button class="bg-black text-white px-4 py-1 text-xs uppercase tracking-widest">Give the times</button>
                    <div class="text-xs">Account</div>
                </div>
            </div>
            <nav class="flex justify-between items-center py-4">
                <div class="flex space-x-4">
                    <a href="#" class="text-xs uppercase tracking-widest text-gray-700">U.S.</a>
                    <!-- Add other navigation links as needed -->
                </div>
                <div class="flex space-x-4">
                    <a href="#" class="text-xs uppercase tracking-widest text-gray-700">Cooking</a>
                    <!-- Add other navigation links as needed -->
                </div>
            </nav>
        </header>
        <main>
            <section class="py-6">
                <div class="grid grid-cols-3 gap-4">
                    <div class="col-span-2">
                        <article class="mb-4">
                            <h2 class="text-xl font-bold mb-2">Israeli Military Raids Gaza’s Largest Hospital</h2>
                            <p class="text-gray-700 mb-2">Israeli troops have entered the Al-Shifa Hospital complex, where conditions have grown dire and Israel says Hamas fighters are embedded.</p>
                            <a href="#" class="text-blue-600 text-sm">See more updates <i class="fas fa-external-link-alt"></i></a>
                        </article>
                        <!-- Repeat for each news item -->
                    </div>
                    <div class="col-span-1">
                        <article class="mb-4">
                            <h2 class="text-xl font-bold mb-2">From Elvis to Elopements, the Evolution of the Las Vegas Wedding</h2>
                            <p class="text-gray-700 mb-2">The glittering city that attracts thousands of couples seeking unconventional nuptials has grown beyond the drive-through wedding.</p>
                            <a href="#" class="text-blue-600 text-sm">8 MIN READ</a>
                        </article>
                        <!-- Repeat for each news item -->
                    </div>
                </div>
            </section>
        </main>
    </div>
</body>
</html>
`;

const REACT_ANTD_MOCK_CODE = `
import { Search } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from 'components/ui/card';

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
        <Card data-uid="1111">
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
`;

export async function mockComletion(process_chunk) {
  const code_to_return = REACT_ANTD_MOCK_CODE;
  const codeArr = [];
  const len = code_to_return.length;
  for (let i = 0; i < len; i += 10) {
    codeArr.push(code_to_return.slice(i, i + 10));
  }

  code_to_return.split;
  for (const value of codeArr) {
    await process_chunk(value);
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 50);
    });
  }
  return code_to_return;
}
