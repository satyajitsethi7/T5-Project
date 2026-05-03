
# T5-Core NLP Platform

An advanced natural language processing platform powered by the T5 (Text-to-Text Transfer Transformer) model. This platform provides a modern web interface for semantic analysis, text summarization, and translation tasks, backed by a robust Python API.

## Features

- **Semantic Analysis**: Analyze text sentiment and extract key insights using advanced NLP techniques.
- **Text Summarization**: Generate concise summaries of long-form content with configurable length options.
- **Translation**: Translate text between multiple languages using state-of-the-art translation models.
- **Interactive UI**: Sleek, responsive interface with animated backgrounds and smooth transitions.
- **Real-time Processing**: Fast API responses powered by optimized transformer models.

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- Custom Aurora background effects

### Backend
- **FastAPI** for REST API
- **PyTorch** and **Transformers** for T5 model inference
- **NLTK** for sentiment analysis
- **Deep Translator** for language translation
- **LangDetect** for language detection

## Project Structure

```
Frontend/                # React frontend application
├── src/
│   ├── components/      # Reusable UI components
│   ├── lib/             # Utility functions
│   └── styles/          # Global styles
├── public/              # Static assets
└── package.json         # Frontend dependencies

Backend/                 # Python backend service
├── main.py              # FastAPI application
├── model.py             # T5 model utilities
├── requirements.txt     # Python dependencies
└── Dockerfile           # Container configuration
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the API server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`

## Usage

1. Ensure both frontend and backend servers are running.
2. Open the frontend in your browser.
3. Select a task from the tab navigation:
   - **Semantic**: Enter text to analyze sentiment
   - **Summarize**: Input long text and choose summary length
   - **Translate**: Provide text and select target language
4. Click "Process" to get results.

## API Endpoints

The backend provides the following endpoints:

- `POST /process`: Process NLP tasks
  - Body: `{"task": "sentiment|translate|summarize|qa", "text": "input text", "length": "small|medium|big"}`

## Development

### Building for Production
```bash
# Frontend
npm run build

# Backend (using Docker)
docker build -t nlp-service .
docker run -p 8000:8000 nlp-service
```


### Testing
```bash
# Frontend
npm run test

# Backend
pytest  # If tests are added
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- T5 model by Google Research
- UI design inspired by modern NLP platforms
- Icons from Lucide React
  