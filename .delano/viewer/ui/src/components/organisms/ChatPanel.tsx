import { type Chat, useChat } from "@ai-sdk/react"
import { ArrowUpIcon, ClipboardIcon, MessageSquareIcon, XIcon } from "lucide-react"
import { type FormEvent, useMemo, useState } from "react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { messageFromError } from "@/lib/api"
import { annotationLine } from "@/lib/domain/annotations"
import type { AnnotationChatMessage } from "@/lib/domain/chat"
import type { Annotation, ViewerDoc } from "@/lib/domain/types"

function messageText(message: AnnotationChatMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

function messageAttachments(message: AnnotationChatMessage) {
  return message.metadata?.attachments ?? []
}

export function ChatPanel({
  doc,
  chat,
  annotations,
  selectedIds,
  onToggleSelected,
}: {
  doc: ViewerDoc
  chat: Chat<AnnotationChatMessage>
  annotations: Annotation[]
  selectedIds: string[]
  onToggleSelected: (id: string) => void
}) {
  const [input, setInput] = useState("")
  const [submitError, setSubmitError] = useState("")
  const { messages, sendMessage, status, error, clearError } =
    useChat<AnnotationChatMessage>({
      chat,
      experimental_throttle: 50,
    })
  const busy = status === "submitted" || status === "streaming"

  const selectedAnnotations = useMemo(() => {
    if (!selectedIds.length) return []
    const idSet = new Set(selectedIds)
    return annotations.filter((annotation) => idSet.has(annotation.id))
  }, [annotations, selectedIds])

  async function send(event: FormEvent) {
    event.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    const attachments = selectedAnnotations
    clearError()
    setSubmitError("")
    setInput("")
    try {
      await sendMessage(
        {
          text,
          metadata: {
            attachments,
            attachmentCount: attachments.length,
            sourcePath: doc.path,
          },
        },
        {
          body: {
            sourcePath: doc.path,
            annotations: attachments,
            contextProfile: "implementation",
          },
        }
      )
    } catch (err) {
      setInput(text)
      setSubmitError(messageFromError(err))
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border bg-muted/15">
        <MessageScrollerProvider autoScroll>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="gap-4 p-3">
                {!messages.length && (
                  <MessageScrollerItem messageId="empty">
                    <Marker>
                      <MarkerIcon>
                        <MessageSquareIcon />
                      </MarkerIcon>
                      <MarkerContent>
                        Ask about this document. Selected annotations are attached to your message.
                      </MarkerContent>
                    </Marker>
                  </MessageScrollerItem>
                )}
                {messages.map((message) => {
                  const attachments = messageAttachments(message)
                  const text = messageText(message)
                  const streaming = message.parts.some(
                    (part) => part.type === "text" && part.state === "streaming"
                  )
                  const isUser = message.role === "user"
                  return (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={isUser}
                    >
                      <Message align={isUser ? "end" : "start"}>
                        <MessageContent>
                          <MessageHeader>
                            {isUser ? "You" : "Codex"}
                          </MessageHeader>
                          <Bubble
                            align={isUser ? "end" : "start"}
                            variant={isUser ? "default" : "secondary"}
                          >
                            <BubbleContent className="whitespace-pre-wrap">
                              {text}
                              {streaming && (
                                <span className="shimmer"> thinking</span>
                              )}
                            </BubbleContent>
                          </Bubble>
                          {!!attachments.length && (
                            <AttachmentGroup>
                              {attachments.map((annotation) => (
                                <Attachment
                                  key={annotation.id}
                                  size="xs"
                                  state="done"
                                >
                                  <AttachmentMedia variant="icon">
                                    <ClipboardIcon />
                                  </AttachmentMedia>
                                  <AttachmentContent>
                                    <AttachmentTitle>
                                      {annotation.type}
                                    </AttachmentTitle>
                                    <AttachmentDescription>
                                      {annotationLine(annotation)}
                                    </AttachmentDescription>
                                  </AttachmentContent>
                                </Attachment>
                              ))}
                            </AttachmentGroup>
                          )}
                          {!!attachments.length && (
                            <MessageFooter>
                              {attachments.length} attachment{attachments.length === 1 ? "" : "s"}
                            </MessageFooter>
                          )}
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  )
                })}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
      {(error || submitError) && (
        <div className="text-sm text-destructive">
          {error?.message ?? submitError}
        </div>
      )}
      {!!selectedAnnotations.length && (
        <AttachmentGroup>
          {selectedAnnotations.map((annotation) => (
            <Attachment key={annotation.id} size="xs" state="idle">
              <AttachmentMedia variant="icon">
                <ClipboardIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{annotation.type}</AttachmentTitle>
                <AttachmentDescription>{annotationLine(annotation)}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  aria-label="Remove attachment"
                  onClick={() => onToggleSelected(annotation.id)}
                >
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          ))}
        </AttachmentGroup>
      )}
      <form onSubmit={send}>
        <InputGroup>
          <InputGroupTextarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder="Ask Codex about this document..."
            rows={2}
            className="min-h-16"
          />
          <InputGroupAddon align="block-end">
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              disabled={busy || !input.trim()}
            >
              <ArrowUpIcon />
              <span className="sr-only">Send</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  )
}
