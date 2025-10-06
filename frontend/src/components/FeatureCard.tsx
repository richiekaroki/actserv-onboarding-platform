// frontend/src/components/FeatureCard.tsx
interface FeatureCardProps {
  emoji: string;
  color: string;
  title: string;
  description: string;
}

export default function FeatureCard({
  emoji,
  color,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div
      className={`
        group bg-white p-8 rounded-2xl border border-gray-100 
        shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300
        text-left cursor-default
      `}
    >
      <div
        className={`${color} text-3xl mb-4 transition-transform duration-300 group-hover:scale-110`}
      >
        {emoji}
      </div>
      <h3 className="font-semibold text-xl mb-3 text-gray-800 group-hover:text-gray-900">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">
        {description}
      </p>
    </div>
  );
}
