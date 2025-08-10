# LeetMate ⚡ - Gen Z Style LeetCode Solver

A Chrome extension that helps you solve LeetCode problems with Gen Z style explanations using the Gemini 2.0 Flash API. Get solutions in multiple programming languages with casual, emoji-filled explanations that make coding fun! 🚀

## ✨ Features

- 🚀 **Dynamic Solution Generation** - Get solutions for any LeetCode problem automatically
- 🧠 **Multi-language Support** - Solutions in Python, JavaScript, Java, C++, and more
- 💬 **AI Chat Interface** - Chat with the AI about problems and solutions
- 🎨 **Modern React UI** - Beautiful, responsive interface with syntax highlighting
- 🔑 **Easy API Setup** - Simple Gemini API key configuration
- ⚡ **Real-time Detection** - Automatically detects LeetCode problem details
- 🎯 **Gen Z Style** - Casual explanations with emojis and relatable language

## 🖼️ Screenshots

### Main Extension Interface
![Main Extension Interface](sampleimages/Screenshot%202025-08-10%20152209.png)

### Chat Tab with AI Assistant
![Chat Tab with AI Assistant](sampleimages/Screenshot%202025-08-10%20152252.png)

### Solution Tab with Code Highlighting
![Solution Tab with Code Highlighting](sampleimages/Screenshot%202025-08-10%20152300.png)

### Settings Configuration
![Settings Configuration](sampleimages/Screenshot%202025-08-10%20153133.png)

## 🚀 Installation

### Development Mode

1. **Clone this repository**
   ```bash
   git clone https://github.com/yourusername/chatbot_for_leetcode.git
   cd chatbot_for_leetcode
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `dist` folder from this project

## 📖 Usage

1. **Navigate to any LeetCode problem page**
2. **Click the LeetMate ⚡ extension icon** in your browser toolbar
3. **Configure your Gemini API key** in the Settings tab
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
4. **Select your preferred programming language**
5. **Get instant solutions** with Gen Z style explanations! 🎉

### Dynamic Solution Generation

The extension automatically:
- 🔍 **Detects problem details** from the LeetCode page
- 📡 **Sends information** to the Gemini 2.0 Flash API
- 💻 **Generates solutions** in your selected language
- 📝 **Provides explanations** with:
  - Gen Z style language and emojis
  - Clean, well-commented code
  - Time and space complexity analysis
  - Step-by-step breakdowns

## 🛠️ Development

### Start Development Server
```bash
npm start
```
The extension will be built to the `dist` folder with hot reloading.

### Build for Production
```bash
npm run build
```

### Test Demo Page
Try our demo page to see the extension in action:
```
http://localhost:8000/dynamic_solution_test.html
```

## 🏗️ Project Structure

```
chatbot_for_leetcode/
├── src/
│   └── popup/
│       ├── components/          # React components
│       │   ├── App.jsx         # Main app component
│       │   ├── ChatTab.jsx     # AI chat interface
│       │   ├── CodeHighlighter.jsx # Syntax highlighting
│       │   ├── Header.jsx      # Extension header
│       │   ├── SettingsTab.jsx # Configuration panel
│       │   └── SolutionTab.jsx # Solution display
│       ├── styles/             # CSS styles
│       └── index.js            # Entry point
├── assets/                     # Extension icons
├── libs/                      # External libraries (Prism.js)
├── manifest.json              # Chrome extension manifest
├── background.js              # Service worker
├── content.js                 # Content script
└── webpack.config.js          # Build configuration
```

## 🛠️ Technologies Used

- **Frontend**: React.js, CSS3
- **Syntax Highlighting**: react-syntax-highlighter, Prism.js
- **Build Tool**: Webpack
- **Chrome Extension API**: Manifest V3
- **AI Integration**: Gemini 2.0 Flash API
- **Styling**: Modern CSS with responsive design

## 🔧 Configuration

### Required Environment Variables
- **Gemini API Key**: Required for AI-powered solutions
  - Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey)
  - Configure in the extension's Settings tab

### Supported Programming Languages
- Python 🐍
- JavaScript/TypeScript 💻
- Java ☕
- C++ ⚡
- C# 🔷
- And more!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI Studio** for providing the Gemini 2.0 Flash API
- **LeetCode** for the problem platform
- **React.js community** for the amazing framework
- **Chrome Extensions team** for the extension platform

---

**Made with ❤️ for the coding community**

*Get ready to slay those LeetCode problems with style! 💅✨*