import Link from "next/link";
import { createClient } from "./actions";

export default function NewClientPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mb-6">
        <Link
          href="/clients"
          className="text-sm text-white/70 underline underline-offset-4"
        >
          ← Back to Clients
        </Link>
      </div>

      <div className="max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-4xl font-bold mb-8">Create Client</h1>

        <form action={createClient} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Chinese Name
              </label>
              <input
                type="text"
                name="chineseName"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder="e.g. 张三"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                English Name
              </label>
              <input
                type="text"
                name="englishName"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder="e.g. San Zhang"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Email</label>
              <input
                type="email"
                name="email"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder="e.g. sanzhang@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Phone</label>
              <input
                type="text"
                name="phone"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder="e.g. +44 7123 456789"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">WeChat</label>
              <input
                type="text"
                name="wechat"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder="e.g. sanzhang_wechat"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                Nationality
              </label>
              <select
                name="nationality"
                defaultValue=""
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
              >
                <option value="" disabled>
                  Select nationality
                </option>
                <option value="Chinese">Chinese</option>
                <option value="British">British</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-white/70 mb-2">Notes</label>
              <textarea
                name="notes"
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder="Client notes..."
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="rounded-lg bg-white text-black px-6 py-3 font-medium"
            >
              Create Client
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
