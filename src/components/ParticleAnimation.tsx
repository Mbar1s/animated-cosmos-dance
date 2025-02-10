
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  originalX: number;
  originalY: number;
  originalZ: number;
}

const ParticleAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const isMouseMoving = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, `
      attribute vec3 position;
      uniform mat4 matrix;
      varying float depth;
      
      void main() {
        vec4 pos = matrix * vec4(position, 1.0);
        depth = pos.z;
        gl_Position = pos;
        gl_PointSize = max(1.0, 20.0 * (1.0 - depth));
      }
    `);
    gl.compileShader(vertexShader);

    // Fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, `
      precision mediump float;
      varying float depth;
      
      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        if (dist > 0.5) discard;
        
        float alpha = 1.0 - depth;
        vec3 color = mix(
          vec3(0.61, 0.53, 0.96),  // Light purple
          vec3(0.10, 0.12, 0.17),  // Dark purple
          depth
        );
        gl_FragColor = vec4(color, alpha * smoothstep(0.5, 0.0, dist));
      }
    `);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Initialize particles
    const numParticles = 1000;
    const positions = new Float32Array(numParticles * 3);
    particles.current = [];

    for (let i = 0; i < numParticles; i++) {
      const particle: Particle = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: Math.random() * 2 - 1,
        vx: 0,
        vy: 0,
        vz: 0,
        originalX: 0,
        originalY: 0,
        originalZ: 0
      };
      particle.originalX = particle.x;
      particle.originalY = particle.y;
      particle.originalZ = particle.z;
      particles.current.push(particle);
      
      positions[i * 3] = particle.x;
      positions[i * 3 + 1] = particle.y;
      positions[i * 3 + 2] = particle.z;
    }

    // Create and bind buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

    // Get attribute location
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    // Get uniform location
    const matrixLocation = gl.getUniformLocation(program, 'matrix');

    // Animation state
    let animationFrameId: number;
    let time = 0;

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse handlers
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(event.clientY / window.innerHeight) * 2 + 1;
      isMouseMoving.current = true;
      setTimeout(() => {
        isMouseMoving.current = false;
      }, 100);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      time += 0.001;

      // Update particles
      for (let i = 0; i < particles.current.length; i++) {
        const particle = particles.current[i];
        
        // Add mouse influence
        if (isMouseMoving.current) {
          const dx = mouseX.current - particle.x;
          const dy = mouseY.current - particle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = Math.max(0, 1 - dist) * 0.01;
          particle.vx += dx * force;
          particle.vy += dy * force;
        }

        // Add noise movement
        particle.vx += (Math.sin(time + particle.originalX * 5) * 0.0002);
        particle.vy += (Math.cos(time + particle.originalY * 5) * 0.0002);
        particle.vz += (Math.sin(time + particle.originalZ * 5) * 0.0002);

        // Return to original position
        const returnForce = 0.01;
        particle.vx += (particle.originalX - particle.x) * returnForce;
        particle.vy += (particle.originalY - particle.y) * returnForce;
        particle.vz += (particle.originalZ - particle.z) * returnForce;

        // Apply velocity with damping
        const damping = 0.95;
        particle.vx *= damping;
        particle.vy *= damping;
        particle.vz *= damping;

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;

        // Update position buffer
        positions[i * 3] = particle.x;
        positions[i * 3 + 1] = particle.y;
        positions[i * 3 + 2] = particle.z;
      }

      gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);

      // Clear and set perspective matrix
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const aspect = canvas.width / canvas.height;
      const matrix = new Float32Array([
        1/aspect, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

      // Draw particles
      gl.drawArrays(gl.POINTS, 0, numParticles);

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default ParticleAnimation;
