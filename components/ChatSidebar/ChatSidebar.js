import React from "react";
import Link from "next/link";

function ChatSidebar() {
  return (
    <div className={"bg-gray-900 text-white"}>
      <Link href={"/api/auth/logout"}>Logout</Link>
    </div>
  );
}

export default ChatSidebar;
