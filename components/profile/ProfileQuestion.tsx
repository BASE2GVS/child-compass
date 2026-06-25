
type Props = {
  label: string;
};

export default function ProfileQuestion({ label }: Props) {
  return (
    <div className="mb-5">
      <label className="block mb-2 font-medium">{label}</label>
      <input
        className="w-full rounded-2xl border p-3"
        placeholder="Type your answer..."
      />
    </div>
  );
}
