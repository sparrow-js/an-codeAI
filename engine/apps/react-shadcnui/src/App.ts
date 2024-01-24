export default {
    '/src/App.jsx': `
import ErrorBoundary from "./ErrorBoundary.jsx";
import Preview from "./Preview.jsx";
import { TooltipProvider } from "components/ui/tooltip";

export default function Home() {
    return (
        <TooltipProvider>
            <main className="vx-dev-wrapper relative">
                <ErrorBoundary>
                <Preview />
                </ErrorBoundary>
            </main>
        </TooltipProvider>
    );
}                
    `,
};