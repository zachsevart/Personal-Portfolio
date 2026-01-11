/**
 * Bubble Background Color Configuration
 * 
 * Colors are in RGB format (comma-separated values, no spaces)
 * Example: '255,100,50' for RGB(255, 100, 50)
 * 
 * You can change these colors to customize the bubble background across all pages
 */

export type BubbleColors = {
  first: string;
  second: string;
  third: string;
  fourth: string;
  fifth: string;
  sixth: string;
};

// Default color scheme - violet/blue theme
export const defaultColors: BubbleColors = {
  first: '18,113,255',      // Blue
  second: '221,74,255',     // Magenta
  third: '0,220,255',       // Cyan
  fourth: '200,50,50',      // Red
  fifth: '180,180,50',      // Yellow
  sixth: '140,100,255',     // Purple
};

export const warmColors: BubbleColors = {
  first: '255,100,50',     // Orange
  second: '255,150,0',     // Amber
  third: '255,200,50',     // Yellow
  fourth: '255,80,120',    // Pink
  fifth: '200,50,50',      // Red
  sixth: '255,180,100',    // Peach
};

export const coolColors: BubbleColors = {
  first: '50,150,255',     // Sky Blue
  second: '100,200,255',   // Light Blue
  third: '150,100,255',    // Lavender
  fourth: '50,255,200',    // Turquoise
  fifth: '100,150,255',    // Periwinkle
  sixth: '200,150,255',    // Light Purple
};

export const redandblueColors: BubbleColors = {
  first: '255,0,0',     // Red
  second: '0,0,255',     // Blue
  third: '255,255,0',     // Yellow
  fourth: '0,255,0',     // Green
  fifth: '255,0,255',   // Magenta
  sixth: '220,0,0',   // 
};


// Export the active color scheme (change this to switch themes)
export const activeColors = defaultColors;
export const activeColors2 = warmColors;
export const activeColors3 = coolColors;
export const activeColors4 = redandblueColors;