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
  const isMouseDown = useRef(false);
  const circleRadius = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });

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
    const numParticles = 300;
    particles.current = [];

    for (let i = 0; i < numParticles; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2 - 1,
        vy: 1 + Math.random() * 5,
        character: matrixChars[Math.floor(Math.random() * matrixChars.length)],
        opacity: Math.random()
      });
    }

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = event.clientX;
      mouseY.current = event.clientY;
      if (isMouseDown.current) {
        lastMousePos.current = { x: event.clientX, y: event.clientY };
      }
    };

    // Mouse down/up handlers
    const handleMouseDown = (event: MouseEvent) => {
      isMouseDown.current = true;
      lastMousePos.current = { x: event.clientX, y: event.clientY };
      circleRadius.current = 0;
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
      circleRadius.current = 0;
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
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      // Update gradient background - now using black to green
      gradientHue.current = (gradientHue.current + 0.1) % 360;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `rgba(0, 20, 0, 0.1)`);
      gradient.addColorStop(1, `rgba(0, ${Math.sin(gradientHue.current * 0.01) * 30 + 40}, 0, 0.1)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Handle mouse hold effect
      if (isMouseDown.current) {
        circleRadius.current = Math.min(circleRadius.current + 5, 300);
        const { x, y } = lastMousePos.current;

        particles.current.forEach(particle => {
          const dx = x - particle.x;
          const dy = y - particle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < circleRadius.current) {
            const angle = Math.atan2(dy, dx);
            const force = (circleRadius.current - dist) / circleRadius.current;
            particle.x += Math.cos(angle) * force * 10;
            particle.vy = Math.max(1, particle.vy + force * 2);
            particle.opacity = Math.min(1, particle.opacity + 0.1);
          }
        });
      }

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

        // Keep particles within canvas bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));

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
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default ParticleAnimation;
