"use client";

import { useActionState } from "react";
import { crawlerCommand, type CommandState } from "../actions";

const BUTTONS = [
  { command: "backfill", label: "백필 시작" },
  { command: "pause", label: "중지" },
  { command: "resume", label: "재개" },
  { command: "check_new", label: "신규 확인" },
] as const;

export function CommandButtons({ platform }: { platform: string }) {
  const [state, action, pending] = useActionState<CommandState, FormData>(crawlerCommand, { ok: true, message: null });
  return (
    <div className="commands">
      <form action={action} className="command-row">
        <input type="hidden" name="platform" value={platform} />
        {BUTTONS.map((b) => (
          <button
            key={b.command}
            type="submit"
            name="command"
            value={b.command}
            disabled={pending}
            className={b.command === "pause" ? "btn btn-ghost" : b.command === "backfill" ? "btn btn-primary" : "btn"}
          >
            {b.label}
          </button>
        ))}
      </form>
      {state.message && <p className={`command-msg ${state.ok ? "" : "error"}`}>{state.message}</p>}
    </div>
  );
}
