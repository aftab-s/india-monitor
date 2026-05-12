import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const NEWS_PATH = join(ROOT, "news.json");
const OUT_PATH = join(ROOT, "src", "data", "youtube-live-cache.json");

async function loadLocalEnv() {
  const p = join(ROOT, ".env");
  let txt;
  try {
    txt = await readFile(p, "utf8");
  } catch {
    return;
  }
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

const BASE = "https://www.googleapis.com/youtube/v3";

function isLikelyChannelId(id) {
  return typeof id === "string" && /^UC[\w-]{20,}$/.test(id);
}

async function ytGet(path, params) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key?.trim()) {
    throw new Error("Missing YOUTUBE_API_KEY in environment");
  }
  const u = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  }
  u.searchParams.set("key", key.trim());
  const res = await fetch(u);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText;
    throw new Error(`${path} ${res.status}: ${msg}`);
  }
  return data;
}

/** First live video id for channel, or null */
async function searchLiveVideoId(channelId) {
  const data = await ytGet("/search", {
    part: "snippet",
    channelId,
    type: "video",
    eventType: "live",
    maxResults: 1,
  });
  const id = data?.items?.[0]?.id?.videoId;
  return id || null;
}

/** Up to 50 ids per call */
async function videosList(ids) {
  if (ids.length === 0) return { items: [] };
  const data = await ytGet("/videos", {
    part: "snippet,liveStreamingDetails",
    id: ids.join(","),
  });
  return data;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  await loadLocalEnv();

  if (!process.env.YOUTUBE_API_KEY?.trim()) {
    console.error(
      "Set YOUTUBE_API_KEY (YouTube Data API v3 key from Google Cloud; usually starts with AIza...).",
    );
    process.exit(1);
  }

  const raw = await readFile(NEWS_PATH, "utf8");
  /** @type {Array<Record<string, unknown>>} */
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows)) {
    throw new Error("news.json must be a JSON array");
  }

  const uniqueChannelIds = [
    ...new Set(
      rows
        .map((r) => r.channel_id)
        .filter((id) => typeof id === "string" && isLikelyChannelId(id)),
    ),
  ];

  const invalidRows = rows.filter(
    (r) => typeof r.channel_id === "string" && !isLikelyChannelId(r.channel_id),
  );

  /** @type {Map<string, string | null>} */
  const liveByChannel = new Map();
  for (const cid of uniqueChannelIds) {
    try {
      const vid = await searchLiveVideoId(cid);
      liveByChannel.set(cid, vid);
    } catch (e) {
      console.error(`search live failed for ${cid}:`, e?.message || e);
      liveByChannel.set(cid, null);
    }
    await sleep(150);
  }

  const resolvedIds = new Set();
  for (const row of rows) {
    const cid = row.channel_id;
    if (!isLikelyChannelId(cid)) continue;
    const fromSearch = liveByChannel.get(cid);
    const known = row.known_video_id;
    const vid = fromSearch || (typeof known === "string" ? known : null);
    if (vid) resolvedIds.add(vid);
  }

  const idList = [...resolvedIds];
  /** @type {Map<string, Record<string, unknown>>} */
  const videoById = new Map();
  for (let i = 0; i < idList.length; i += 50) {
    const chunk = idList.slice(i, i + 50);
    try {
      const data = await videosList(chunk);
      for (const item of data.items || []) {
        videoById.set(item.id, item);
      }
    } catch (e) {
      console.error("videos.list batch failed:", e?.message || e);
    }
  }

  const fetchedAt = new Date().toISOString();
  const entries = rows.map((row) => {
    const cid = row.channel_id;
    const badChannel = typeof cid === "string" && !isLikelyChannelId(cid);
    const fromSearch = isLikelyChannelId(cid) ? liveByChannel.get(cid) : null;
    const known = row.known_video_id;
    const resolvedVideoId =
      fromSearch || (typeof known === "string" ? known : null);

    const video = resolvedVideoId ? videoById.get(resolvedVideoId) : null;
    const snippet = video?.snippet;
    const live = video?.liveStreamingDetails;
    const sc = snippet?.liveBroadcastContent;

    return {
      state: row.state,
      region: row.region,
      channel: row.channel,
      channel_id: row.channel_id,
      handle: row.handle,
      resolved_video_id: resolvedVideoId,
      resolved_via: fromSearch
        ? "search.list_live"
        : known
          ? "known_video_id"
          : null,
      snippet_title: snippet?.title ?? null,
      liveBroadcastContent: sc ?? null,
      concurrentViewers: live?.concurrentViewers ?? null,
      actualStartTime: live?.actualStartTime ?? null,
      scheduledStartTime: live?.scheduledStartTime ?? null,
      error: badChannel
        ? "invalid_or_placeholder_channel_id"
        : !resolvedVideoId
          ? "no_live_and_no_known_id"
          : !video
            ? "video_not_found_or_unavailable"
            : null,
    };
  });

  const out = {
    fetchedAt,
    sourceFile: "news.json",
    invalid_channel_ids: invalidRows.map((r) => ({
      state: r.state,
      channel_id: r.channel_id,
    })),
    entries,
  };

  const { url } = await put("youtube-live-cache.json", JSON.stringify(out, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true
  });
  console.log(
    `Uploaded to Vercel Blob: ${url} (${entries.length} entries, ${uniqueChannelIds.length} unique channel searches + video batches).`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
