// Prints the JSON argument for `convex run indexMigration:importTree`, built from a Payload site's REST API.
//
//   npx convex run indexMigration:importTree "$(node scripts/payload-tree-args.mjs --clerk-id user_x --orphan-topic Travel --dry-run)"
//
// Flags: --clerk-id <id> (required) --orphan-topic <name> (default "Unsorted")
//        --section <scope|art|...> (default "scope") --base-url <url> (default http://localhost:3000) --dry-run
const args = process.argv.slice(2)

function flag(name) {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? undefined : args[i + 1]
}

const clerkId = flag('clerk-id')
if (!clerkId) {
  console.error('Missing --clerk-id')
  process.exit(1)
}

const baseUrl = (flag('base-url') ?? 'http://localhost:3000').replace(/\/$/, '')

async function fetchAll(collection, depth) {
  const res = await fetch(`${baseUrl}/api/${collection}?limit=1000&depth=${depth}`)
  if (!res.ok) throw new Error(`${collection}: HTTP ${res.status}`)

  return (await res.json()).docs
}

const relationId = (value) => (value && typeof value === 'object' ? value.id : value)

const [topics, categories, articles] = await Promise.all([
  fetchAll('topics', 0),
  fetchAll('categories', 0),
  fetchAll('articles', 1),
])

console.log(
  JSON.stringify({
    section: flag('section') ?? 'scope',
    createdByClerkId: clerkId,
    orphanTopicName: flag('orphan-topic') ?? 'Unsorted',
    dryRun: args.includes('--dry-run'),
    topics: topics.map((t) => ({ id: t.id, title: t.title })),
    categories: categories.map((c) => ({
      id: c.id,
      title: c.title,
      ...(c.Topic ? { topicId: relationId(c.Topic) } : {}),
    })),
    articles: articles
      .filter((a) => a.slug)
      .map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        categoryIds: (a.categories ?? []).map(relationId).filter(Boolean),
        ...(a.heroImage?.cloudinary?.public_id
          ? { coverPublicId: a.heroImage.cloudinary.public_id }
          : {}),
      })),
  }),
)
