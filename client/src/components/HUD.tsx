import { DayDisplay } from './DayDisplay';
import { ToolBar } from './ToolBar';
import { InventoryPanel } from './InventoryPanel';
import { AdvisorPanel } from './AdvisorPanel';
import { TutorialGuide } from './TutorialGuide';
import { SdgToast } from './SdgToast';
import { SdgJournal } from './SdgJournal';
import { QuizModal } from './QuizModal';

export function HUD() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <DayDisplay />
      <InventoryPanel />
      <ToolBar />
      <AdvisorPanel />
      <SdgJournal />
      <SdgToast />
      <TutorialGuide />
      <QuizModal />
    </div>
  );
}
