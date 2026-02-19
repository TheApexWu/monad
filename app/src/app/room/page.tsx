"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Canvas from "@/components/Canvas";
import TopBar from "@/components/TopBar";
import Timeline from "@/components/Timeline";

function RoomContent() {
  const params = useSearchParams();
  const roomId = params.get("id") || "default";
  const memberName = params.get("name") || "anon";

  return (
    <div className="flex flex-col h-screen">
      <TopBar roomId={roomId} memberName={memberName} />

      <div className="flex flex-1 overflow-hidden">
        {/* main canvas area */}
        <div className="flex-1">
          <Canvas roomId={roomId} memberName={memberName} />
        </div>

        {/* right sidebar - timeline */}
        <div className="w-80 border-l border-[var(--border)] overflow-y-auto">
          <Timeline roomId={roomId} memberName={memberName} />
        </div>
      </div>
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <RoomContent />
    </Suspense>
  );
}
