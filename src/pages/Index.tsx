
import ParticleAnimation from "../components/ParticleAnimation";
import { useEffect, useState } from "react";

const Index = () => {
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const title = "Enter the Matrix";
  const text = "Move your mouse to influence the digital rain, click anywhere for a surge effect";

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
      <ParticleAnimation />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center content fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-green-400">
            {displayedTitle}<span className="animate-pulse">|</span>
          </h1>
          <p className="text-xl md:text-2xl text-green-300 max-w-lg mx-auto">
            {displayedText}<span className={`${displayedTitle.length === title.length ? "animate-pulse" : "hidden"}`}>|</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Index;
