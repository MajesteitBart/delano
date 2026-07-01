import type { UIMessage } from "ai"

import type { Annotation } from "@/lib/domain/types"

export type AnnotationChatMetadata = {
  attachments?: Annotation[]
  attachmentCount?: number
  sourcePath?: string
}

export type AnnotationChatMessage = UIMessage<AnnotationChatMetadata>
