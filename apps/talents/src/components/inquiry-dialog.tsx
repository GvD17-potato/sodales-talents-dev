"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@sodales/ui/button";
import { ArrowRight, X } from "lucide-react";
import { type FormEvent, useState } from "react";

export function InquiryDialog({ talentName }: { talentName: string }) {
  const [previewNotice, setPreviewNotice] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreviewNotice(true);
  }

  return (
    <Dialog.Root onOpenChange={() => setPreviewNotice(false)}>
      <Dialog.Trigger asChild>
        <Button className="w-full sm:w-auto">
          Share project brief <ArrowRight aria-hidden="true" size={17} />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-obsidian/70 data-[state=closed]:opacity-0 data-[state=open]:opacity-100 motion-safe:transition-opacity motion-reduce:transition-none" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[80] max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-graphite/25 bg-ivory p-6 shadow-2xl focus:outline-none sm:p-9">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet">Project inquiry</p>
              <Dialog.Title className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Work with {talentName}
              </Dialog.Title>
              <Dialog.Description className="mt-3 max-w-xl text-sm leading-6 text-graphite/75">
                Your brief is reviewed by the Sodales team. If there is a fit,
                the team will coordinate the next conversation by email.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close inquiry dialog"
              className="grid size-11 shrink-0 place-items-center border border-border hover:border-violet hover:text-violet"
            >
              <X aria-hidden="true" size={19} />
            </Dialog.Close>
          </div>

          {previewNotice ? (
            <div role="alert" className="mt-8 border border-violet/35 bg-violet-soft/45 p-5 text-sm leading-6 text-graphite">
              <strong className="block text-obsidian">Testing preview only</strong>
              Inquiry persistence is not connected yet. No message or personal
              information was sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="inquiry-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em]">
                  Your name
                </label>
                <input id="inquiry-name" name="name" required minLength={2} maxLength={80} className="min-h-12 w-full border border-graphite/30 bg-white px-4 outline-none focus:border-violet" />
              </div>
              <div>
                <label htmlFor="inquiry-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em]">
                  Email
                </label>
                <input id="inquiry-email" name="email" type="email" required maxLength={254} className="min-h-12 w-full border border-graphite/30 bg-white px-4 outline-none focus:border-violet" />
              </div>
              <div>
                <label htmlFor="inquiry-message" className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em]">
                  Project brief
                </label>
                <textarea id="inquiry-message" name="message" required minLength={20} maxLength={2000} rows={6} className="w-full resize-y border border-graphite/30 bg-white px-4 py-3 outline-none focus:border-violet" />
              </div>
              <input aria-hidden="true" tabIndex={-1} autoComplete="off" name="website" className="hidden" />
              <Button type="submit">Review preview submission</Button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
