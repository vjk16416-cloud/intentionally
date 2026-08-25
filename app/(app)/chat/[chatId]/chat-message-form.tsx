"use client";

import { CHAT_MESSAGE_MAX_LENGTH } from "@/lib/chat/validation";

export function ChatMessageForm({
  chatId,
  otherName,
  action,
}: {
  chatId: string;
  otherName: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form
      action={action}
      className="sticky bottom-0 z-20 -mx-1 mt-3 border-t border-[#FFF8EC]/10 bg-[#071411]/92 px-4 pb-3 pt-3 shadow-[0_-12px_30px_rgba(0,0,0,0.34)] backdrop-blur lg:static lg:mx-0 lg:mt-4 lg:rounded-[1.75rem] lg:border lg:bg-[#0D1714]/82 lg:p-3 lg:shadow-[0_18px_58px_rgba(0,0,0,0.28)]"
    >
      <input type="hidden" name="chatId" value={chatId} />
      <label
        htmlFor="message"
        className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#F3A17F]"
      >
        Message {otherName}
      </label>
      <textarea
        id="message"
        name="body"
        required
        rows={2}
        maxLength={CHAT_MESSAGE_MAX_LENGTH}
        placeholder="Keep it kind, specific, and easy to reply to."
        className="mt-2 w-full resize-none rounded-[1.25rem] border border-[#FFF8EC]/12 bg-[#FFF8EC]/8 px-4 py-3 text-sm leading-6 text-[#FFF8EC] outline-none placeholder:text-[#FFF8EC]/44 focus:border-[#F3A17F] focus:ring-4 focus:ring-[#F3A17F]/12"
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <p className="text-xs leading-5 text-[#FFF8EC]/58">
          Clear, warm, and easy to reply to is enough.
        </p>
        <button
          type="submit"
          className="rounded-2xl bg-[#F3A17F] px-5 py-3 text-sm font-semibold text-[#13251F] shadow-[0_14px_34px_rgba(243,161,127,0.22)] transition hover:bg-[#EA9270]"
        >
          Send message
        </button>
      </div>
    </form>
  );
}
