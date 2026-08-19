export const MyTabAmbientBg: React.FC = () => (
  <div className="fixed inset-0 z-[-1] bg-mt-background overflow-hidden pointer-events-none">
    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-mt-primary/10 blur-[120px] mix-blend-screen" />
    <div className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[70%] rounded-full bg-mt-liquid-mint/5 blur-[150px] mix-blend-screen" />
    <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-mt-surface-tint/10 blur-[100px] mix-blend-screen" />
  </div>
);
