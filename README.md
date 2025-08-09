# LeetCode Gen Z Solver

A Chrome extension that helps you solve LeetCode problems with Gen Z style explanations using the Gemini API.

## Features

- 🚀 Get solutions to LeetCode problems in multiple programming languages
- 🧠 Dynamic solution generation for any LeetCode problem
- 💬 Chat with the AI about the problem and solution
- 🎨 Modern React-based UI with syntax highlighting
- 🔑 Easily configure your Gemini API key

## Installation

### Development Mode

1. Clone this repository
   ```
   git clone https://github.com/yourusername/leetcode-gen-z-solver.git
   cd leetcode-gen-z-solver
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Build the extension
   ```
   npm run build
   ```

4. Load the extension in Chrome
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `dist` folder from this project

### Usage

1. Navigate to any LeetCode problem page
2. Click on the LeetCode Gen Z Solver extension icon in your browser toolbar
3. Add your Gemini API key in the Settings tab (you can get one from [Google AI Studio](https://aistudio.google.com/app/apikey))
4. Select your preferred programming language
5. Get the solution and explanation in Gen Z style!

### Dynamic Solution Generation

The extension now features dynamic solution generation for any LeetCode problem:

1. The extension automatically detects the problem details from the LeetCode page
2. It sends the problem information to the Gemini API
3. The API generates a solution in your selected programming language
4. The solution includes:
   - A Gen Z style explanation with emojis and casual language
   - Clean, well-commented code
   - Time and space complexity analysis

You can also try our demo page to see how it works:
```
http://localhost:8000/dynamic_solution_test.html
```

## Development

- Start the development server with hot reloading:
  ```
  npm start
  ```

- The extension will be built to the `dist` folder

## Technologies Used

- React.js
- react-syntax-highlighter
- Webpack
- Chrome Extension API
- Gemini API

## License

MIT