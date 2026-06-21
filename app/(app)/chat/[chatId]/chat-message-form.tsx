"use client";

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
      className="sticky bottom-0 z-20 -mx-1 mt-3 border-t border-[#e6ded0] bg-[#fffaf3]/95 px-4 pb-3 pt-3 shadow-[0_-12px_30px_rgba(74,59,42,0.10)] backdrop-blur lg:static lg:mx-0 lg:mt-4 lg:rounded-[1.75rem] lg:border lg:p-3 lg:shadow-[0_14px_44px_rgba(74,59,42,0.08)]"
    >
      <input type="hidden" name="chatId" value={chatId} />
      <label
        htmlFor="message"
        className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
      >
        Message {otherName}
      </label>
      <textarea
        id="message"
        name="body"
        required
        rows={2}
        maxLength={1000}
        placeholder="Keep it kind, specific, and easy to reply to."
        className="mt-2 w-full resize-none rounded-[1.25rem] border border-[#eadfce] bg-background/75 px-4 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground focus:border-accent"
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <p className="text-xs leading-5 text-muted-foreground">
          Clear, warm, and easy to reply to is enough.
        </p>
        <button
          type="submit"
          className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm"
        >
          Send message
        </button>
      </div>
    </form>
  );
}
