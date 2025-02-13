
import ParticleAnimation from "../components/ParticleAnimation";
import { useEffect, useState, useCallback } from "react";
import { useIsMobile } from "../hooks/use-mobile";

const Index = () => {
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [typedText, setTypedText] = useState("");
  const isMobile = useIsMobile();
  const title = "Enter the Matrix";
  const text = "Type to create falling characters, touch anywhere for effects";

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key.length === 1) { // Only handle printable characters
      setTypedText(prev => prev + e.key);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    let titleIndex = 0;
    let textIndex = 0;
    let titleInterval: NodeJS.Timeout;
    let textInterval: NodeJS.Timeout;

    // Type out title
    titleInterval = setInterval(() => {
      if (titleIndex <= title.length) {
        setDisplayedTitle(title.slice(0, titleIndex));
        titleIndex++;
      } else {
        clearInterval(titleInterval);
        // Start typing text after title is complete
        textInterval = setInterval(() => {
          if (textIndex <= text.length) {
            setDisplayedText(text.slice(0, textIndex));
            textIndex++;
          } else {
            clearInterval(textInterval);
          }
        }, 50);
      }
    }, 100);

    return () => {
      clearInterval(titleInterval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <>
      <ParticleAnimation typedText={typedText} setTypedText={setTypedText} />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center content fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-green-400">
            {displayedTitle}<span className="animate-pulse">|</span>
          </h1>
          <p className="text-xl md:text-2xl text-green-300 max-w-lg mx-auto">
            {displayedText}<span className={`${displayedTitle.length === title.length ? "animate-pulse" : "hidden"}`}>|</span>
          </p>
          {isMobile && (
            <input 
              type="text" 
              className="mt-4 bg-transparent border border-green-400 rounded px-4 py-2 text-green-400 focus:outline-none focus:border-green-300"
              placeholder="Type here on mobile..."
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
