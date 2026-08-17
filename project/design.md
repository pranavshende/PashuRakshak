# System Design & UX Overhaul

## 1. UI/UX Overhaul & Parity Tuning
Modernize web interface to achieve complete parity with the Android mobile app, establishing premium visual guidelines.
- **Light Theme Migration**: Fully replaced the dark palette with slate-grey/mint-green gradients (`#F8FAFC`, `#ECFDF5`) and slate-text colors for a premium, clean look.
- **Unified Header & Navigation Layout**: Created a global, fixed header (`top: 0; left: 0; right: 0; z-index: 105;`) extending across the top of the viewport. Shifted sidebar menu down to `top: 92px` (meeting the header border) and removed duplicate logo text to keep page headers cleanly aligned on the far left.
- **Mobile Grid Adaptations**: Reconfigured responsive grid selectors so stats panels display in a clean 2x2 column set (`repeat(2, 1fr)`) instead of stacking vertically or getting squished on mobile screens.

## 2. Advanced Feature Designs
- **Digital Twin profile**: Implemented detailed diagnostic histories, tag parameters, and recovery status toggles.
- **Livestock Health Certificate**: One-click print/save PDF layout for insurance claims and bank loans.
- **Surveillance Heatmap**: Built interactive GIS outbreak mapping displaying 14-day forecasts and seasonal filters.
- **Community Intelligence Feed**: Implemented interactive crowdsourced community advisory and alert feed.
- **AI Vet Assistant**: Powered by Google Gemini, giving farmers real-time first-aid diagnostics and symptom checks.
- **AI Farm Productivity Score**: Standardized key performance indicators (KPIs) into a visual farm performance scoring ring.
- **IoT Smart Livestock Monitor**: Real-time sensor dashboard reporting animal temperature, GPS location, rumination timelines, and activity heart rate with active alerts.
