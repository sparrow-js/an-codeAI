const HtmlMock = `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Projects</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body class="bg-white text-gray-900">
    <div class="container mx-auto px-4 py-12">
        <h1 class="text-5xl font-bold mb-4">Things I've made trying to put my dent in the universe.</h1>
        <p class="text-lg mb-12">I've worked on tons of little projects over the years but these are the ones that I'm most proud of. Many of them are open-source, so if you see something that piques your interest, check out the code and contribute if you have ideas for how it can be improved.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="flex flex-col items-center">
                <img src="https://placehold.co/96x96" alt="Placeholder image for Planetaria project logo" class="mb-4">
                <h2 class="text-xl font-semibold mb-2">Planetaria</h2>
                <p class="text-center mb-4">Creating technology to empower civilians to explore space on their own terms.</p>
                <a href="#" class="text-indigo-600 hover:text-indigo-800 transition-colors">planetaria.tech</a>
            </div>
            
            <div class="flex flex-col items-center">
                <img src="https://placehold.co/96x96" alt="Placeholder image for Animaginary project logo" class="mb-4">
                <h2 class="text-xl font-semibold mb-2">Animaginary</h2>
                <p class="text-center mb-4">High performance web animation library, hand-written in optimized WASM.</p>
                <a href="#" class="text-indigo-600 hover:text-indigo-800 transition-colors">github.com</a>
            </div>
            
            <div class="flex flex-col items-center">
                <img src="https://placehold.co/96x96" alt="Placeholder image for HelioStream project logo" class="mb-4">
                <h2 class="text-xl font-semibold mb-2">HelioStream</h2>
                <p class="text-center mb-4">Real-time video streaming library, optimized for interstellar transmission.</p>
                <a href="#" class="text-indigo-600 hover:text-indigo-800 transition-colors">github.com</a>
            </div>
        </div>
    </div>
</body>
</html>
`;
export default HtmlMock;