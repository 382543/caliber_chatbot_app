import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function MedicalCharacter3D() {
  const rightArmRef = useRef();
  const rightHandRef = useRef();
  const leftArmRef = useRef();
  const headRef = useRef();

  // Natural waving animation
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Right arm - stays raised with subtle movement
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = -1.3;
      rightArmRef.current.rotation.x = -0.2 + Math.sin(time * 2.5) * 0.15;
    }
    
    // Hand waving UP AND DOWN naturally
    if (rightHandRef.current) {
      rightHandRef.current.rotation.x = Math.sin(time * 4) * 0.8;
      rightHandRef.current.rotation.z = Math.sin(time * 4) * 0.2;
    }
    
    // Left arm gentle movement
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = Math.sin(time * 1.5) * 0.1 + 0.3;
    }
    
    // Head nodding
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(time * 2) * 0.08;
      headRef.current.position.y = 2.8 + Math.sin(time * 2) * 0.03;
    }
  });

  return (
    <group position={[0, -0.9, 0]}>
      {/* Legs */}
      <mesh position={[-0.2, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.12, 1.2, 12, 20]} />
        <meshStandardMaterial color="#2d3e52" roughness={0.7} />
      </mesh>
      <mesh position={[0.2, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.12, 1.2, 12, 20]} />
        <meshStandardMaterial color="#2d3e52" roughness={0.7} />
      </mesh>

      {/* Shoes */}
      <group position={[-0.2, 0.05, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.12, 0.35]} />
          <meshStandardMaterial color="#1a1f2e" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.1]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#1a1f2e" roughness={0.5} />
        </mesh>
      </group>
      <group position={[0.2, 0.05, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.25, 0.12, 0.35]} />
          <meshStandardMaterial color="#1a1f2e" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.1]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#1a1f2e" roughness={0.5} />
        </mesh>
      </group>

      {/* Body */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <capsuleGeometry args={[0.7, 2.1, 16, 32]} />
        <meshStandardMaterial color="#e8efff" roughness={0.6} />
      </mesh>

      {/* Medical Cross Badge */}
      <mesh position={[0, 2.2, 0.73]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.08, 32]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.2, 0.78]} castShadow>
        <boxGeometry args={[0.07, 0.3, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 2.2, 0.78]} castShadow>
        <boxGeometry args={[0.3, 0.07, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 2.9, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.35, 20]} />
        <meshStandardMaterial color="#ffd4a3" roughness={0.7} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 3.3, 0]}>
        {/* Face */}
        <mesh castShadow>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial color="#ffe8d4" roughness={0.8} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <sphereGeometry args={[0.43, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#2d3748" roughness={0.9} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.14, 0.06, 0.38]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
        <mesh position={[0.14, 0.06, 0.38]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>

        {/* Smile */}
        <mesh position={[0, -0.1, 0.38]} rotation={[-0.3, 0, 0]}>
          <torusGeometry args={[0.12, 0.025, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.39, 0, 0]} rotation={[0, -0.2, 0]} castShadow>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#ffd4a3" roughness={0.8} />
        </mesh>
        <mesh position={[0.39, 0, 0]} rotation={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#ffd4a3" roughness={0.8} />
        </mesh>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.8, 2.5, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.6, 10, 16]} />
          <meshStandardMaterial color="#e8efff" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.7, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#ffe8d4" roughness={0.7} />
        </mesh>
      </group>

      {/* Right Arm - WAVING */}
      <group ref={rightArmRef} position={[0.8, 2.5, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.5, 10, 16]} />
          <meshStandardMaterial color="#e8efff" roughness={0.6} />
        </mesh>
        
        {/* Hand with fingers */}
        <group ref={rightHandRef} position={[0, -0.6, 0]}>
          {/* Palm */}
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.22, 0.1]} />
            <meshStandardMaterial color="#ffe8d4" roughness={0.7} />
          </mesh>
          
          {/* Fingers */}
          <mesh position={[-0.06, 0.15, 0]} castShadow>
            <capsuleGeometry args={[0.018, 0.1, 6, 10]} />
            <meshStandardMaterial color="#ffd4a3" roughness={0.7} />
          </mesh>
          <mesh position={[-0.02, 0.17, 0]} castShadow>
            <capsuleGeometry args={[0.019, 0.12, 6, 10]} />
            <meshStandardMaterial color="#ffd4a3" roughness={0.7} />
          </mesh>
          <mesh position={[0.02, 0.17, 0]} castShadow>
            <capsuleGeometry args={[0.019, 0.11, 6, 10]} />
            <meshStandardMaterial color="#ffd4a3" roughness={0.7} />
          </mesh>
          <mesh position={[0.07, 0.13, 0]} castShadow>
            <capsuleGeometry args={[0.017, 0.09, 6, 10]} />
            <meshStandardMaterial color="#ffd4a3" roughness={0.7} />
          </mesh>
          
          {/* Thumb */}
          <mesh position={[-0.11, -0.03, 0.04]} castShadow rotation={[0, -0.5, -0.5]}>
            <capsuleGeometry args={[0.018, 0.07, 6, 10]} />
            <meshStandardMaterial color="#ffd4a3" roughness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
