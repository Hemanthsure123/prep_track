import { z } from "zod";
import { subTopicEntryCreateSchema } from "./sub-topic-entry";

export const topicCoverageCreateSchema = z.object({
  topicAreaId: z.string().min(1, "Topic area is required."),
  subTopicCount: z.number().int().min(0, "Count cannot be negative.").max(50, "At most 50 sub-topics per topic area."),
  orderIndex: z.number().int().min(0),
  entries: z.array(subTopicEntryCreateSchema),
}).refine(
  (data) => data.entries.length === data.subTopicCount,
  {
    message: "The number of sub-topic entries must equal the specified sub-topic count.",
    path: ["subTopicCount"],
  }
);

export type TopicCoverageCreate = z.infer<typeof topicCoverageCreateSchema>;
