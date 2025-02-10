
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vy: number;
  character: string;
  opacity: number;
}

const ParticleAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Extended matrix characters including Japanese katakana and special symbols
    const matrixChars = [
      ...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$@#&',
      ...'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ',
      ...'∞≠∑∫≤≥∏πφ∇∂±×÷∃∀∈∉⊆⊇⊄⊥∥∠⌀∡∢'
    ].join('').split('');
    
    // Set up the canvas
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.font = '15px monospace';
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize particles
    const numParticles = 150; // Increased number of particles
    particles.current = [];

    for (let i = 0; i < numParticles; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2 - 1,
        vy: 1 + Math.random() * 3,
        character: matrixChars[Math.floor(Math.random() * matrixChars.length)],
        opacity: Math.random()
      });
    }

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = event.clientX;
      mouseY.current = event.clientY;
    };

    // Click effect
    const handleClick = (event: MouseEvent) => {
      const clickX = event.clientX;
      const clickY = event.clientY;
      
      // Affect particles near the click
      particles.current.forEach(particle => {
        const dx = clickX - particle.x;
        const dy = clickY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 200) { // Click effect radius
          particle.vy = Math.max(10, particle.vy * 3); // Boost speed
          particle.opacity = 1; // Full opacity
          particle.character = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach(particle => {
        // Update particle position
        particle.y += particle.vy;

        // Mouse interaction
        const dx = mouseX.current - particle.x;
        const dy = mouseY.current - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          particle.vy += 0.2;
          particle.opacity = Math.min(1, particle.opacity + 0.05);
        } else {
          particle.vy = Math.max(1, particle.vy * 0.99);
          particle.opacity = Math.max(0.3, particle.opacity - 0.01);
        }

        // Reset particle if it goes off screen
        if (particle.y > canvas.height) {
          particle.y = 0;
          particle.x = Math.random() * canvas.width;
          particle.vy = 1 + Math.random() * 3;
          particle.character = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        }

        // Draw particle with glowing effect
        const glow = particle.vy > 5 ? 0.8 : 0.3; // More glow for faster particles
        ctx.shadowBlur = 5;
        ctx.shadowColor = `rgba(0, 255, 70, ${glow})`;
        ctx.fillStyle = `rgba(0, 255, 70, ${particle.opacity})`;
        ctx.fillText(particle.character, particle.x, particle.y);
        ctx.shadowBlur = 0;

        // Randomly change characters
        if (Math.random() < 0.01) {
          particle.character = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default ParticleAnimation;
