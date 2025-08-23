# Orrya Pitch Hub

A professional pitch deck viewer system for showcasing multiple business presentations.

## Structure

```
/
├── index.html                    # Main hub page
├── shared/
│   └── navigation.css           # Shared navigation styles
├── chatbot/                     # Conversation Engine deck
│   ├── slide1.html - slide8.html
├── gymFaceRecognition/          # Gym Face Recognition deck
│   ├── slide1.html - slide8.html
└── setup_navigation.py         # Script for adding navigation
```

## Features

- **Professional Hub Page**: Clean, branded landing page with links to all presentations
- **Seamless Navigation**: Previous/Next buttons, slide counters, and home buttons on every slide
- **Mobile Responsive**: Optimized for all device sizes
- **Fast Loading**: Static files that load instantly
- **Easy Deployment**: Ready for hosting on Netlify, Vercel, or any static hosting service

## Navigation Features

Each slide includes:
- **Home Button**: Top-left corner, returns to hub
- **Slide Counter**: Top-right corner, shows current position (e.g., "3 / 8")
- **Previous/Next Buttons**: Bottom center, for seamless presentation flow
- **Back to Hub**: Primary action on first and last slides

## Deployment Instructions

1. **For Netlify**:
   - Drag the entire folder to netlify.com
   - Configure custom domain (e.g., pitch.orrya.com)

2. **For Vercel**:
   - Connect your GitHub repository
   - Deploy automatically
   - Configure custom domain

3. **Custom Domain Setup**:
   - Add CNAME record: `pitch` → `your-host.netlify.app`
   - Update DNS settings
   - Enable HTTPS (automatic with most hosts)

## Usage

Send investors and clients a clean, professional link:
- `https://pitch.orrya.com` → Hub page
- `https://pitch.orrya.com/chatbot/slide1.html` → Direct to specific presentation

## Maintenance

To add new presentations:
1. Create new folder (e.g., `/new-product/`)
2. Add slide HTML files
3. Run `python setup_navigation.py` to add navigation
4. Update `index.html` to include the new deck

## Technical Notes

- Pure HTML/CSS/JavaScript (no backend required)
- Uses Montserrat font family for consistent branding
- Font Awesome icons for navigation elements
- CSS Grid and Flexbox for responsive layouts
- Modern CSS features with fallbacks for compatibility
