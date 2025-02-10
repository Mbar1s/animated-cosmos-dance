
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
  const gradientHue = useRef(0);

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
    const numParticles = 300; // Increased number of particles
    particles.current = [];

    for (let i = 0; i < numParticles; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2 - 1,
        vy: 1 + Math.random() * 5, // More varied initial speeds
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
      
      particles.current.forEach(particle => {
        const dx = clickX - particle.x;
        const dy = clickY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 200) {
          particle.vy = Math.max(10, particle.vy * 3);
          particle.opacity = 1;
          particle.character = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      // Update gradient background
      gradientHue.current = (gradientHue.current + 0.1) % 360;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `hsla(${gradientHue.current}, 50%, 10%, 0.1)`);
      gradient.addColorStop(1, `hsla(${(gradientHue.current + 60) % 360}, 50%, 15%, 0.1)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach(particle => {
        // Update particle position with varied speed
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

        // Reset particle if it goes off screen with random new speed
        if (particle.y > canvas.height) {
          particle.y = 0;
          particle.x = Math.random() * canvas.width;
          particle.vy = 1 + Math.random() * 5;
          particle.character = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        }

        // Draw particle with glowing effect
        const glow = particle.vy > 5 ? 0.8 : 0.3;
        ctx.shadowBlur = 5;
        ctx.shadowColor = `rgba(0, 255, 70, ${glow})`;
        ctx.fillStyle = `rgba(0, 255, 70, ${particle.opacity})`;
        ctx.fillText(particle.character, particle.x, particle.y);
        ctx.shadowBlur = 0;

        // Randomly change characters and speeds
        if (Math.random() < 0.01) {
          particle.character = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          particle.vy = Math.max(1, particle.vy + (Math.random() * 2 - 1));
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

