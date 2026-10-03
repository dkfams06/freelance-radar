"use server";

import { revalidatePath } from "next/cache";
import { getProjectById, runDashboardCommand, type DashboardCommand } from "@fr/db";
import { isPlatformName } from "@fr/shared";
import { getDb } from "@/lib/db";

const COMMANDS: DashboardCommand[] = ["backfill", "pause", "resume", "check_new", "retry_errors"];

export interface CommandState {
  message: string | null;
  ok: boolean;
}

export async function crawlerCommand(_prev: CommandState, form: FormData): Promise<CommandState> {
  const platform = String(form.get("platform"));
  const command = String(form.get("command")) as DashboardCommand;
  if (!isPlatformName(platform) || !COMMANDS.includes(command)) return { ok: false, message: "잘못된 요청입니다" };
  try {
    const message = await runDashboardCommand(getDb(), command, platform);
    revalidatePath("/admin/crawler");
    return { ok: true, message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

/** 프로젝트 상세 (모달용). raw 는 크기가 클 수 있어 문자열로 넘긴다. */
export async function loadProject(id: string) {
  const row = await getProjectById(getDb(), id);
  if (!row) return null;
  const {
    raw_payload,
    raw_text,
    raw_metadata,
    raw_html,
    ...normalized
  } = row;
  return {
    normalized,
    raw: JSON.stringify({ raw_metadata, raw_payload }, null, 2),
    rawText: raw_text,
    hasHtml: !!raw_html,
    sourceUrl: row.project_url,
  };
}
