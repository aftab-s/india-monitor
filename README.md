# 🇮🇳 Observe India: Real-Time Intelligence Dashboard

![Observe India Hero](public/observe-india.png)

> **A High-Fidelity, Technical Intelligence Hub for National Monitoring and Situational Awareness.**

Observe India is a professional, data-dense dashboard designed for high-stakes national monitoring. It combines real-time data feeds from multiple global APIs and Indian government sources to provide a comprehensive overview of India's economic, social, and infrastructure landscape.

---

## ✨ Cool Stuff & Highlights

*   **Persistent & Customizable Layouts**: Draggable and resizable panels allow you to create your own surveillance layout. Your preferences are saved automatically and can go back to defaults anytime.
*   **Dynamic Live Streams**: Automated synchronization of YouTube live streams for national and state news channels.
*   **Geospatial Intelligence**: Interactive map with hover details, capital city highlights, and regional data density.

---

## ⚡ Core Features

### 1. Intelligence Pipeline
- **Groq AI Context**: Generates professional, context-aware intelligence briefs for every district.
- **Hyper-Local Monitoring**: Precise coordinates for any district via **Open-Meteo Geocoding**, providing accurate Weather and AQI data.

### 2. Live Media & News
- **YouTube Live Integration**: Centralized `news.json` dataset powers a dynamic streaming matrix.
- **Multi-Source News**: Integration with NewsData.io, NewsAPI.org, and the GDELT Project for comprehensive coverage.

### 3. Economic & Infrastructure Monitoring
- **Financial Indicators**: Real-time NIFTY/SENSEX indices, INR exchange rates, and RBI policy metrics.
- **State Fuel Prices**: Real-time fuel price monitoring across states.
- **EV Infrastructure**: Track EV charging stations and pumps (synced via automated pipelines).

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + Vite 8
- **Styling**: Tailwind CSS 4 (Technical Modernist)
- **Map Engine**: MapLibre GL (Wireframe/Contour Style)
- **State Management & UI**: React Map GL, React Grid Layout, Lucide React
- **APIs Integrated**:
  - **Intelligence**: Groq AI
  - **Environment**: Open-Meteo (Weather & AQI)
  - **Financial**: Yahoo Finance (Markets), Open-ER (Currency)
  - **News**: NewsData.io, NewsAPI.org, GDELT Project
  - **Social**: Wikipedia REST API

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/aftab-s/india-monitor.git
cd india-monitor
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file and fill in your API keys:
```bash
cp .env.example .env
```
*See [.env.example](.env.example) for the list of required keys.*

### 4. Run locally
```bash
npm run dev
```

---

## 🔄 Automated Synchronization

The project includes several scripts to keep the data fresh. These are configured in `package.json`:

- `npm run youtube:sync`: Syncs the latest YouTube live streams.
- `npm run fuel:sync`: Updates state-level fuel prices.
- `npm run pumps:sync`: Syncs fuel pump data.
- `npm run ev:sync`: Syncs EV station data.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

---

<p align="center">
  <a href="https://what-s-happening-in-kerala.vercel.app/">
    <img src="https://img.shields.io/badge/In%20Collaboration%20with-Kerala%20Monitor-000000?style=for-the-badge&logo=vercel" alt="Kerala Monitor Collaboration">
  </a>
</p>
