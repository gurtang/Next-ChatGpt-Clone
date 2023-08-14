import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMessage,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

function ChatSidebar({ chatId }) {
  console.log("ChatId :", chatId);
  const [chatList, setChatList] = useState([]);
  useEffect(() => {
    const loadChatList = async () => {
      const response = await fetch(`/api/chat/getChatList`, {
        method: "POST",
      });
      const json = await response.json();
      console.log("CHAT LIST: ", json);
      setChatList(json?.chats || []);
    };
    loadChatList();
  }, [chatId]);
  return (
    <div className={"bg-gray-900 text-white flex flex-col overflow-hidden"}>
      <Link
        className={"side-menu-item bg-emerald-500 hover:bg-emerald-600"}
        href={"/chat"}
      >
        <FontAwesomeIcon icon={faPlus} /> New chat
      </Link>
      <div className={"flex-1 overflow-auto bg-gray-950"}>
        {chatList.map((chat) => (
          <Link
            className={`side-menu-item ${
              chat._id === chatId ? "bg-gray-700 hover:bg-gray-700" : ""
            }`}
            key={chat._id}
            href={`/chat/${chat._id}`}
          >
            <FontAwesomeIcon icon={faMessage} />{" "}
            <span
              title={chat.title}
              className={"overflow-hidden text-ellipsis whitespace-nowrap"}
            >
              {chat.title}
            </span>
          </Link>
        ))}
      </div>
      <Link className={"side-menu-item"} href={"/api/auth/logout"}>
        <FontAwesomeIcon icon={faRightFromBracket} /> Logout
      </Link>
    </div>
  );
}

export default ChatSidebar;
