import { PrismaClient, UserRole } from "@prisma/client";
import { createInterviewTree } from "../lib/interview/write";
import { InterviewFullCreate } from "../lib/validations/interview-full";

const prisma = new PrismaClient();

async function main() {
  // Ensure we have a user to associate the interview with
  const email = "hemanthsure3@gmail.com";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, name: "hemanth sure", role: UserRole.ADMIN },
    });
  }

  // Find Google company
  const company = await prisma.company.findUnique({ where: { slug: "google" } });
  if (!company) {
    throw new Error("Google company not found. Please run npm run db:seed first.");
  }

  // Find some topics
  const dsaTopic1 = await prisma.topic.findFirst({ where: { name: "Arrays" } });
  const dsaTopic2 = await prisma.topic.findFirst({ where: { name: "Dynamic Programming" } });

  const payload: InterviewFullCreate = {
    company: { mode: "existing", companyId: company.id },
    interview: {
      role: "Software Engineer Intern",
      roleLevelId: "",
      roleLevelName: "Intern",
      year: 2025,
      totalSelected: 5,
      biggestTip: "Write clean code, name variables descriptively, and talk through your thoughts constantly. Google interviewers care deeply about *how* you solve problems and how well you take hints, not just getting the correct code instantly.",
    },
    rounds: [
      {
        roundNumber: 1,
        roundName: "Technical Round 1: Coding & DSA",
        roundType: "TECHNICAL_1",
        durationMinutes: 45,
        mode: "ONLINE",
        numInterviewers: 1,
        interviewStyle: "Collaborative and structured. The interviewer asked me to open a Google Doc and write clean code without syntax highlighting.",
        outcome: "CLEARED",
        keyLearnings: "Ensure you dry-run your code with basic and edge cases manually. Catching your own bugs before the interviewer does is a massive positive signal.",
        questions: [
          {
            orderIndex: 0,
            title: "Longest Subarray with Sum K",
            statement: "Given an array of integers and an integer `K`, find the length of the longest subarray that sums to exactly `K`. The array can contain both positive and negative integers.\n\n### Examples\n```\nInput: arr = [10, 5, 2, 7, 1, 9], K = 15\nOutput: 4\nExplanation: The subarray [5, 2, 7, 1] sums to 15.\n```",
            category: "DSA",
            difficulty: "MEDIUM",
            approach: "We can use a hash map to store the running prefix sums and their earliest occurrences. As we iterate, if `prefixSum - K` exists in the map, we update our max length with `currentIndex - earliestIndex`.\n\n```typescript\nfunction longestSubarrayWithSumK(arr: number[], K: number): number {\n  const map = new Map<number, number>();\n  let maxLen = 0;\n  let sum = 0;\n\n  for (let i = 0; i < arr.length; i++) {\n    sum += arr[i];\n    if (sum === K) {\n      maxLen = i + 1;\n    }\n    if (map.has(sum - K)) {\n      maxLen = Math.max(maxLen, i - map.get(sum - K)!);\n    }\n    if (!map.has(sum)) {\n      map.set(sum, i);\n    }\n  }\n  return maxLen;\n}\n```",
            timeGivenMin: 40,
            timeTakenMin: 25,
            solvedStatus: "SOLVED",
            followUps: ["Can we solve this in O(1) space if the array contains only positive integers?"],
            referenceUrl: "https://leetcode.com/problems/subarray-sum-equals-k/",
            topicIds: dsaTopic1 ? [dsaTopic1.id] : [],
          },
        ],
      },
      {
        roundNumber: 2,
        roundName: "Technical Round 2: Coding & Algorithms",
        roundType: "TECHNICAL_2",
        durationMinutes: 45,
        mode: "ONLINE",
        numInterviewers: 1,
        interviewStyle: "Very friendly. First 5 minutes were introduction, then we jumped straight into the coding problem. The interviewer gave a hint when I was stuck on the optimization step.",
        outcome: "CLEARED",
        keyLearnings: "Don't jump straight into coding. Start with a brute-force approach, state its time/space complexity, and then discuss optimizations. It establishes a good rapport.",
        questions: [
          {
            orderIndex: 0,
            title: "Maximum Path Sum in Binary Tree",
            statement: "Given a non-empty binary tree, find the maximum path sum. A path is defined as any sequence of nodes from some starting node to any node in the tree along the parent-child connections. The path must contain at least one node and does not need to go through the root.",
            category: "DSA",
            difficulty: "HARD",
            approach: "We use a recursive helper function `maxGain(node)` which computes the maximum path sum that can be extended from `node` to its parent. At each node, we also calculate the maximum path sum passing *through* that node (left gain + right gain + node value) and update a global maximum.\n\n```typescript\nclass TreeNode {\n  val: number;\n  left: TreeNode | null = null;\n  right: TreeNode | null = null;\n}\n\nlet maxSum = -Infinity;\nfunction maxPathSum(root: TreeNode | null): number {\n  maxSum = -Infinity;\n  gain(root);\n  return maxSum;\n}\n\nfunction gain(node: TreeNode | null): number {\n  if (!node) return 0;\n  \n  const leftGain = Math.max(gain(node.left), 0);\n  const rightGain = Math.max(gain(node.right), 0);\n  \n  const currentMax = node.val + leftGain + rightGain;\n  maxSum = Math.max(maxSum, currentMax);\n  \n  return node.val + Math.max(leftGain, rightGain);\n}\n```",
            timeGivenMin: 45,
            timeTakenMin: 35,
            solvedStatus: "SOLVED",
            followUps: ["What if we also want to return the nodes that form the maximum path?"],
            referenceUrl: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
            topicIds: dsaTopic2 ? [dsaTopic2.id] : [],
          },
        ],
      },
    ],
    assets: [
      {
        scope: "interview",
        roundIndex: null,
        kind: "prep_pdf",
        path: null,
        url: "https://mzcbcygbjdlrixzrlorw.supabase.co/storage/v1/object/public/assets/interview-prep-guide.pdf",
        label: "Google Tech Preparation Guide",
      },
    ],
  };

  console.log("Seeding real interview...");
  const created = await prisma.$transaction((tx) =>
    createInterviewTree(tx, user.id, payload),
  );

  console.log("Successfully seeded real interview with ID:", created.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
