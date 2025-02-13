import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vy: number;
  character: string;
  opacity: number;
  size?: number;
  createdAt?: number;
  isTyped?: boolean;
  fixedX?: number;
}

interface ParticleAnimationProps {
  typedText: string;
  setTypedText: (text: string) => void;
}

const ParticleAnimation = ({ typedText, setTypedText }: ParticleAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const gradientHue = useRef(0);
  const isMouseDown = useRef(false);
  const circleRadius = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastTouchPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typedText) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const totalWidth = typedText.length * 40;
      const startX = (canvas.width - totalWidth) / 2;

      const chars = typedText.split('');
      chars.forEach((char, index) => {
        const fixedX = startX + (index * 40);
        particles.current.push({
          x: fixedX,
          y: 0,
          z: Math.random() * 2 - 1,
          vy: 2 + Math.random() * 3,
          character: char,
          opacity: 1,
          size: 40,
          createdAt: Date.now(),
          isTyped: true,
          fixedX: fixedX
        });
      });

      setTypedText('');
      setTimeout(() => {
        particles.current = particles.current.filter(p => !p.createdAt || Date.now() - p.createdAt < 30000);
      }, 30000);
    }
  }, [typedText, setTypedText]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const matrixChars = [
      ...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$@#&',
      ...'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ',
      ...'∞≠∑∫≤≥∏πφ∇∂±×÷∃∀∈∉⊆⊇⊄⊥∥∠⌀∡∢'
    ].join('').split('');
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.font = '15px monospace';
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const numParticles = 300;
    particles.current = [];

    for (let i = 0; i < numParticles; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2 - 1,
        vy: 1 + Math.random() * 5,
        character: matrixChars[Math.floor(Math.random() * matrixChars.length)],
        opacity: Math.random(),
        isTyped: false
      });
    }

    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = event.clientX;
      mouseY.current = event.clientY;
      if (isMouseDown.current) {
        lastMousePos.current = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      isMouseDown.current = true;
      lastMousePos.current = { x: event.clientX, y: event.clientY };
      circleRadius.current = 0;
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
      circleRadius.current = 0;
    };

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

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      isMouseDown.current = true;
      const touch = event.touches[0];
      lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
      circleRadius.current = 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      mouseX.current = touch.clientX;
      mouseY.current = touch.clientY;
      if (isMouseDown.current) {
        lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchEnd = () => {
      isMouseDown.current = false;
      circleRadius.current = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    let animationFrameId: number;
    const animate = () => {
      gradientHue.current = (gradientHue.current + 0.1) % 360;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `rgba(0, 20, 0, 0.1)`);
      gradient.addColorStop(1, `rgba(0, ${Math.sin(gradientHue.current * 0.01) * 30 + 40}, 0, 0.1)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isMouseDown.current) {
        circleRadius.current = Math.min(circleRadius.current + 5, 300);
        const pos = lastTouchPos.current.x !== 0 ? lastTouchPos.current : lastMousePos.current;

        particles.current.forEach(particle => {
          if (!particle.isTyped) {
            const dx = pos.x - particle.x;
            const dy = pos.y - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < circleRadius.current) {
              const angle = Math.atan2(dy, dx);
              const force = (circleRadius.current - dist) / circleRadius.current;
              particle.x += Math.cos(angle) * force * 10;
              particle.vy = Math.max(1, particle.vy + force * 2);
              particle.opacity = Math.min(1, particle.opacity + 0.1);
            }
          }
        });
      }

      particles.current.forEach(particle => {
        particle.y += particle.vy;

        if (particle.isTyped && particle.fixedX !== undefined) {
          particle.x = particle.fixedX;
        } else {
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
        }

        if (particle.y > canvas.height) {
          if (particle.isTyped) {
            particles.current = particles.current.filter(p => p !== particle);
          } else {
            particle.y = 0;
            particle.x = Math.random() * canvas.width;
            particle.vy = 1 + Math.random() * 5;
            particle.character = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          }
        }

        particle.x = Math.max(0, Math.min(canvas.width, particle.x));

        const fontSize = particle.size || 15;
        ctx.font = `${fontSize}px monospace`;
        const glow = particle.vy > 5 ? 0.8 : 0.3;
        ctx.shadowBlur = 5;
        ctx.shadowColor = `rgba(0, 255, 70, ${glow})`;
        ctx.fillStyle = `rgba(0, 255, 70, ${particle.opacity})`;
        ctx.fillText(particle.character, particle.x, particle.y);
        ctx.shadowBlur = 0;

        if (!particle.isTyped && Math.random() < 0.01) {
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
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default ParticleAnimation;
