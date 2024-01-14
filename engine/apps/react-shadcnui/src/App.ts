export default {
    '/src/App.jsx': `
import ErrorBoundary from "./ErrorBoundary.jsx";
import Preview from "./Preview.jsx";

export default function Home() {
    return (
    <main className="vx-dev-wrapper relative">
        <ErrorBoundary>
        <Preview />
        </ErrorBoundary>
    </main>
    );
}                
    `,
};