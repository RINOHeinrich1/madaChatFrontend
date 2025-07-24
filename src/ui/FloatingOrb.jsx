export default function FloatingOrb({ size, color, delay, duration }) {
  return (
    <div
      className={`absolute rounded-full ${size} ${color} opacity-20 blur-xl animate-pulse`}
      style={{
        animationDelay: delay,
        animationDuration: duration,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  );
}
