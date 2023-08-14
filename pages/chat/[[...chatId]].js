import Head from "next/head";
import ChatSidebar from "../../components/ChatSidebar/ChatSidebar";
import { useEffect, useState } from "react";
import { streamReader } from "openai-edge-stream";
import { v4 as uuid } from "uuid";
import Message from "../../components/Message/Message";
import { useRouter } from "next/router";
import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default function ChatPage({ chatId, title, messages = [] }) {
  console.log("Title: ", title, "  Messages: ", messages);
  const [incomingMessage, setIncomingMessage] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratedResponse] = useState(false);
  const [newChatId, setNewChatId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setNewChatMessages([]);
    setNewChatId(null);
  }, [chatId]);

  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, generatingResponse, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Test1");
    setGeneratedResponse(true);
    // console.log(messageText);
    setNewChatMessages((prev) => {
      return [
        ...prev,
        {
          _id: uuid(),
          role: "user",
          content: messageText,
        },
      ];
    });
    setMessageText("");

    // console.log("NEW CHAT: ", json);
    const response = await fetch(`/api/chat/sendMessage`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: messageText }),
    });

    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    await streamReader(reader, (message) => {
      // console.log("MESSAGE: ", message);
      if (message.event === "newChatId") {
        setNewChatId(message.content);
      } else {
        setIncomingMessage((s) => `${s}${message.content}`);
      }
    });
    setIncomingMessage("");
    setGeneratedResponse(false);
  };

  const allMessages = [...messages, ...newChatMessages];
  return (
    <>
      <Head>
        <title>New chat</title>
      </Head>
      <div className={"grid h-screen grid-cols-[260px_1fr]"}>
        <ChatSidebar chatId={chatId} />
        <div className={"overflow-hidden bg-gray-700 flex flex-col"}>
          <div className={"flex-1 text-white overflow-scroll"}>
            {allMessages.length > 0 &&
              allMessages.map((message) => (
                <Message
                  key={message.id}
                  role={message.role}
                  content={message.content}
                />
              ))}

            {!!incomingMessage && (
              <Message role="assistant" content={incomingMessage} />
            )}
          </div>
          <footer className={"bg-gray-800 p-10"}>
            <form onSubmit={handleSubmit}>
              <fieldset className={"flex gap-2"} disabled={generatingResponse}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={generatingResponse ? "" : "Send a message..."}
                  className={
                    "w-full resize-none rounded-md bg-gray-700 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-emerald-500"
                  }
                />
                <button className={"btn"} type={"submit"}>
                  Send
                </button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}
export const getServerSideProps = async (ctx) => {
  const chatId = ctx.params?.chatId?.[0] || null;
  if (chatId) {
    const { user } = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("ChattyPete");
    const chat = await db.collection("chats").findOne({
      userId: user.sub,
      _id: new ObjectId(chatId),
    });
    return {
      props: {
        chatId,
        title: chat.title,
        messages: chat.messages.map((message) => ({
          ...message,
          _id: uuid(),
        })),
      },
    };
  }
  return {
    props: {},
  };
};
