export type FrameColorId =
    | 'original'
    | 'pastelPink' | 'pastelBlue' | 'pastelYellow' | 'pastelGreen' | 'pastelLavender' | 'pastelTan'
    | 'maroon' | 'white' | 'black'
    | 'glitterPink' | 'plaidPink' | 'gridBlue' | 'chainBlack' | 'quiltedWhite' | 'quiltedPink'
    | 'checkerBW' | 'checkerPink' | 'ginghamRed' | 'ginghamPink' | 'checkerRed' | 'ginghamGreen'
    | 'ginghamBlue' | 'stripesPink' | 'creamSolid' | 'checkerYellowBlue' | 'checkerNavy'
    | 'leopard' | 'cowPrint' | 'crocMaroon'
    | 'floralMagenta' | 'floralWhite' | 'textureLinen' | 'textureCrinkle' | 'textureCream'
    | 'marbleBlue' | 'landscapeGreen' | 'waterBlue' | 'forestNight' | 'oceanTeal'
    | 'floralPinkField' | 'damaskGold' | 'creamDot'
    | 'floralRoseWhite' | 'foilSilver' | 'scribbleBlack' | 'sparkleWhite' | 'lineSilver'
    | 'quiltGray'
    | 'denimBlue' | 'sunsetBeach' | 'blissSky' | 'starsPattern' | 'mosaicGold' | 'snakeSkin'
    | 'crumpledVinyl' | 'crumpledFoil' | 'steelSheet' | 'rosePattern'
    | 'floralSakura' | 'floralDaisy' | 'floralLily' | 'floralHibiscus' | 'floralSunflower' | 'floralTulip';

export interface FrameColorOption {
    id: FrameColorId;
    name: string;
    /** CSS value untuk swatch bulat di panel UI (boleh gradient/pattern CSS) */
    previewCss: string;
    /** Menghasilkan fillStyle asli untuk Canvas 2D (dipakai di PhotoCanvas.tsx) */
    getFill: (ctx: CanvasRenderingContext2D, width: number, height: number) => string | CanvasGradient | CanvasPattern;
}

const solid = (hex: string) => () => hex;

function tileFill(draw: (tctx: CanvasRenderingContext2D, size: number) => void, size = 24) {
    return (ctx: CanvasRenderingContext2D) => {
        const tile = document.createElement('canvas');
        tile.width = size;
        tile.height = size;
        const tctx = tile.getContext('2d');
        if (!tctx) return '#ffffff';
        draw(tctx, size);
        return ctx.createPattern(tile, 'repeat') || '#ffffff';
    };
}

// ---- reusable pattern builders ----

function ginghamDraw(color: string) {
    return (tctx: CanvasRenderingContext2D, size: number) => {
        tctx.fillStyle = '#ffffff';
        tctx.fillRect(0, 0, size, size);
        tctx.globalAlpha = 0.55;
        tctx.fillStyle = color;
        tctx.fillRect(0, 0, size, size / 2);
        tctx.fillRect(0, 0, size / 2, size);
        tctx.globalAlpha = 1;
        tctx.fillStyle = color;
        tctx.fillRect(0, 0, size / 2, size / 2);
    };
}

function checkerDraw(colorA: string, colorB: string) {
    return (tctx: CanvasRenderingContext2D, size: number) => {
        tctx.fillStyle = colorB;
        tctx.fillRect(0, 0, size, size);
        tctx.fillStyle = colorA;
        tctx.fillRect(0, 0, size / 2, size / 2);
        tctx.fillRect(size / 2, size / 2, size / 2, size / 2);
    };
}

function ginghamPreview(color: string) {
    return `repeating-linear-gradient(0deg, ${color}88 0, ${color}88 6px, #fff 6px, #fff 12px), repeating-linear-gradient(90deg, ${color}88 0, ${color}88 6px, transparent 6px, transparent 12px)`;
}

function checkerPreview(colorA: string, colorB: string) {
    return `conic-gradient(${colorA} 0% 25%, ${colorB} 0% 50%, ${colorA} 0% 75%, ${colorB} 0% 100%) 0 0/16px 16px`;
}

export const frameColors: FrameColorOption[] = [
    {
        id: 'original',
        name: 'Original',
        previewCss: 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 0 0/10px 10px',
        getFill: () => 'transparent',
    },

    // ---- Pastel solids ----
    { id: 'pastelPink', name: 'Pastel Pink', previewCss: '#f7c9dd', getFill: solid('#f7c9dd') },
    { id: 'pastelBlue', name: 'Pastel Blue', previewCss: '#c2e4f2', getFill: solid('#c2e4f2') },
    { id: 'pastelYellow', name: 'Pastel Yellow', previewCss: '#f6efb0', getFill: solid('#f6efb0') },
    { id: 'pastelGreen', name: 'Pastel Green', previewCss: '#a9c98f', getFill: solid('#a9c98f') },
    { id: 'pastelLavender', name: 'Pastel Lavender', previewCss: '#cbb6e8', getFill: solid('#cbb6e8') },
    { id: 'pastelTan', name: 'Pastel Tan', previewCss: '#dcbe9c', getFill: solid('#dcbe9c') },
    { id: 'maroon', name: 'Maroon', previewCss: '#5c1414', getFill: solid('#5c1414') },
    { id: 'white', name: 'Pure White', previewCss: '#ffffff', getFill: solid('#ffffff') },
    { id: 'black', name: 'Classic Black', previewCss: '#161616', getFill: solid('#161616') },

    // ---- Glitter / plaid / grid / quilted ----
    {
        id: 'glitterPink',
        name: 'Glitter Pink',
        previewCss: 'radial-gradient(circle at 30% 30%, #ffe1ef 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, #ffe1ef 0 1.5px, transparent 2.5px), radial-gradient(circle at 50% 80%, #ffe1ef 0 2px, transparent 3px), #d6236f',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#d6236f';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = 'rgba(255,255,255,0.85)';
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const r = 0.6 + Math.random() * 1.1;
                tctx.beginPath();
                tctx.arc(x, y, r, 0, Math.PI * 2);
                tctx.fill();
            }
        }, 20),
    },
    {
        id: 'plaidPink',
        name: 'Plaid Pink',
        previewCss: 'repeating-linear-gradient(45deg,#f6d3e6 0,#f6d3e6 4px,#fff 4px,#fff 10px),repeating-linear-gradient(-45deg,#f0a8cf55 0,#f0a8cf55 4px,transparent 4px,transparent 10px)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#fbe4f0';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#e79cc4';
            tctx.lineWidth = 2;
            tctx.beginPath(); tctx.moveTo(0, size * 0.3); tctx.lineTo(size, size * 0.3); tctx.stroke();
            tctx.beginPath(); tctx.moveTo(0, size * 0.7); tctx.lineTo(size, size * 0.7); tctx.stroke();
            tctx.beginPath(); tctx.moveTo(size * 0.3, 0); tctx.lineTo(size * 0.3, size); tctx.stroke();
            tctx.beginPath(); tctx.moveTo(size * 0.7, 0); tctx.lineTo(size * 0.7, size); tctx.stroke();
        }, 20),
    },
    {
        id: 'gridBlue',
        name: 'Baby Blue Grid',
        previewCss: 'repeating-linear-gradient(0deg,#bfe0f5 0,#bfe0f5 1px,transparent 1px,transparent 10px),repeating-linear-gradient(90deg,#bfe0f5 0,#bfe0f5 1px,transparent 1px,transparent 10px),#eaf6fd',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#eaf6fd';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#bfe0f5';
            tctx.lineWidth = 1;
            tctx.strokeRect(0, 0, size, size);
        }, 12),
    },
    {
        id: 'chainBlack',
        name: 'Chain Link',
        previewCss: 'radial-gradient(circle at 25% 25%, transparent 6px, #111 7px, #111 8px, transparent 9px), #f4f4f4',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#f4f4f4';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#1a1a1a';
            tctx.lineWidth = 1.4;
            tctx.beginPath(); tctx.arc(size * 0.25, size * 0.25, size * 0.22, 0, Math.PI * 2); tctx.stroke();
            tctx.beginPath(); tctx.arc(size * 0.75, size * 0.75, size * 0.22, 0, Math.PI * 2); tctx.stroke();
        }, 18),
    },
    {
        id: 'quiltedWhite',
        name: 'Quilted White',
        previewCss: 'linear-gradient(135deg, #fff 25%, #f1ecec 25%, #f1ecec 50%, #fff 50%, #fff 75%, #f1ecec 75%)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#ffffff';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#e7dede';
            tctx.lineWidth = 1;
            tctx.beginPath(); tctx.moveTo(0, 0); tctx.lineTo(size, size); tctx.stroke();
            tctx.beginPath(); tctx.moveTo(size, 0); tctx.lineTo(0, size); tctx.stroke();
        }, 18),
    },
    {
        id: 'quiltedPink',
        name: 'Quilted Blush',
        previewCss: 'linear-gradient(135deg, #f9d7e4 25%, #f3c1d6 25%, #f3c1d6 50%, #f9d7e4 50%, #f9d7e4 75%, #f3c1d6 75%)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#f9d7e4';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#e6a9c4';
            tctx.lineWidth = 1;
            tctx.beginPath(); tctx.moveTo(0, 0); tctx.lineTo(size, size); tctx.stroke();
            tctx.beginPath(); tctx.moveTo(size, 0); tctx.lineTo(0, size); tctx.stroke();
        }, 18),
    },

    // ---- Checkers & Ginghams ----
    { id: 'checkerBW', name: 'Checker B&W', previewCss: checkerPreview('#161616', '#ffffff'), getFill: tileFill(checkerDraw('#161616', '#ffffff'), 16) },
    { id: 'checkerPink', name: 'Checker Pink', previewCss: checkerPreview('#f2a9c9', '#ffffff'), getFill: tileFill(checkerDraw('#f2a9c9', '#ffffff'), 16) },
    { id: 'ginghamRed', name: 'Gingham Red', previewCss: ginghamPreview('#c23b3b'), getFill: tileFill(ginghamDraw('#c23b3b'), 16) },
    { id: 'ginghamPink', name: 'Gingham Pink', previewCss: ginghamPreview('#ee9dc2'), getFill: tileFill(ginghamDraw('#ee9dc2'), 16) },
    { id: 'checkerRed', name: 'Checker Red', previewCss: checkerPreview('#8f1d1d', '#f6dede'), getFill: tileFill(checkerDraw('#8f1d1d', '#f6dede'), 16) },
    { id: 'ginghamGreen', name: 'Gingham Green', previewCss: ginghamPreview('#5f8f52'), getFill: tileFill(ginghamDraw('#5f8f52'), 16) },
    { id: 'ginghamBlue', name: 'Gingham Blue', previewCss: ginghamPreview('#4472ad'), getFill: tileFill(ginghamDraw('#4472ad'), 16) },
    {
        id: 'stripesPink',
        name: 'Stripes Pink',
        previewCss: 'repeating-linear-gradient(90deg,#f6c9dc 0,#f6c9dc 6px,#fff 6px,#fff 12px)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#ffffff';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = '#f6c9dc';
            tctx.fillRect(0, 0, size / 2, size);
        }, 14),
    },
    { id: 'creamSolid', name: 'Cream Solid', previewCss: '#f4ecd8', getFill: solid('#f4ecd8') },
    { id: 'checkerYellowBlue', name: 'Checker Sunny', previewCss: checkerPreview('#f4c542', '#3a5ba0'), getFill: tileFill(checkerDraw('#f4c542', '#3a5ba0'), 16) },
    { id: 'checkerNavy', name: 'Checker Navy', previewCss: checkerPreview('#1c2a4a', '#ffffff'), getFill: tileFill(checkerDraw('#1c2a4a', '#ffffff'), 16) },

    // ---- Animal / croc prints ----
    {
        id: 'leopard',
        name: 'Leopard Print',
        previewCss: 'radial-gradient(circle at 20% 30%,#3f2d20 0 4px,transparent 5px),radial-gradient(circle at 60% 20%,#3f2d20 0 3px,transparent 4px),radial-gradient(circle at 80% 60%,#3f2d20 0 4px,transparent 5px),#d9b382',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#d9b382';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = '#3f2d20';
            [[4, 6, 3], [14, 4, 2], [18, 16, 3], [8, 18, 2], [11, 11, 2]].forEach(([x, y, r]) => {
                tctx.beginPath();
                tctx.arc(x, y, r, 0, Math.PI * 2);
                tctx.fill();
            });
        }, 24),
    },
    {
        id: 'cowPrint',
        name: 'Cow Print',
        previewCss: 'radial-gradient(circle at 25% 30%,#161616 0 6px,transparent 7px),radial-gradient(circle at 70% 65%,#161616 0 5px,transparent 6px),#ffffff',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#ffffff';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = '#181818';
            tctx.beginPath(); tctx.ellipse(size * 0.3, size * 0.35, 5, 4, 0.4, 0, Math.PI * 2); tctx.fill();
            tctx.beginPath(); tctx.ellipse(size * 0.72, size * 0.68, 4, 3.4, -0.3, 0, Math.PI * 2); tctx.fill();
        }, 24),
    },
    {
        id: 'crocMaroon',
        name: 'Croc Maroon',
        previewCss: 'repeating-linear-gradient(60deg,#3a0a0a 0,#3a0a0a 3px,#5c1414 3px,#5c1414 8px)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#5c1414';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#2f0808';
            tctx.lineWidth = 1;
            for (let i = -size; i < size * 2; i += 6) {
                tctx.beginPath(); tctx.moveTo(i, 0); tctx.lineTo(i + size, size); tctx.stroke();
            }
        }, 18),
    },

    // ---- Florals ----
    {
        id: 'floralMagenta',
        name: 'Floral Magenta',
        previewCss: 'radial-gradient(circle at 30% 30%,#e14f9c 0 5px,transparent 6px),radial-gradient(circle at 70% 65%,#f293c6 0 4px,transparent 5px),#fdeef6',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#fdeef6';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = '#e14f9c';
            tctx.beginPath(); tctx.arc(size * 0.3, size * 0.3, 3.2, 0, Math.PI * 2); tctx.fill();
            tctx.fillStyle = '#f293c6';
            tctx.beginPath(); tctx.arc(size * 0.7, size * 0.65, 2.6, 0, Math.PI * 2); tctx.fill();
        }, 20),
    },
    {
        id: 'floralWhite',
        name: 'Floral White Lace',
        previewCss: 'radial-gradient(circle at 30% 30%,#f4c8dc 0 4px,transparent 5px),radial-gradient(circle at 70% 65%,#f4c8dc 0 3px,transparent 4px),#ffffff',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#ffffff';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = '#f4c8dc';
            tctx.beginPath(); tctx.arc(size * 0.3, size * 0.3, 2.6, 0, Math.PI * 2); tctx.fill();
            tctx.beginPath(); tctx.arc(size * 0.7, size * 0.65, 2.2, 0, Math.PI * 2); tctx.fill();
        }, 18),
    },
    {
        id: 'floralPinkField',
        name: 'Floral Pink Field',
        previewCss: 'radial-gradient(circle at 25% 30%, #f9a8d4 0 5px, transparent 6px),radial-gradient(circle at 70% 25%, #fbcfe8 0 4px, transparent 5px),radial-gradient(circle at 50% 65%, #f472b6 0 4px, transparent 5px),radial-gradient(circle at 85% 70%, #fbcfe8 0 5px, transparent 6px),#fff5f8',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#fff5f8';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = '#f9a8d4';
            tctx.beginPath(); tctx.arc(size * 0.25, size * 0.3, 3, 0, Math.PI * 2); tctx.fill();
            tctx.fillStyle = '#fbcfe8';
            tctx.beginPath(); tctx.arc(size * 0.7, size * 0.25, 2.4, 0, Math.PI * 2); tctx.fill();
            tctx.fillStyle = '#f472b6';
            tctx.beginPath(); tctx.arc(size * 0.5, size * 0.65, 2.4, 0, Math.PI * 2); tctx.fill();
            tctx.fillStyle = '#fbcfe8';
            tctx.beginPath(); tctx.arc(size * 0.85, size * 0.7, 3, 0, Math.PI * 2); tctx.fill();
        }, 22),
    },
    {
        id: 'floralRoseWhite',
        name: 'Rose Garden',
        previewCss: 'radial-gradient(circle at 30% 30%,#c8506f 0 5px,transparent 6px),radial-gradient(circle at 65% 60%,#e58ba0 0 4px,transparent 5px),#ffffff',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#ffffff';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = '#c8506f';
            tctx.beginPath(); tctx.arc(size * 0.3, size * 0.3, 3, 0, Math.PI * 2); tctx.fill();
            tctx.fillStyle = '#7ba05b';
            tctx.beginPath(); tctx.ellipse(size * 0.3, size * 0.42, 1.4, 3, 0.4, 0, Math.PI * 2); tctx.fill();
            tctx.fillStyle = '#e58ba0';
            tctx.beginPath(); tctx.arc(size * 0.68, size * 0.65, 2.4, 0, Math.PI * 2); tctx.fill();
        }, 22),
    },

    // ---- Textures ----
    {
        id: 'textureLinen',
        name: 'Linen Texture',
        previewCss: 'repeating-linear-gradient(0deg,#efeae0 0,#efeae0 1px,#f7f3ea 1px,#f7f3ea 2px)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#f7f3ea';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#e7e0d0';
            tctx.lineWidth = 0.6;
            for (let i = 0; i < size; i += 2) {
                tctx.beginPath(); tctx.moveTo(0, i); tctx.lineTo(size, i); tctx.stroke();
            }
        }, 10),
    },
    {
        id: 'textureCrinkle',
        name: 'Crinkle Paper',
        previewCss: 'linear-gradient(120deg,#f4f4f4 10%,#e9e9e9 20%,#fbfbfb 35%,#e2e2e2 50%,#f4f4f4 70%)',
        getFill: (ctx, w, h) => {
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, '#f7f7f7');
            g.addColorStop(0.3, '#e9e9e9');
            g.addColorStop(0.6, '#f4f4f4');
            g.addColorStop(1, '#eaeaea');
            return g;
        },
    },
    {
        id: 'textureCream',
        name: 'Cream Weave',
        previewCss: 'repeating-linear-gradient(45deg,#f2e8d5 0,#f2e8d5 2px,#f8f1e2 2px,#f8f1e2 4px)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#f8f1e2';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#e9dcc0';
            tctx.lineWidth = 1.2;
            tctx.beginPath(); tctx.moveTo(0, 0); tctx.lineTo(size, size); tctx.stroke();
        }, 10),
    },
    {
        id: 'creamDot', name: 'Cream Polka', previewCss: 'radial-gradient(circle, #e8d7b8 0 3px, transparent 4px), #fbf3e4', getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#fbf3e4';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = '#e8d7b8';
            tctx.beginPath(); tctx.arc(size / 2, size / 2, 2, 0, Math.PI * 2); tctx.fill();
        }, 12)
    },

    // ---- Scenic / marble / metallic ----
    {
        id: 'marbleBlue',
        name: 'Marble Blue',
        previewCss: 'linear-gradient(135deg,#3d6f8c,#6fa4c2,#274a5f)',
        getFill: (ctx, w, h) => {
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, '#3d6f8c');
            g.addColorStop(0.5, '#6fa4c2');
            g.addColorStop(1, '#274a5f');
            return g;
        },
    },
    {
        id: 'landscapeGreen',
        name: 'Meadow Green',
        previewCss: 'linear-gradient(180deg,#bfe3a4 0%,#7fb56a 60%,#557a44 100%)',
        getFill: (ctx, _w, h) => {
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, '#bfe3a4');
            g.addColorStop(0.6, '#7fb56a');
            g.addColorStop(1, '#557a44');
            return g;
        },
    },
    {
        id: 'waterBlue',
        name: 'Water Ripple',
        previewCss: 'linear-gradient(180deg,#9fd8e8,#3f88a5,#1c4d63)',
        getFill: (ctx, _w, h) => {
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, '#9fd8e8');
            g.addColorStop(0.5, '#3f88a5');
            g.addColorStop(1, '#1c4d63');
            return g;
        },
    },
    {
        id: 'forestNight',
        name: 'Forest Night',
        previewCss: 'linear-gradient(180deg,#1a2b1a,#243a24,#0f1a0f)',
        getFill: (ctx, _w, h) => {
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, '#1a2b1a');
            g.addColorStop(0.5, '#243a24');
            g.addColorStop(1, '#0f1a0f');
            return g;
        },
    },
    {
        id: 'oceanTeal',
        name: 'Ocean Teal',
        previewCss: 'linear-gradient(135deg,#0f766e,#2dd4bf,#134e4a)',
        getFill: (ctx, w, h) => {
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, '#0f766e');
            g.addColorStop(0.5, '#2dd4bf');
            g.addColorStop(1, '#134e4a');
            return g;
        },
    },
    {
        id: 'damaskGold',
        name: 'Damask Gold',
        previewCss: 'radial-gradient(circle at 30% 30%,#f1d69a 0 5px,transparent 6px),radial-gradient(circle at 70% 70%,#f1d69a 0 4px,transparent 5px),#8a6d2f',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#8a6d2f';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#f1d69a';
            tctx.lineWidth = 1;
            tctx.beginPath(); tctx.arc(size / 2, size / 2, size * 0.3, 0, Math.PI * 2); tctx.stroke();
        }, 20),
    },
    {
        id: 'foilSilver',
        name: 'Silver Foil',
        previewCss: 'linear-gradient(135deg,#e2e2e2,#ffffff,#c9c9c9)',
        getFill: (ctx, w, h) => {
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, '#e6e6e6');
            g.addColorStop(0.5, '#ffffff');
            g.addColorStop(1, '#cfcfcf');
            return g;
        },
    },
    {
        id: 'scribbleBlack',
        name: 'Scribble Black',
        previewCss: 'radial-gradient(circle, #333 1px, transparent 1.5px), #0d0d0d',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#0d0d0d';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#3a3a3a';
            tctx.lineWidth = 0.8;
            tctx.beginPath();
            tctx.moveTo(0, size * 0.5);
            tctx.bezierCurveTo(size * 0.3, 0, size * 0.7, size, size, size * 0.5);
            tctx.stroke();
        }, 16),
    },
    {
        id: 'sparkleWhite',
        name: 'Sparkle White',
        previewCss: 'radial-gradient(circle, #ffe9a8 0 1.5px, transparent 2px), #ffffff',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#ffffff';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = '#f6d580';
            for (let i = 0; i < 4; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                tctx.beginPath(); tctx.arc(x, y, 0.9, 0, Math.PI * 2); tctx.fill();
            }
        }, 16),
    },
    {
        id: 'lineSilver',
        name: 'Silver Ribbon',
        previewCss: 'repeating-linear-gradient(45deg,#d1d5db 0,#d1d5db 3px,#f3f4f6 3px,#f3f4f6 10px)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#f3f4f6';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#d1d5db';
            tctx.lineWidth = 3;
            tctx.beginPath();
            tctx.moveTo(0, size);
            tctx.lineTo(size, 0);
            tctx.stroke();
        }, 14),
    },
    {
        id: 'quiltGray',
        name: 'Quilted Gray',
        previewCss: 'linear-gradient(135deg, #e6e6e6 25%, #d4d4d4 25%, #d4d4d4 50%, #e6e6e6 50%, #e6e6e6 75%, #d4d4d4 75%)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#e6e6e6';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#c9c9c9';
            tctx.lineWidth = 1;
            tctx.beginPath(); tctx.moveTo(0, 0); tctx.lineTo(size, size); tctx.stroke();
            tctx.beginPath(); tctx.moveTo(size, 0); tctx.lineTo(0, size); tctx.stroke();
        }, 18),
    },
    {
        id: 'denimBlue',
        name: 'Blue Denim',
        previewCss: 'repeating-linear-gradient(45deg, #3b5998 0px, #3b5998 2px, #304d8a 2px, #304d8a 4px)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#304d8a';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#243b6b';
            tctx.lineWidth = 1;
            tctx.beginPath();
            tctx.moveTo(0, 0); tctx.lineTo(size, size);
            tctx.stroke();
            tctx.strokeStyle = '#4b6cb7';
            tctx.beginPath();
            tctx.moveTo(0, size); tctx.lineTo(size, 0);
            tctx.stroke();
        }, 8),
    },
    {
        id: 'sunsetBeach',
        name: 'Sunset Beach',
        previewCss: 'linear-gradient(180deg, #ff7e5f, #feb47b)',
        getFill: (ctx, _w, h) => {
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, '#ff7e5f');
            g.addColorStop(0.5, '#feb47b');
            g.addColorStop(1, '#2f1b40');
            return g;
        },
    },
    {
        id: 'blissSky',
        name: 'Bliss Sky',
        previewCss: 'linear-gradient(180deg, #56ccf2, #2f80ed)',
        getFill: (ctx, _w, h) => {
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, '#56ccf2');
            g.addColorStop(0.6, '#2f80ed');
            g.addColorStop(1, '#1b4d3e');
            return g;
        },
    },
    {
        id: 'starsPattern',
        name: 'Sweet Stars',
        previewCss: 'radial-gradient(circle, #fbcfe8 15%, transparent 16%) 0 0/14px 14px, #ffffff',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#ffffff';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = '#fbcfe8';
            tctx.fillRect(size / 2 - 1, 2, 2, 6);
            tctx.fillRect(size / 2 - 3, 4, 6, 2);
            tctx.fillRect(2, size / 2 - 1, 6, 2);
            tctx.fillRect(4, size / 2 - 3, 2, 6);
        }, 16),
    },
    {
        id: 'mosaicGold',
        name: 'Mosaic Gold',
        previewCss: 'repeating-linear-gradient(90deg, #111 0px, #111 4px, #d4af37 4px, #d4af37 5px)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#111111';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#d4af37';
            tctx.lineWidth = 1;
            tctx.strokeRect(0, 0, size, size);
            tctx.beginPath();
            tctx.moveTo(0, 0); tctx.lineTo(size, size);
            tctx.stroke();
        }, 16),
    },
    {
        id: 'snakeSkin',
        name: 'Blue Snake',
        previewCss: 'radial-gradient(circle at 50% 50%, #2b6cb0 10%, #1a365d 90%)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#1a365d';
            tctx.fillRect(0, 0, size, size);
            tctx.strokeStyle = '#2b6cb0';
            tctx.lineWidth = 1.2;
            tctx.beginPath();
            tctx.moveTo(size / 2, 0);
            tctx.lineTo(size, size / 2);
            tctx.lineTo(size / 2, size);
            tctx.lineTo(0, size / 2);
            tctx.closePath();
            tctx.stroke();
        }, 14),
    },
    {
        id: 'crumpledVinyl',
        name: 'Glossy Vinyl',
        previewCss: 'linear-gradient(135deg, #111, #333, #000)',
        getFill: (ctx, w, h) => {
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, '#111111');
            g.addColorStop(0.4, '#333333');
            g.addColorStop(0.6, '#050505');
            g.addColorStop(1, '#222222');
            return g;
        },
    },
    {
        id: 'crumpledFoil',
        name: 'Crumpled Foil',
        previewCss: 'linear-gradient(135deg, #eee, #fff, #ddd)',
        getFill: (ctx, w, h) => {
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, '#dddddd');
            g.addColorStop(0.3, '#ffffff');
            g.addColorStop(0.5, '#cccccc');
            g.addColorStop(0.8, '#eeeeee');
            g.addColorStop(1, '#bbbbbb');
            return g;
        },
    },
    {
        id: 'steelSheet',
        name: 'Steel Sheet',
        previewCss: 'linear-gradient(90deg, #888, #ddd, #666)',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#888888';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = '#dddddd';
            tctx.fillRect(size / 4, 0, size / 2, size);
            tctx.strokeStyle = '#666666';
            tctx.lineWidth = 0.5;
            for (let i = 0; i < size; i += 2) {
                tctx.beginPath(); tctx.moveTo(i, 0); tctx.lineTo(i, size); tctx.stroke();
            }
        }, 12),
    },
    {
        id: 'rosePattern',
        name: 'Rose Garden',
        previewCss: 'radial-gradient(circle, #f43f5e 10%, transparent 11%), #fff1f2',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#fff1f2';
            tctx.fillRect(0, 0, size, size);
            tctx.fillStyle = '#f43f5e';
            tctx.beginPath(); tctx.arc(size * 0.3, size * 0.3, 2.2, 0, Math.PI * 2); tctx.fill();
            tctx.beginPath(); tctx.arc(size * 0.7, size * 0.7, 2.2, 0, Math.PI * 2); tctx.fill();
            tctx.fillStyle = '#10b981';
            tctx.fillRect(size * 0.3 - 2, size * 0.3 + 2, 4, 1);
            tctx.fillRect(size * 0.7 - 2, size * 0.7 + 2, 4, 1);
        }, 16),
    },
    {
        id: 'floralSakura',
        name: 'Sakura Petals',
        previewCss: 'radial-gradient(circle, #fbcfe8 25%, transparent 26%) 0 0/18px 18px, #fff5f8',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#fff5f8';
            tctx.fillRect(0, 0, size, size);
            
            // Draw cherry blossom petals
            tctx.save();
            tctx.translate(size / 2, size / 2);
            tctx.fillStyle = '#fbcfe8';
            const r = size * 0.28;
            for (let i = 0; i < 5; i++) {
                tctx.rotate((Math.PI * 2) / 5);
                tctx.beginPath();
                tctx.ellipse(0, -r, r * 0.7, r * 1.2, 0, 0, Math.PI * 2);
                tctx.fill();
                tctx.fillStyle = '#f472b6';
                tctx.beginPath();
                tctx.ellipse(0, -r * 0.5, r * 0.4, r * 0.7, 0, 0, Math.PI * 2);
                tctx.fill();
                tctx.fillStyle = '#fbcfe8';
            }
            tctx.fillStyle = '#f59e0b';
            tctx.beginPath();
            tctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
            tctx.fill();
            tctx.restore();
        }, 36),
    },
    {
        id: 'floralDaisy',
        name: 'Kawaii Daisy',
        previewCss: 'radial-gradient(circle, #fbbf24 15%, transparent 16%) 0 0/16px 16px, #eff6ff',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#eff6ff'; // soft baby blue background
            tctx.fillRect(0, 0, size, size);
            
            tctx.save();
            tctx.translate(size / 2, size / 2);
            tctx.fillStyle = '#ffffff';
            const r = size * 0.25;
            for (let i = 0; i < 8; i++) {
                tctx.rotate((Math.PI * 2) / 8);
                tctx.beginPath();
                tctx.ellipse(0, -r, r * 0.4, r * 1.1, 0, 0, Math.PI * 2);
                tctx.fill();
            }
            tctx.fillStyle = '#fbbf24';
            tctx.beginPath();
            tctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
            tctx.fill();
            tctx.restore();
        }, 32),
    },
    {
        id: 'floralLily',
        name: 'Sweet Lilies',
        previewCss: 'radial-gradient(circle, #fce7f3 25%, transparent 26%) 0 0/20px 20px, #fffbfa',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#fffbfa';
            tctx.fillRect(0, 0, size, size);
            
            tctx.save();
            tctx.translate(size / 2, size / 2);
            tctx.fillStyle = '#fce7f3';
            tctx.strokeStyle = '#db2777';
            tctx.lineWidth = 0.8;
            const r = size * 0.24;
            for (let i = 0; i < 6; i++) {
                tctx.rotate((Math.PI * 2) / 6);
                tctx.beginPath();
                tctx.moveTo(0, 0);
                tctx.quadraticCurveTo(-r * 0.6, -r * 0.8, 0, -r * 1.5);
                tctx.quadraticCurveTo(r * 0.6, -r * 0.8, 0, 0);
                tctx.fill();
                tctx.stroke();
            }
            tctx.strokeStyle = '#f59e0b';
            tctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                tctx.beginPath();
                tctx.moveTo(0, 0);
                tctx.quadraticCurveTo(-5 + i * 3, -r * 0.5, -6 + i * 4, -r * 0.7);
                tctx.stroke();
                tctx.fillStyle = '#f59e0b';
                tctx.beginPath();
                tctx.arc(-6 + i * 4, -r * 0.7, 1, 0, Math.PI * 2);
                tctx.fill();
            }
            tctx.restore();
        }, 40),
    },
    {
        id: 'floralHibiscus',
        name: 'Hibiscus Pink',
        previewCss: 'radial-gradient(circle, #be185d 20%, transparent 21%) 0 0/24px 24px, #fff5f7',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#fff5f7';
            tctx.fillRect(0, 0, size, size);
            
            tctx.save();
            tctx.translate(size / 2, size / 2);
            tctx.fillStyle = '#be185d';
            const r = size * 0.26;
            for (let i = 0; i < 5; i++) {
                tctx.rotate((Math.PI * 2) / 5);
                tctx.beginPath();
                tctx.moveTo(0, 0);
                tctx.bezierCurveTo(-r * 0.8, -r * 0.5, -r * 1.1, -r * 1.6, 0, -r * 1.6);
                tctx.bezierCurveTo(r * 1.1, -r * 1.6, r * 0.8, -r * 0.5, 0, 0);
                tctx.fill();
            }
            tctx.strokeStyle = '#fbbf24';
            tctx.lineWidth = 1.8;
            tctx.beginPath();
            tctx.moveTo(0, 0);
            tctx.quadraticCurveTo(r * 0.6, -r * 0.4, r * 1.1, -r * 0.9);
            tctx.stroke();
            tctx.fillStyle = '#fbbf24';
            for (let j = 0; j < 4; j++) {
                tctx.beginPath();
                tctx.arc(r * 1.1 + Math.sin(j) * 3, -r * 0.9 + Math.cos(j) * 3, 1.2, 0, Math.PI * 2);
                tctx.fill();
            }
            tctx.restore();
        }, 48),
    },
    {
        id: 'floralSunflower',
        name: 'Sunflower Field',
        previewCss: 'radial-gradient(circle, #f59e0b 20%, transparent 21%) 0 0/22px 22px, #e0f2fe',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#e0f2fe'; // soft blue sky
            tctx.fillRect(0, 0, size, size);
            
            tctx.save();
            tctx.translate(size / 2, size / 2);
            tctx.fillStyle = '#f59e0b';
            const r = size * 0.25;
            for (let i = 0; i < 12; i++) {
                tctx.rotate((Math.PI * 2) / 12);
                tctx.beginPath();
                tctx.ellipse(0, -r, r * 0.28, r * 0.9, 0, 0, Math.PI * 2);
                tctx.fill();
            }
            tctx.fillStyle = '#78350f';
            tctx.beginPath();
            tctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
            tctx.fill();
            tctx.restore();
        }, 44),
    },
    {
        id: 'floralTulip',
        name: 'Tulip Garden',
        previewCss: 'radial-gradient(circle, #ef4444 15%, transparent 16%) 0 0/18px 18px, #fef9c3',
        getFill: tileFill((tctx, size) => {
            tctx.fillStyle = '#fef9c3'; // soft spring yellow background
            tctx.fillRect(0, 0, size, size);
            
            tctx.save();
            tctx.translate(size / 2, size / 2);
            tctx.strokeStyle = '#10b981';
            tctx.lineWidth = 1.6;
            const r = size * 0.25;
            tctx.beginPath();
            tctx.moveTo(0, 0);
            tctx.lineTo(0, r * 1.2);
            tctx.stroke();
            tctx.fillStyle = '#ef4444';
            tctx.beginPath();
            tctx.arc(0, 0, r * 0.6, 0, Math.PI);
            tctx.fill();
            tctx.beginPath();
            tctx.moveTo(-r * 0.6, 0);
            tctx.lineTo(-r * 0.5, -r * 0.8);
            tctx.lineTo(-r * 0.1, -r * 0.3);
            tctx.lineTo(0, -r * 0.8);
            tctx.lineTo(r * 0.1, -r * 0.3);
            tctx.lineTo(r * 0.5, -r * 0.8);
            tctx.lineTo(r * 0.6, 0);
            tctx.closePath();
            tctx.fill();
            tctx.restore();
        }, 36),
    },
];