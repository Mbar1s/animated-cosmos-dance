
import ParticleAnimation from "../components/ParticleAnimation";

const Index = () => {
  return (
    <>
      <ParticleAnimation />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center content fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-green-400">
            Enter the Matrix
          </h1>
          <p className="text-xl md:text-2xl text-green-300 max-w-lg mx-auto">
            Move your mouse to influence the digital rain, click anywhere for a surge effect
          </p>
        </div>
      </div>
    </>
  );
};

export default Index;
