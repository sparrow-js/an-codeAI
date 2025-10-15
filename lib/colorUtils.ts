/**
 * 颜色处理工具函数
 */

/**
 * 将十六进制颜色转换为RGBA对象
 * @param {string} hex - 十六进制颜色值
 * @returns {Object|null} RGBA对象或null
 */
export function hexToRgba(hex: string) {
    if (!hex) return null;
    
    try {
        // 移除#符号
        hex = hex.replace('#', '');
        
        // 处理3位和4位缩写格式
        if (hex.length === 3 || hex.length === 4) {
            hex = hex.split('').map((char: string) => char + char).join('');
        }
        
        const hasAlpha = hex.length === 8;
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const a = hasAlpha ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
        
        return {
            r: isNaN(r) ? 0 : r,
            g: isNaN(g) ? 0 : g,
            b: isNaN(b) ? 0 : b,
            a: isNaN(a) ? 1 : a
        };
    } catch (error) {
        return null;
    }
}

/**
 * 将RGBA值转换为十六进制字符串
 * @param {number} r - 红色值 (0-255)
 * @param {number} g - 绿色值 (0-255)
 * @param {number} b - 蓝色值 (0-255)
 * @param {number} a - 透明度值 (0-1)
 * @returns {string} 十六进制颜色字符串
 */
export function rgbaToHex(r: number, g: number, b: number, a: number) {
    const toHex = (value: number) => Math.round(value).toString(16).padStart(2, '0');
    const alpha = Math.round(255 * a);
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha < 255 ? toHex(alpha) : ''}`;
}

/**
 * 将RGB转换为HSV
 * @param {number} r - 红色值 (0-255)
 * @param {number} g - 绿色值 (0-255)  
 * @param {number} b - 蓝色值 (0-255)
 * @param {number} a - 透明度值 (0-1)
 * @param {number} [hue=0] - 当前色相值，用于保持色相稳定
 * @returns {Object} HSV对象
 */
export function rgbToHsv(r: number, g: number, b: number, a: number, hue = 0) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    if (max === min) {
        // 灰色，保持当前色相
        return {
            h: hue,
            s: s * 100,
            v: v * 100,
            a: a
        };
    }
    
    // 计算色相
    switch (max) {
        case r:
            h = (g - b) / diff + (g < b ? 6 : 0);
            break;
        case g:
            h = (b - r) / diff + 2;
            break;
        case b:
            h = (r - g) / diff + 4;
            break;
    }
    
    h /= 6;
    
    return {
        h: h * 360,
        s: s * 100,
        v: v * 100,
        a: a
    };
}

/**
 * 将HSV转换为RGB
 * @param {number} h - 色相值 (0-360)
 * @param {number} s - 饱和度 (0-100)
 * @param {number} v - 明度 (0-100)
 * @param {number} a - 透明度 (0-1)
 * @returns {Object} RGB对象
 */
export function hsvToRgb(h: number, s: number, v: number, a: number) {
    h /= 360;
    s /= 100;
    v /= 100;
    
    let r = 0, g = 0, b = 0;
    
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
        a: a
    };
}

/**
 * 组织颜色预设为分组格式
 * @param {Object} colors - 颜色配置对象
 * @returns {Object} 包含singles和groups的对象
 */
export function organizeColorPresets(colors: any) {
    if (!colors) {
        return {
            singles: [],
            groups: []
        };
    }
    
    const singles = [];
    const groups = [];
    
    for (const [colorName, colorValue] of Object.entries(colors)) {
        if (typeof colorValue !== 'string') {
            // 这是一个颜色组（如红色的不同深浅）
            const colorGroup = [];
            
            for (const [shade, shadeValue] of Object.entries(colorValue as any)) {
                if (typeof shadeValue === 'string' && !shadeValue.includes('--')) {
                    colorGroup.push([`${colorName}-${shade}`, shadeValue]);
                }
            }
            
            if (colorGroup.length > 0) {
                groups.push([colorName, colorGroup]);
            }
        } else {
            // 这是单个颜色
            if (!colorValue.includes('--')) {
                singles.push([colorName, colorValue]);
            }
        }
    }
    
    // 过滤出基础颜色（黑白）
    const basicColors = singles.filter(([name]) => 
        ['black', 'white'].includes(name)
    );
    
    return {
        singles: basicColors,
        groups: groups
    };
}

/**
 * 解析颜色值（支持多种格式）
 * @param {string} colorString - 颜色字符串
 * @returns {Object|null} RGBA对象或null
 */
export function parseColor(colorString: string) {
    if (!colorString) return null;
    
    // 处理十六进制颜色
    if (colorString.startsWith('#')) {
        return hexToRgba(colorString);
    }
    
    // 处理RGB/RGBA颜色
    const rgbMatch = colorString.match(/rgba?\(([^)]+)\)/);
    if (rgbMatch) {
        const values = rgbMatch[1].split(',').map(v => parseFloat(v.trim()));
        return {
            r: values[0] || 0,
            g: values[1] || 0,
            b: values[2] || 0,
            a: values[3] !== undefined ? values[3] : 1
        };
    }
    
    // 处理HSL颜色
    const hslMatch = colorString.match(/hsla?\(([^)]+)\)/);
    if (hslMatch) {
        const values = hslMatch[1].split(',').map(v => parseFloat(v.trim()));
        const h = values[0] || 0;
        const s = (values[1] || 0) / 100;
        const l = (values[2] || 0) / 100;
        const a = values[3] !== undefined ? values[3] : 1;
        
        // 简化的HSL到RGB转换
        const rgb = hslToRgb(h, s, l);
        return { ...rgb, a };
    }
    
    // 处理命名颜色
    const namedColors = {
        'transparent': { r: 0, g: 0, b: 0, a: 0 },
        'black': { r: 0, g: 0, b: 0, a: 1 },
        'white': { r: 255, g: 255, b: 255, a: 1 },
        'red': { r: 255, g: 0, b: 0, a: 1 },
        'green': { r: 0, g: 255, b: 0, a: 1 },
        'blue': { r: 0, g: 0, b: 255, a: 1 }
    };
    
    return namedColors[colorString.toLowerCase() as keyof typeof namedColors] || null;
}

/**
 * 简化的HSL到RGB转换
 */
function hslToRgb(h: number, s: number, l: number) {
    h /= 360;
    
    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };
    
    if (s === 0) {
        // 灰色
        const gray = Math.round(l * 255);
        return { r: gray, g: gray, b: gray };
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    return {
        r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
    };
} 