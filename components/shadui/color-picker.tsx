import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadui/tabs';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/shadui/scroll-area';
import { ChromePicker } from 'react-color';
import { Input } from '@/components/shadui/input';
import './color-picker.css';

// 显式声明所有可能的颜色类名，这样 Tailwind 可以在构建时生成它们
const colorClasses = `
    bg-red-50 bg-red-100 bg-red-200 bg-red-300 bg-red-400 bg-red-500 bg-red-600 bg-red-700 bg-red-800 bg-red-900 bg-red-950
    bg-orange-50 bg-orange-100 bg-orange-200 bg-orange-300 bg-orange-400 bg-orange-500 bg-orange-600 bg-orange-700 bg-orange-800 bg-orange-900 bg-orange-950
    bg-amber-50 bg-amber-100 bg-amber-200 bg-amber-300 bg-amber-400 bg-amber-500 bg-amber-600 bg-amber-700 bg-amber-800 bg-amber-900 bg-amber-950
    bg-yellow-50 bg-yellow-100 bg-yellow-200 bg-yellow-300 bg-yellow-400 bg-yellow-500 bg-yellow-600 bg-yellow-700 bg-yellow-800 bg-yellow-900 bg-yellow-950
    bg-lime-50 bg-lime-100 bg-lime-200 bg-lime-300 bg-lime-400 bg-lime-500 bg-lime-600 bg-lime-700 bg-lime-800 bg-lime-900 bg-lime-950
    bg-green-50 bg-green-100 bg-green-200 bg-green-300 bg-green-400 bg-green-500 bg-green-600 bg-green-700 bg-green-800 bg-green-900 bg-green-950
    bg-emerald-50 bg-emerald-100 bg-emerald-200 bg-emerald-300 bg-emerald-400 bg-emerald-500 bg-emerald-600 bg-emerald-700 bg-emerald-800 bg-emerald-900 bg-emerald-950
    bg-teal-50 bg-teal-100 bg-teal-200 bg-teal-300 bg-teal-400 bg-teal-500 bg-teal-600 bg-teal-700 bg-teal-800 bg-teal-900 bg-teal-950
    bg-cyan-50 bg-cyan-100 bg-cyan-200 bg-cyan-300 bg-cyan-400 bg-cyan-500 bg-cyan-600 bg-cyan-700 bg-cyan-800 bg-cyan-900 bg-cyan-950
    bg-sky-50 bg-sky-100 bg-sky-200 bg-sky-300 bg-sky-400 bg-sky-500 bg-sky-600 bg-sky-700 bg-sky-800 bg-sky-900 bg-sky-950
    bg-blue-50 bg-blue-100 bg-blue-200 bg-blue-300 bg-blue-400 bg-blue-500 bg-blue-600 bg-blue-700 bg-blue-800 bg-blue-900 bg-blue-950
    bg-indigo-50 bg-indigo-100 bg-indigo-200 bg-indigo-300 bg-indigo-400 bg-indigo-500 bg-indigo-600 bg-indigo-700 bg-indigo-800 bg-indigo-900 bg-indigo-950
    bg-violet-50 bg-violet-100 bg-violet-200 bg-violet-300 bg-violet-400 bg-violet-500 bg-violet-600 bg-violet-700 bg-violet-800 bg-violet-900 bg-violet-950
    bg-purple-50 bg-purple-100 bg-purple-200 bg-purple-300 bg-purple-400 bg-purple-500 bg-purple-600 bg-purple-700 bg-purple-800 bg-purple-900 bg-purple-950
    bg-fuchsia-50 bg-fuchsia-100 bg-fuchsia-200 bg-fuchsia-300 bg-fuchsia-400 bg-fuchsia-500 bg-fuchsia-600 bg-fuchsia-700 bg-fuchsia-800 bg-fuchsia-900 bg-fuchsia-950
    bg-pink-50 bg-pink-100 bg-pink-200 bg-pink-300 bg-pink-400 bg-pink-500 bg-pink-600 bg-pink-700 bg-pink-800 bg-pink-900 bg-pink-950
    bg-rose-50 bg-rose-100 bg-rose-200 bg-rose-300 bg-rose-400 bg-rose-500 bg-rose-600 bg-rose-700 bg-rose-800 bg-rose-900 bg-rose-950
`;

const TAILWIND_COLORS = {
    red: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    orange: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    amber: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    yellow: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    lime: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    green: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    emerald: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    teal: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    cyan: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    sky: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    blue: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    indigo: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    violet: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    purple: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    fuchsia: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    pink: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    rose: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
};

interface ColorPickerProps {
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
}

export function ColorPicker({ value = '', onChange, disabled }: ColorPickerProps) {
    const [open, setOpen] = React.useState(false);
    const [customColor, setCustomColor] = React.useState(value.startsWith('#') ? value : '#000000');

    const handleTailwindColorSelect = (color: string, shade: string) => {
        onChange?.(`${color}-${shade}`);
        setOpen(false);
    };

    const handleCustomColorSelect = (color: any) => {
        setCustomColor(color.hex);
        onChange?.(color.hex);
    };

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        if (newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
            setCustomColor(newColor);
            onChange?.(newColor);
        }
    };

    // 这个空的 div 用于确保 Tailwind 在构建时生成所有颜色类
    const _unusedColorClasses = <div className={colorClasses} />;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                    <div
                        className={cn(
                            "w-10 h-10 border border-[#5A5A5A] rounded cursor-pointer",
                            { "opacity-50 cursor-not-allowed": disabled },
                            // 如果是 Tailwind 颜色，应用背景类；否则使用默认背景
                            value && !value.startsWith('#') ? `bg-${value}` : "bg-[#3A3A3A]"
                        )}
                        style={{ backgroundColor: value && value.startsWith('#') ? value : undefined }}
                    />
                    <div className="flex-1 bg-[#3A3A3A] border border-[#5A5A5A] rounded-md px-3 py-2">
                        <span className="text-sm text-[#E0E0E0]">
                            {value || 'Inherit'}
                        </span>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[320px] p-3 bg-[#2D2D2D] border-[#4A4A4A]"
                align="start"
                sideOffset={5}
            >
                <Tabs defaultValue="styles" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-[#3A3A3A] mb-3">
                        <TabsTrigger value="styles" className="text-[#E0E0E0]">Styles</TabsTrigger>
                        <TabsTrigger value="custom" className="text-[#E0E0E0]">Custom</TabsTrigger>
                    </TabsList>
                    <TabsContent value="styles" className="mt-0">
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-4">
                                {Object.entries(TAILWIND_COLORS).map(([color, shades]) => (
                                    <div key={color} className="space-y-1.5">
                                        <h4 className="text-xs font-medium text-[#E0E0E0] capitalize pl-1">{color}</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {shades.map((shade) => {
                                                const colorClass = `bg-${color}-${shade}`;
                                                return (
                                                    <button
                                                        key={shade}
                                                        className={cn(
                                                            "w-8 h-8 rounded-sm transition-all",
                                                            colorClass,
                                                            "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#4A4A4A]",
                                                            {
                                                                'ring-2 ring-white': value === `${color}-${shade}`
                                                            }
                                                        )}
                                                        onClick={() => handleTailwindColorSelect(color, shade)}
                                                        disabled={disabled}
                                                        title={`${color}-${shade}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="custom" className="mt-0">
                        <div className="space-y-3">
                            <ChromePicker
                                color={customColor}
                                onChange={handleCustomColorSelect}
                                disableAlpha={true}
                                className="custom-chrome-picker"
                                styles={{
                                    default: {
                                        picker: {
                                            background: '#2D2D2D',
                                            width: '100%',
                                            boxShadow: 'none',
                                            borderRadius: '0',
                                        },
                                        saturation: {
                                            borderRadius: '4px',
                                            marginBottom: '12px'
                                        },
                                        hue: {
                                            borderRadius: '4px',
                                            height: '12px',
                                            marginBottom: '10px'
                                        },
                                        body: {
                                            padding: '0',
                                        }
                                    }
                                }}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
} 