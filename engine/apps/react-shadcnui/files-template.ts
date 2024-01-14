import PublicIndex from './public';
import jsconfig from './jsconfig';
import packageJson from './package';
import srcIndex from './src';
import scrPreview from './src/Preview';
import tailwindConfig from './tailwind.config';
import indexCss from './src/index.css';
import srcLibUtils from './src/lib/utils';
import componentsButton from './src/components/button';
import srcErrorBoundary from './src/ErrorBoundary';
import srcApp from './src/App';

// components
import accordion from './src/components/accordion';
import alertDialog from './src/components/alert-dialog';
import alert from './src/components/alert';
import aspectRatio from './src/components/aspect-ratio';
import avatar from './src/components/avatar';
import badge from './src/components/badge';
import button from './src/components/button';
import calendar from './src/components/calendar';
import card from './src/components/card';
import carousel from './src/components/carousel';
import checkbox from './src/components/checkbox';
import collapsible from './src/components/collapsible';
import command from './src/components/command';
import contextMenu from './src/components/context-menu';
import dialog from './src/components/dialog';
import drawer from './src/components/drawer';
import dropdownMenu from './src/components/dropdown-menu';
import hoverCard from './src/components/hover-card';
import input from './src/components/input';
import label from './src/components/label';
import menubar from './src/components/menubar';
import navigationMenu from './src/components/navigation-menu';
import pagination from './src/components/pagination';
import popover from './src/components/popover';
import progress from './src/components/progress';
import radioGroup from './src/components/radio-group';
import resizable from './src/components/resizable';
import scrollArea from './src/components/scroll-area';
import select from './src/components/select';
import separator from './src/components/separator';
import sheet from './src/components/sheet';
import skeleton from './src/components/skeleton';
import slider from './src/components/slider';
import table from './src/components/table';
import tabs from './src/components/tabs';
import textarea from './src/components/textarea';
import toast from './src/components/toast';
import toaster from './src/components/toaster';
import toggleGroup from './src/components/toggle-group';
import toggle from './src/components/toggle';
import tooltip from './src/components/tooltip';
import switchC from './src/components/switch';
import useToast from './src/components/use-toast';




export default {
    ...srcApp,
    ...srcErrorBoundary,                
    ...componentsButton,         
    ...srcLibUtils,                        
    ...indexCss,                    
    ...tailwindConfig,                   
    ...scrPreview,                   
    ...srcIndex,               
    ...PublicIndex,
    ...jsconfig,
    ...packageJson,

    // components
    ...accordion,
    ...alertDialog,
    ...alert,
    ...aspectRatio,
    ...avatar,
    ...badge,
    ...button,
    ...calendar,
    ...card,
    ...carousel,
    ...checkbox,
    ...collapsible,
    ...command,
    ...contextMenu,
    ...dialog,
    ...drawer,
    ...dropdownMenu,
    ...hoverCard,
    ...input,
    ...label,
    ...menubar,
    ...navigationMenu,
    ...pagination,
    ...popover,
    ...progress,
    ...radioGroup,
    ...resizable,
    ...scrollArea,
    ...select,
    ...separator,
    ...sheet,
    ...skeleton,
    ...slider,
    ...switchC,
    ...table,
    ...tabs,
    ...textarea,
    ...toast,
    ...toaster,
    ...toggleGroup,
    ...toggle,
    ...tooltip,
    ...useToast,
};



