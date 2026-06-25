
type Props = {
  current: number;
  total: number;
};

export default function ProfileProgress({ current, total }: Props) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="mb-8">
      <div className="mb-2 text-sm font-medium">
        Question {current} of {total}
      </div>
      <div className="h-3 rounded-full bg-gray-200">
        <div
          className="h-3 rounded-full bg-indigo-600"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
