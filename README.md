# Where's Covid?

A simple website to show you the nearest reported case of COVID-19 using historical data.

View the live website here: [https://wherescovid.casjay.coffee](https://wherescovid.casjay.coffee)

**Note:** This app uses historical COVID-19 data from Johns Hopkins CSSE (last updated March 2023).

## Tech Stack

* Vanilla JavaScript
* Bootstrap 5 (CSS only)
* Parcel 2 bundler
* Express.js (for CORS-enabled server)
* Mobile-responsive design

## Requirements

* Node.js 20.x or higher
* npm

## Installation

```bash
# Clone the repository
git clone https://github.com/now-sh/wherescovid.git
cd wherescovid

# Install dependencies
npm install
```

## Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Build for GitHub Pages
npm run github

# Serve with CORS headers enabled
npm run serve

# Build and serve
npm run serve:build
```

## Deployment

The app can be deployed to various platforms:

- **Vercel**: `npm run now`
- **GitHub Pages**: `npm run github` (builds to `docs/` directory)
- **Netlify**: Automatic deployment with `_headers` file for CORS
- **Custom server**: Use `npm run serve` with the Express server

## References

* Rough location provided by: [https://ipapi.co](https://ipapi.co) and [Nominatim](https://nominatim.openstreetmap.org/)
* COVID-19 Data provided by: [Johns Hopkins CSSE](https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6)
* Precise location provided by the browser geolocation API: [Geolocation.getCurrentPosition()](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition)

## Privacy

* No data is stored by this website. All data is retrieved from external sources. See the privacy policies for [https://ipapi.co](https://ipapi.co) and [Johns Hopkins CSSE](https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6)
