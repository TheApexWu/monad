import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

// ---------------------------------------------------------------------------
// In-memory room store. Works for `next dev` (single process).
// For production/Vercel, swap this with Vercel KV or Supabase.
// ---------------------------------------------------------------------------

type MemberStatus = {
  name: string;
  status: "building" | "blocked" | "idle" | "reviewing" | "away";
  workingOn: string;
  lastUpdate: number;
};

type RoomEvent = {
  id: string;
  actor: string;
  content: string;
  type: "status_update" | "message" | "join";
  timestamp: number;
};

type RoomState = {
  id: string;
  members: Record<string, MemberStatus>;
  events: RoomEvent[];
  createdAt: number;
};

const rooms = new Map<string, RoomState>();

const MAX_EVENTS = 200;
const AWAY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function getOrCreateRoom(roomId: string): RoomState {
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      id: roomId,
      members: {},
      events: [],
      createdAt: Date.now(),
    };
    rooms.set(roomId, room);
  }
  return room;
}

function markStaleMembers(room: RoomState) {
  const now = Date.now();
  for (const [, member] of Object.entries(room.members)) {
    if (member.status !== "away" && now - member.lastUpdate > AWAY_TIMEOUT_MS) {
      member.status = "away";
    }
  }
}

function pushEvent(room: RoomState, event: Omit<RoomEvent, "id" | "timestamp">) {
  room.events.push({
    ...event,
    id: nanoid(8),
    timestamp: Date.now(),
  });
  if (room.events.length > MAX_EVENTS) {
    room.events = room.events.slice(-MAX_EVENTS);
  }
}

// ---------------------------------------------------------------------------
// GET /api/room/[roomId] -- returns full room state
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const room = getOrCreateRoom(roomId);
  markStaleMembers(room);
  return NextResponse.json(room);
}

// ---------------------------------------------------------------------------
// POST /api/room/[roomId] -- handle actions
// Body: { action, name, ...payload }
// ---------------------------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const room = getOrCreateRoom(roomId);
  const body = await req.json();
  const { action, name } = body;

  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  switch (action) {
    case "join": {
      if (!room.members[name]) {
        room.members[name] = {
          name,
          status: "idle",
          workingOn: "",
          lastUpdate: Date.now(),
        };
        pushEvent(room, { actor: name, content: `${name} joined`, type: "join" });
      } else {
        // Rejoin: mark online again
        room.members[name].status = room.members[name].status === "away" ? "idle" : room.members[name].status;
        room.members[name].lastUpdate = Date.now();
      }
      break;
    }

    case "update_status": {
      const member = room.members[name];
      if (!member) {
        return NextResponse.json({ error: "not in room" }, { status: 400 });
      }
      const prev = { status: member.status, workingOn: member.workingOn };
      if (body.status) member.status = body.status;
      if (body.workingOn !== undefined) member.workingOn = body.workingOn;
      member.lastUpdate = Date.now();

      // Build a readable event message
      const parts: string[] = [];
      if (body.status && body.status !== prev.status) parts.push(body.status);
      if (body.workingOn !== undefined && body.workingOn !== prev.workingOn)
        parts.push(body.workingOn ? `working on ${body.workingOn}` : "cleared task");
      if (parts.length > 0) {
        pushEvent(room, {
          actor: name,
          content: parts.join(" | "),
          type: "status_update",
        });
      }
      break;
    }

    case "message": {
      if (!body.content?.trim()) {
        return NextResponse.json({ error: "empty message" }, { status: 400 });
      }
      // Also bump lastUpdate so they don't go stale
      if (room.members[name]) {
        room.members[name].lastUpdate = Date.now();
      }
      pushEvent(room, {
        actor: name,
        content: body.content.trim(),
        type: "message",
      });
      break;
    }

    case "heartbeat": {
      // Just bump lastUpdate to prevent going stale
      if (room.members[name]) {
        room.members[name].lastUpdate = Date.now();
      }
      break;
    }

    default:
      return NextResponse.json({ error: `unknown action: ${action}` }, { status: 400 });
  }

  markStaleMembers(room);
  return NextResponse.json(room);
}
