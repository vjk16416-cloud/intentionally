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
      className="mt-4 rounded-[1.5rem] border bg-background p-3 shadow-sm"
    >
      <input type="hidden" name="chatId" value={chatId} />
      <label htmlFor="message" className="sr-only">
        Message
      </label>
      <textarea
        id="message"
        name="body"
        required
        rows={2}
        maxLength={1000}
        placeholder={`Message ${otherName}`}
        className="w-full resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        className="mt-2 w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
      >
        Send
      </button>
    </form>
  );
}
