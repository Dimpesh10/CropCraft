import { FarmCanvas } from './game/components3d/FarmCanvas';
import { HUD } from './components/HUD';

export default function App() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <FarmCanvas />
      <HUD />
    </div>
  );
}
