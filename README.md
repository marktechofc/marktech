
# Mark tech - Future of Technology Landing Page

A modern, dynamic, and visually striking landing page for Mark tech, featuring cutting-edge animations, glassmorphism effects, and a futuristic dark theme with neon green accents.

## Features

### Visual Design
- **Dark Theme**: Sleek black background (#0f0f0f) for a premium feel
- **Neon Green Accents**: Vibrant #00ff88 color for brand consistency
- **Glassmorphism**: Modern blur effects with transparency
- **Animated Background**: Floating particles and moving grid lines

### Interactive Elements
- **Smooth Scroll Animations**: Elements fade in as you scroll
- **Micro-interactions**: Hover effects, button ripples, and transitions
- **Parallax Effects**: Dynamic movement based on scroll position
- **Mouse Trail**: Subtle particle effects following cursor movement

### Page Structure (11 Sections)
1. **Hero Section**: Eye-catching headline with floating animated cards
2. **Problem Section**: Highlighting customer pain points
3. **Solution Section**: Service offerings with icons
4. **Benefits Section**: Key advantages with statistics
5. **Pricing Section**: 4-tier pricing plans (Basic, Professional, Premium, Elite)
6. **Portfolio Section**: Success stories with hover overlays
7. **Testimonials**: Auto-rotating customer reviews
8. **Process Section**: Step-by-step timeline
9. **FAQ Section**: Interactive accordion
10. **Final CTA**: Strong call-to-action
11. **Footer**: Contact information and social links

### Technical Features
- **Fully Responsive**: Mobile-first design approach
- **Performance Optimized**: Debounced scroll events and smooth animations
- **Semantic HTML5**: Proper structure for accessibility
- **Modern CSS**: Grid, Flexbox, and CSS animations
- **Vanilla JavaScript**: No dependencies, pure JS interactions

## Brand Colors
- **Primary Black**: `#0f0f0f`
- **Neon Green**: `#00ff88`
- **Text White**: `#ffffff`
- **Text Gray**: `#b0b0b0`

## Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800, 900

## File Structure
```
Mark/
|-- index.html          # Main HTML structure
|-- styles.css          # Complete styling with animations
|-- script.js           # Interactive JavaScript
|-- README.md           # This documentation
```

## How to Use

### Option 1: Direct Browser Open
1. Simply double-click `index.html` to open in any modern browser
2. All features will work immediately without any setup

### Option 2: Local Server (Recommended for development)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```
Then visit `http://localhost:8000` in your browser.

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Key Interactions

### Navigation
- Smooth scrolling to sections
- Mobile hamburger menu
- Sticky navigation with backdrop blur

### Animations
- Scroll-triggered fade-ins
- Floating cards in hero section
- Particle effects in background
- Button hover states with glow effects

### Interactive Elements
- FAQ accordion with smooth transitions
- Portfolio hover overlays
- Testimonial auto-rotation
- Pricing card hover effects

## Performance Considerations
- Uses `IntersectionObserver` for efficient scroll animations
- Debounced scroll handlers for better performance
- CSS animations instead of JavaScript where possible
- Optimized particle generation

## Customization Tips

### Changing Brand Colors
Update the CSS variables in `styles.css`:
```css
:root {
    --primary-black: #0f0f0f;
    --neon-green: #00ff88;
    /* ... other variables */
}
```

### Modifying Animations
Adjust animation durations and delays in the CSS:
```css
.fade-in {
    animation: fadeIn 1s ease forwards;
}
```

### Adding New Sections
Follow the existing pattern:
1. Add semantic HTML in `index.html`
2. Style with existing CSS classes
3. Add JavaScript interactions if needed

## Console Easter Egg
Open browser console to see a special Mark tech branded message!

## License
This project is open source and available under the MIT License.
