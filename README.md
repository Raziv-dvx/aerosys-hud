# AeroSys HUD

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-lightgrey.svg)

**Advanced System Monitoring Suite** - A beautiful, premium system monitoring application for Windows built with Electron and React.

![AeroSys HUD Screenshot](public/icon.png)

---

## ✨ Features

### 📊 Comprehensive System Monitoring
- **CPU**: Usage, temperature, clock speeds, load averages, throttling detection, power consumption
- **GPU**: Utilization, VRAM, temperatures, clock speeds, power draw, fan speeds
- **Memory**: RAM usage, channels, cache sizes, per-stick information
- **Storage**: All drives, SMART health, read/write speeds, IOPS, TBW tracking
- **Network**: Bandwidth, ping tests, Wi-Fi signal, public/local IP, daily/monthly usage
- **Power**: Battery status, wear level, charge rate, system power consumption

### 🎨 Premium UI/UX
- Modern glassmorphism design with neon accents
- Smooth animations powered by Framer Motion
- Dark theme with vibrant blue/purple gradients
- Responsive layout with tab-based navigation
- Real-time data updates with optimized polling

### 🔔 System Tray Integration
- Minimize to Windows taskbar
- Real-time stats tooltip on hover
- Quick access context menu
- Click to restore window

### 📈 Performance Optimized
- Lightweight (~150MB RAM usage)
- Low CPU overhead (~2% idle)
- Staggered polling for efficiency
- Optimized for 4GB+ RAM systems

---

## 🖥️ System Requirements

### Minimum
- **OS**: Windows 10 or Windows 11
- **CPU**: Dual-core processor (2 GHz+)
- **RAM**: 4 GB
- **Storage**: 200 MB free space
- **Display**: 1280x720 resolution

### Recommended
- **OS**: Windows 11 (latest updates)
- **CPU**: Quad-core processor (3 GHz+)
- **RAM**: 8 GB
- **Storage**: 500 MB free space
- **Display**: 1920x1080 resolution or higher

---

## 📥 Installation

### Option 1: Download Installer (Recommended)
1. Download the latest `AeroSys HUD Setup 1.1.0.exe` from [Releases](https://github.com/Raziv-dvx/aerosys-hud/releases)
2. Run the installer
3. Follow the installation wizard
4. Launch AeroSys HUD from Start Menu or Desktop

### Option 2: Build from Source
```powershell
# Clone the repository
git clone https://github.com/Raziv-dvx/aerosys-hud.git
cd aerosys-hud

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

See [INSTALLATION.md](INSTALLATION.md) for detailed instructions.

---

## 🚀 Usage

### Tabs Overview
- **Overview**: System health score and key metrics at a glance
- **CPU**: Detailed processor statistics and per-core usage
- **GPU**: Graphics card utilization and performance metrics
- **Memory**: RAM and storage information with SMART data
- **Network**: Bandwidth, connectivity, and usage tracking
- **Power**: Battery status and power consumption
- **Changelog**: Complete version history
- **About**: Project information and technology stack

### Keyboard Shortcuts
- `Ctrl + Q`: Quit application
- `Ctrl + M`: Minimize to tray
- `Ctrl + R`: Refresh data

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend & Desktop
- **Electron** - Desktop app framework
- **Node.js** - JavaScript runtime
- **systeminformation** - Hardware data collection
- **active-win** - Active window tracking
- **loudness** - Audio volume monitoring

---

## 📜 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License** (CC BY-NC-SA 4.0).

### You are free to:
- ✅ View and study the source code
- ✅ Modify the code for any purpose
- ✅ Share your modifications with others
- ✅ Use it for personal and educational purposes

### Under these conditions:
- 📝 **Attribution** - Give credit to the original author
- 🚫 **NonCommercial** - No commercial use or monetization
- 🔄 **ShareAlike** - Share modifications under the same license

See [LICENSE.txt](LICENSE.txt) for full details.

---

## 🔒 Privacy

AeroSys HUD respects your privacy:
- ✅ **100% Local** - All data stays on your device
- ✅ **No Telemetry** - No usage tracking or analytics
- ✅ **No Ads** - No advertising or marketing
- ✅ **Open Source** - Transparent and auditable code
- ✅ **Minimal Network** - Only optional IP detection and ping tests

See [LICENSE_PRIVACY.txt](LICENSE_PRIVACY.txt) for our privacy policy.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please ensure your code follows the existing style and includes appropriate comments.

### Development Setup
```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build
```

---

## 📝 Changelog

See the in-app **Changelog** tab for complete version history, or check [CHANGELOG.md](CHANGELOG.md).

### Latest Release - v1.1.0
- 🐛 Fixed taskbar icon visibility issues
- ✅ Added "Close Stats" button to taskbar
- ✅ Fixed duplicate tray icons
- ⚡ 40% CPU usage reduction
- 💾 25% RAM usage reduction
- 🎨 Simplified branding to "AeroSys HUD"

---

## 🐛 Known Issues

- Storage metrics may show errors on some systems (non-critical)
- ACPI temperature zones may not be available on all hardware
- Screen brightness detection is limited on some displays

Report issues on [GitHub Issues](https://github.com/Raziv-dvx/aerosys-hud/issues).

---

## 🗺️ Roadmap

- [ ] Linux support
- [ ] macOS support
- [ ] Custom themes
- [ ] Plugin system
- [ ] Export data to CSV/JSON
- [ ] Historical graphs and charts
- [ ] Alerts and notifications
- [ ] Multi-language support

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Raziv-dvx/aerosys-hud/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Raziv-dvx/aerosys-hud/discussions)
- **Author**: [Raziv-dvx](https://github.com/Raziv-dvx)

---

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- System data via [systeminformation](https://github.com/sebhildebrandt/systeminformation)
- Icons from [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

## 📄 Version History

- **v1.1.0** (Current) - Performance optimizations and bug fixes
- **v1.0.0** - Major release with glassmorphism UI
- **v0.9** - Network features and About section
- **v0.8** - GPU and storage metrics expansion
- See full history in the Changelog tab

---

**Made with ❤️ by [Raziv-dvx](https://github.com/Raziv-dvx)**

Copyright © 2025 Raziv-dvx. Licensed under CC BY-NC-SA 4.0.
