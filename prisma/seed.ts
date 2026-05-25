import { PrismaClient, QuestionCategory } from "@prisma/client";

import { slugify } from "../lib/slug";

const prisma = new PrismaClient();

const TOPICS: Array<{ name: string; category: QuestionCategory }> = [
  // DSA
  { name: "Arrays", category: "DSA" },
  { name: "Strings", category: "DSA" },
  { name: "Linked List", category: "DSA" },
  { name: "Stack", category: "DSA" },
  { name: "Queue", category: "DSA" },
  { name: "Hashing", category: "DSA" },
  { name: "Trees", category: "DSA" },
  { name: "Binary Search Trees", category: "DSA" },
  { name: "Tries", category: "DSA" },
  { name: "Graphs", category: "DSA" },
  { name: "Dynamic Programming", category: "DSA" },
  { name: "Greedy", category: "DSA" },
  { name: "Backtracking", category: "DSA" },
  { name: "Recursion", category: "DSA" },
  { name: "Sliding Window", category: "DSA" },
  { name: "Two Pointers", category: "DSA" },
  { name: "Binary Search", category: "DSA" },
  { name: "Sorting", category: "DSA" },
  { name: "Heap / Priority Queue", category: "DSA" },
  { name: "Bit Manipulation", category: "DSA" },
  { name: "Math", category: "DSA" },
  { name: "Matrix", category: "DSA" },
  { name: "Intervals", category: "DSA" },

  // FRONTEND
  { name: "React", category: "FRONTEND" },
  { name: "Next.js", category: "FRONTEND" },
  { name: "Vue", category: "FRONTEND" },
  { name: "Angular", category: "FRONTEND" },
  { name: "JavaScript Core", category: "FRONTEND" },
  { name: "TypeScript", category: "FRONTEND" },
  { name: "HTML", category: "FRONTEND" },
  { name: "CSS", category: "FRONTEND" },
  { name: "Tailwind", category: "FRONTEND" },
  { name: "Browser Rendering", category: "FRONTEND" },
  { name: "Performance", category: "FRONTEND" },
  { name: "Accessibility", category: "FRONTEND" },
  { name: "State Management", category: "FRONTEND" },
  { name: "Testing", category: "FRONTEND" },
  { name: "Web APIs", category: "FRONTEND" },
  { name: "Build Tools", category: "FRONTEND" },
  { name: "Cross-Browser Compatibility", category: "FRONTEND" },
  { name: "Responsive Design", category: "FRONTEND" },

  // BACKEND
  { name: "Node.js", category: "BACKEND" },
  { name: "Express", category: "BACKEND" },
  { name: "Spring", category: "BACKEND" },
  { name: "Django", category: "BACKEND" },
  { name: "Flask", category: "BACKEND" },
  { name: "REST APIs", category: "BACKEND" },
  { name: "GraphQL", category: "BACKEND" },
  { name: "Authentication", category: "BACKEND" },
  { name: "Authorization", category: "BACKEND" },
  { name: "Caching", category: "BACKEND" },
  { name: "Message Queues", category: "BACKEND" },
  { name: "Microservices", category: "BACKEND" },
  { name: "Monolith", category: "BACKEND" },
  { name: "API Design", category: "BACKEND" },
  { name: "Rate Limiting", category: "BACKEND" },

  // DBMS
  { name: "SQL", category: "DBMS" },
  { name: "NoSQL", category: "DBMS" },
  { name: "Indexing", category: "DBMS" },
  { name: "Normalization", category: "DBMS" },
  { name: "Transactions", category: "DBMS" },
  { name: "ACID", category: "DBMS" },
  { name: "Joins", category: "DBMS" },
  { name: "Query Optimization", category: "DBMS" },
  { name: "Sharding", category: "DBMS" },
  { name: "Replication", category: "DBMS" },
  { name: "MongoDB", category: "DBMS" },
  { name: "Redis", category: "DBMS" },
  { name: "PostgreSQL", category: "DBMS" },
  { name: "MySQL", category: "DBMS" },

  // OPERATING_SYSTEMS
  { name: "Processes", category: "OPERATING_SYSTEMS" },
  { name: "Threads", category: "OPERATING_SYSTEMS" },
  { name: "Concurrency", category: "OPERATING_SYSTEMS" },
  { name: "Deadlocks", category: "OPERATING_SYSTEMS" },
  { name: "Scheduling", category: "OPERATING_SYSTEMS" },
  { name: "Memory Management", category: "OPERATING_SYSTEMS" },
  { name: "Virtual Memory", category: "OPERATING_SYSTEMS" },
  { name: "Paging", category: "OPERATING_SYSTEMS" },
  { name: "File Systems", category: "OPERATING_SYSTEMS" },
  { name: "IPC", category: "OPERATING_SYSTEMS" },

  // NETWORKING
  { name: "TCP/IP", category: "NETWORKING" },
  { name: "HTTP", category: "NETWORKING" },
  { name: "HTTPS", category: "NETWORKING" },
  { name: "DNS", category: "NETWORKING" },
  { name: "Load Balancing", category: "NETWORKING" },
  { name: "CDN", category: "NETWORKING" },
  { name: "WebSockets", category: "NETWORKING" },
  { name: "OSI Model", category: "NETWORKING" },

  // SYSTEM_DESIGN
  { name: "Scalability", category: "SYSTEM_DESIGN" },
  { name: "Load Balancing", category: "SYSTEM_DESIGN" },
  { name: "Caching Strategy", category: "SYSTEM_DESIGN" },
  { name: "Database Design", category: "SYSTEM_DESIGN" },
  { name: "Microservices Architecture", category: "SYSTEM_DESIGN" },
  { name: "Event-Driven Architecture", category: "SYSTEM_DESIGN" },
  { name: "CAP Theorem", category: "SYSTEM_DESIGN" },
  { name: "Consistency Models", category: "SYSTEM_DESIGN" },
  { name: "Sharding Strategies", category: "SYSTEM_DESIGN" },
  { name: "Rate Limiting Design", category: "SYSTEM_DESIGN" },
  { name: "URL Shortener", category: "SYSTEM_DESIGN" },
  { name: "Chat Application", category: "SYSTEM_DESIGN" },
  { name: "News Feed", category: "SYSTEM_DESIGN" },
  { name: "Time Machine / Versioning", category: "SYSTEM_DESIGN" },

  // OOPS
  { name: "Inheritance", category: "OOPS" },
  { name: "Polymorphism", category: "OOPS" },
  { name: "Encapsulation", category: "OOPS" },
  { name: "Abstraction", category: "OOPS" },
  { name: "SOLID Principles", category: "OOPS" },
  { name: "Design Patterns", category: "OOPS" },
  { name: "Composition", category: "OOPS" },
  { name: "Interfaces", category: "OOPS" },

  // CORE_CS
  { name: "Compilers", category: "CORE_CS" },
  { name: "Computer Architecture", category: "CORE_CS" },
  { name: "Number Systems", category: "CORE_CS" },
  { name: "Boolean Logic", category: "CORE_CS" },

  // AI_ML
  { name: "Supervised Learning", category: "AI_ML" },
  { name: "Unsupervised Learning", category: "AI_ML" },
  { name: "Neural Networks", category: "AI_ML" },
  { name: "NLP", category: "AI_ML" },
  { name: "Computer Vision", category: "AI_ML" },
  { name: "LLMs", category: "AI_ML" },
  { name: "Prompt Engineering", category: "AI_ML" },
  { name: "Agents", category: "AI_ML" },
  { name: "RAG", category: "AI_ML" },
  { name: "Fine-tuning", category: "AI_ML" },
  { name: "Vector Databases", category: "AI_ML" },

  // APTITUDE
  { name: "Quantitative", category: "APTITUDE" },
  { name: "Logical Reasoning", category: "APTITUDE" },
  { name: "Verbal", category: "APTITUDE" },
  { name: "Data Interpretation", category: "APTITUDE" },

  // BEHAVIORAL
  { name: "Conflict Resolution", category: "BEHAVIORAL" },
  { name: "Leadership", category: "BEHAVIORAL" },
  { name: "Teamwork", category: "BEHAVIORAL" },
  { name: "Failure Story", category: "BEHAVIORAL" },
  { name: "Strengths and Weaknesses", category: "BEHAVIORAL" },

  // LINUX
  { name: "Shell Commands", category: "LINUX" },
  { name: "Bash Scripting", category: "LINUX" },
  { name: "Permissions", category: "LINUX" },
  { name: "Process Management", category: "LINUX" },

  // SCENARIO
  { name: "Debugging Scenario", category: "SCENARIO" },
  { name: "System Failure Scenario", category: "SCENARIO" },
  { name: "User Problem Scenario", category: "SCENARIO" },

  // COMMUNICATION
  { name: "Verbal Clarity", category: "COMMUNICATION" },
  { name: "Written Communication", category: "COMMUNICATION" },
  { name: "Thinking Aloud", category: "COMMUNICATION" },
];

const COMPANIES: Array<{ name: string; slug: string }> = [
  { name: "Google", slug: "google" },
  { name: "Adobe", slug: "adobe" },
  { name: "Samsung", slug: "samsung" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Amazon", slug: "amazon" },
  { name: "Meta", slug: "meta" },
  { name: "Apple", slug: "apple" },
  { name: "Netflix", slug: "netflix" },
  { name: "Atlassian", slug: "atlassian" },
  { name: "Salesforce", slug: "salesforce" },
];

const FLAGS: Array<{ key: string; enabled: boolean; description: string }> = [
  {
    key: "show_candidate_profile_filter",
    enabled: false,
    description: "Expose CGPA/branch/year filter on the student catalog.",
  },
  {
    key: "ai_narrative_insights",
    enabled: false,
    description: "Generate LLM summaries per company.",
  },
  {
    key: "student_bookmarks",
    enabled: true,
    description: "Allow students to bookmark interviews.",
  },
];

function computeTopicSlugs(
  topics: ReadonlyArray<{ name: string; category: QuestionCategory }>,
): Array<{ name: string; category: QuestionCategory; slug: string }> {
  const used = new Set<string>();
  return topics.map((t) => {
    const base = slugify(t.name);
    let slug = base;
    if (used.has(slug)) {
      slug = `${base}-${slugify(t.category)}`;
    }
    if (used.has(slug)) {
      throw new Error(`Slug collision could not be resolved for ${t.name} (${t.category}).`);
    }
    used.add(slug);
    return { ...t, slug };
  });
}

async function seedTopics() {
  const rows = computeTopicSlugs(TOPICS);
  for (const t of rows) {
    await prisma.topic.upsert({
      where: { name_category: { name: t.name, category: t.category } },
      update: { slug: t.slug },
      create: { name: t.name, category: t.category, slug: t.slug },
    });
  }
  return rows.length;
}

async function seedCompanies() {
  for (const c of COMPANIES) {
    await prisma.company.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { name: c.name, slug: c.slug },
    });
  }
  return COMPANIES.length;
}

async function seedFlags() {
  for (const f of FLAGS) {
    await prisma.featureFlag.upsert({
      where: { key: f.key },
      update: { description: f.description },
      create: { key: f.key, enabled: f.enabled, description: f.description },
    });
  }
  return FLAGS.length;
}

async function main() {
  const [topics, companies, flags] = await Promise.all([
    seedTopics(),
    seedCompanies(),
    seedFlags(),
  ]);

  process.stdout.write(
    `Seeded ${topics} topics, ${companies} companies, ${flags} feature flags.\n`,
  );
}

main()
  .catch((err) => {
    process.stderr.write(`Seed failed: ${String(err)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
