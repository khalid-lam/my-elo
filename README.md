# MyElo

MyElo is a mobile application built with Apache Cordova that allows users to manage and track Elo ratings for sports games such as Tennis and FIFA. The app provides a platform for players to record matches, view leaderboards, and see their performance evolution over time.

## Features

- **User Authentication**: Secure login and registration system using OAuth.
- **Match Recording**: Record matches for Tennis and FIFA with detailed score inputs.
- **Elo Calculation**: Automatic calculation of Elo ratings based on match outcomes using sport-specific formulas.
- **Leaderboards**: View personal results, all results, and overall leaderboards.
- **Responsive Design**: Built with Bootstrap for a clean, mobile-friendly interface.
- **Mathematical Rendering**: Uses MathJax to display Elo calculation formulas.

### Elo Calculation Details

The app uses the Elo rating system with customized parameters:

- **Common Parameters**:
  - K = 30 (impact constant)
  - λ = 0.2 (performance parameter)
  - Minimum Elo protection at 200 points

- **Tennis**: Based on sets won
  - Δ = 1 + 0.2 × Difference in sets won
  - New Elo = K × (1 - E) × Δ

- **FIFA**: Based on goal difference (capped at 5)
  - Δ = 1 + 0.2 × min(Goal difference, 5)
  - New Elo = K × (1 - E) × Δ

Where E is the expected win probability: E = 1 / (1 + 10^((Opponent Elo - Player Elo)/400))

## Technologies Used

- **Apache Cordova**: Cross-platform mobile development
- **HTML5/CSS3/JavaScript**: Core web technologies
- **Bootstrap 5**: Responsive UI framework
- **jQuery**: DOM manipulation and AJAX
- **Mustache.js**: Templating engine
- **MathJax**: Mathematical notation rendering
- **Font Awesome**: Icons

## Prerequisites

Before running this project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Apache Cordova CLI](https://cordova.apache.org/docs/en/latest/guide/cli/)
- Android SDK (for Android builds)
- Java JDK (for Android builds)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/modal-elo.git
   cd modal-elo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add the Android platform:
   ```bash
   cordova platform add android
   ```

4. Build the project:
   ```bash
   cordova build android
   ```

## Usage

### Development

To run the app in a browser for development:
```bash
cordova serve
```

### Android

To build and run on an Android device/emulator:
```bash
cordova run android
```

### Building APK

To generate a release APK:
```bash
cordova build android --release
```

## Project Structure

```
modal-elo/
├── config.xml              # Cordova configuration
├── package.json            # Node.js dependencies
├── platforms/              # Platform-specific code
├── plugins/                # Cordova plugins
└── www/                    # Web assets
    ├── css/
    │   ├── app.css
    │   └── bootstrap.min.css
    ├── img/                # Images and icons
    ├── js/
    │   ├── app.js          # Main application logic
    │   ├── app-cordova.js  # Cordova-specific code
    │   └── ...             # Other JS libraries
    ├── svg/                # SVG assets
    ├── template/           # Mustache templates
    └── index.html          # Main HTML file
```

## Plugins

- **cordova-plugin-camera**: For camera functionality
- **cordova-plugin-file**: For file system access

## Contributing

This project was developed as part of the INF471T course at CSC_41M03_EP. Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Authors

- Apache Cordova Team (base template)
- [Your Name] - Custom development

## Acknowledgments

- Elo rating system by Arpad Elo
- Bootstrap, jQuery, and other open-source libraries used in this project</content>
<parameter name="filePath">c:\Users\Khalid\Desktop\X\2A\P1\CSC_41M03_EP - Modal - Tablettes et Smartphones\INF471T\workspace\modal-elo\README.md