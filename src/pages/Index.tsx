
import ParticleAnimation from "../components/ParticleAnimation";

const Index = () => {
  return (
    <>
      <ParticleAnimation />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center content fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to the Experience
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto">
            Interact with the particles to create your own digital atmosphere
          </p>
        </div>
      </div>
    </>
  );
};

export default Index;
