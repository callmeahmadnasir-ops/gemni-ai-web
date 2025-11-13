import React, { useState, useCallback, useEffect } from 'react';
import { Sparkles, Download, Wand2 } from 'lucide-react';
import { generateImages } from './services/geminiService';
import { GeneratedImage } from './types';
import Spinner from './components/Spinner';
import WhatsAppPopup from './components/WhatsAppPopup';

// Fix for TypeScript error: "Subsequent property declarations must have the same type" for window.aistudio
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [numImages, setNumImages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState<boolean>(true);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState<boolean>(true);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        if (await window.aistudio.hasSelectedApiKey()) {
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Error checking for API key:", e);
        setError("Could not verify API key status. Please refresh the page.");
      } finally {
        setIsCheckingApiKey(false);
      }
    };
    checkApiKey();
  }, []);

  const handleGenerateClick = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setImages([]);

    try {
      const base64Images = await generateImages(prompt, numImages);
      const newImages = base64Images.map(base64 => ({
        src: `data:image/jpeg;base64,${base64}`,
        prompt: prompt,
      }));
      setImages(newImages);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
       if (errorMessage.includes("API key not valid") || errorMessage.includes("Requested entity was not found")) {
        setError("Your API key is invalid. Please select a valid key to continue.");
        setHasApiKey(false); // Reset key state to prompt re-selection
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, numImages]);
  
  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success and update UI immediately to avoid race conditions.
      setHasApiKey(true);
      setError(null); // Clear previous errors
    } catch (e) {
      console.error("Could not open API key selection:", e);
      setError("Failed to open the API key selection dialog.");
    }
  };


  const handleDownload = (src: string, imagePrompt: string, index: number) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const parts = ['ai-image', timestamp];
    
    if (images.length > 1) {
        parts.push(String(index + 1).padStart(2, '0'));
    }

    const filename = `${parts.join('-')}.jpg`;

    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const imageOptions = Array.from({ length: 4 }, (_, i) => i + 1);

  if (isCheckingApiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }
  
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <Sparkles className="w-12 h-12 text-gray-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to AI Image Generator</h1>
          <p className="text-gray-600 mb-6">
            To start generating images, please select your Google AI API key.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 flex justify-center items-center gap-2"
          >
            Select API Key
          </button>
           {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mt-6 text-left" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-6">
            For information about billing, please visit the{' '}
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">
              Gemini API billing documentation
            </a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center p-4 sm:p-6 md:p-8">
      {showWhatsAppPopup && <WhatsAppPopup onClose={() => setShowWhatsAppPopup(false)} />}
      <main className="w-full max-w-6xl flex flex-col items-center flex-grow">
        <header className="text-center my-8 md:my-12">
          <div className="flex justify-center items-center gap-3">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-gray-800" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-800">
              AI Image Generator
            </h1>
          </div>
        </header>
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-3">Bring Your Imagination to Life</h2>
          <p className="text-base md:text-lg text-gray-600">
            Unleash your creativity. Transform your ideas into stunning, high-quality images with the power of AI. Whether you're a designer, a marketer, or just exploring, our tool brings your vision to life in seconds. Just type a prompt and watch the magic happen.
          </p>
        </div>


        <div className="w-full max-w-3xl mb-12">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A stunning, photorealistic image of a futuristic city at sunset..."
                  className="w-full p-4 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 resize-none h-28 text-base border border-gray-200"
                  rows={3}
                  aria-label="Image prompt"
                />
                <div className="flex flex-col sm:flex-row gap-4 items-center mt-2 p-2">
                    <div className="w-full sm:w-auto flex-grow">
                        <label htmlFor="num-images" className="sr-only">Number of images</label>
                        <select
                        id="num-images"
                        value={numImages}
                        onChange={(e) => setNumImages(parseInt(e.target.value, 10))}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                        {imageOptions.map(num => (
                            <option key={num} value={num}>
                            {num} Image{num > 1 ? 's' : ''}
                            </option>
                        ))}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerateClick}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        <Wand2 className="w-5 h-5" />
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-8 w-full max-w-3xl" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isLoading && <Spinner />}

        {images.length > 0 && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-16">
            {images.map((image, index) => (
              <div
                key={index}
                className="animate-fade-in group bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                style={{ opacity: 0, animationDelay: `${index * 150}ms` }}
              >
                <div className="aspect-square w-full overflow-hidden border-b border-gray-200">
                  <img src={image.src} alt={image.prompt} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                    <span className="font-semibold text-gray-800">Prompt:</span> {image.prompt}
                  </p>
                  <button
                    onClick={() => handleDownload(image.src, image.prompt, index)}
                    className="w-full bg-white text-gray-700 border border-gray-300 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <footer className="w-full text-center py-8">
        <p className="text-sm text-gray-500 animate-fade-in-up">Powered by Google Imagen 4. Designed by Ahmad 🇵🇰.</p>
      </footer>
    </div>
  );
};

export default App;