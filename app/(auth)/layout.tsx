export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4] px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
