import Link from "next/link";

export const metadata = {
  title: "Donate — thealmost",
  description: "Support odd little experiments.",
};

export default function DonatePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 text-center">

        {/* Back to home */}
        <div className="text-left">
          <Link
            href="/"
            className="text-sm text-neutral-400 hover:text-neutral-900 transition"
          >
            ← Back to home
          </Link>
        </div>

        <h1 className="text-2xl font-semibold">Support the project</h1>
        <p className="text-sm text-neutral-500">
          If you find this interesting, you can support it.
        </p>

        <div className="space-y-4 text-left">
          <div>
            <p className="text-xs text-neutral-400 mb-1">Bitcoin</p>
            <p className="font-mono text-xs break-all">
              bc1qt32v87pqnlvq8kdvm6dw97k3f797gg55p7kafv
            </p>
          </div>

          <div>
            <p className="text-xs text-neutral-400 mb-1">Ethereum</p>
            <p className="font-mono text-xs break-all">
              0x87e15ba95bff7d256148fd7338e6bf44c1e3d819
            </p>
          </div>

          <div>
            <p className="text-xs text-neutral-400 mb-1">TRON</p>
            <p className="font-mono text-xs break-all">
              TEAoiZda7Js8bmEjgiPCJrAGwkkKoCe43P
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-400 pt-6">
          No promises. No perks. Just appreciation.
        </p>
      </div>
    </main>
  );
}
