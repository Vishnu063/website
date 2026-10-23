"use client";
import { ArrowRight, Shield } from "lucide-react";
export type Session = {
  user: { id: string; name: string } | null;
  admin: boolean;
};
export type Tell = (message: string) => void;
export const art = (id: string) => `/legacy/assets/portraits/${id}.webp`;
export const signin = (path: string) =>
  "/signin-with-chatgpt?return_to=" + encodeURIComponent(path);
export async function api(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<any> {
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 12000);
  try {
    const r = await fetch("/api/" + path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: data === undefined ? undefined : JSON.stringify(data),
      signal: controller.signal,
    });
    const body: any = await r.json();
    if (!r.ok) throw Error(body.error || "Request failed. Please retry.");
    return body;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError")
      throw Error("The request timed out. Please retry.");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
export function event(name: string) {
  try {
    if (localStorage.getItem("av-analytics") === "yes") {
      const rows = JSON.parse(localStorage.getItem("av-events") || "[]");
      rows.push({ event: name, at: Date.now() });
      localStorage.setItem("av-events", JSON.stringify(rows.slice(-200)));
    }
  } catch {}
}
export function copy(url: string) {
  return (
    navigator.clipboard?.writeText(url) ||
    Promise.reject(Error("Copy is unavailable. Select the link below."))
  );
}
export function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      ✦
    </span>
  );
}
export function Title({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
export function AuthNote({ path = "/arena" }: { path?: string }) {
  return (
    <div className="auth-note">
      <Shield size={20} />
      <span>
        Play and explore freely.{" "}
        <a href={signin(path)} target="_top">
          Sign in with ChatGPT
        </a>{" "}
        to post, vote and save across devices.
      </span>
    </div>
  );
}
export function Failure({
  error,
  retry,
}: {
  error: string;
  retry: () => void;
}) {
  return (
    <div className="empty" role="alert">
      <h2>We couldn’t open this portal.</h2>
      <p>{error}</p>
      <div className="button-row">
        <button className="btn secondary" onClick={retry}>
          Try again
        </button>
        <a className="inline-link" href="/arena">
          Back to arena <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
