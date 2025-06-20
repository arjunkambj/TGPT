"use client";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import ChatHistoryDropdown from "./ChatHistoryDropdown";

import { useSidebarToggle } from "@/atoms/sidebarState";
import { api } from "@/convex/_generated/api";

export default function ChatHistory() {
  const user = useQuery(api.function.users.currentUser);
  const chatsIncludingProjectChats = useQuery(
    api.function.chats.getChatsByUserId,
    user ? { userId: user._id } : "skip",
  );

  const pathname = usePathname();
  const { setIsOpen } = useSidebarToggle();
  const [isMobile, setIsMobile] = useState(false);

  const chats = chatsIncludingProjectChats?.filter(
    (chat) => !chat.isProjectChat,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isChatActive = (chat: any) => {
    if (chat.isAgentChat && chat.agentId) {
      // For agent chats, check if current path matches /agent/[agentId]/[chatId]
      return pathname === `/agent/${chat.agentId}/${chat.chatId}`;
    } else {
      // For regular chats, check if current path matches /chat/[chatId]
      return pathname === `/chat/${chat.chatId}`;
    }
  };

  const getChatHref = (chat: any) => {
    if (chat.isAgentChat && chat.agentId) {
      return `/agent/${chat.agentId}/${chat.chatId}`;
    } else {
      return `/chat/${chat.chatId}`;
    }
  };

  const handleChatClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Early return after all hooks have been called
  if (!chats) {
    return null;
  }

  // Separate pinned and unpinned chats
  const pinnedChats = chats.filter((chat) => chat.isPinned);
  const recentChats = chats
    .filter((chat) => !chat.isPinned)
    .sort(
      (a, b) =>
        (b.updatedAt ?? b._creationTime ?? 0) -
        (a.updatedAt ?? a._creationTime ?? 0),
    );

  // Helper function to categorize chats by time
  const categorizeChats = (chats: any[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const categories = {
      today: [] as any[],
      yesterday: [] as any[],
      previous7Days: [] as any[],
      previous30Days: [] as any[],
      older: [] as any[],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.updatedAt ?? chat._creationTime);

      if (chatDate >= today) {
        categories.today.push(chat);
      } else if (chatDate >= yesterday) {
        categories.yesterday.push(chat);
      } else if (chatDate >= sevenDaysAgo) {
        categories.previous7Days.push(chat);
      } else if (chatDate >= thirtyDaysAgo) {
        categories.previous30Days.push(chat);
      } else {
        categories.older.push(chat);
      }
    });

    return categories;
  };

  const categorizedChats = categorizeChats(recentChats);

  const renderChatItem = (chat: any) => (
    <div
      key={chat.chatId}
      className="group relative flex w-full items-center rounded-medium hover:bg-default-100"
    >
      <Link
        className={`group relative flex h-9 w-full cursor-pointer items-center justify-start rounded-medium px-3 text-small outline-none transition-colors duration-100 hover:bg-default-100 hover:text-default-700 focus-visible:ring-2 focus-visible:ring-default-200 focus-visible:ring-offset-2 focus-visible:ring-offset-default-100 ${
          isChatActive(chat)
            ? "rounded-xl bg-default-100 text-default-800"
            : "text-default-600"
        }`}
        href={getChatHref(chat)}
        onClick={handleChatClick}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 truncate">
            {chat.isAgentChat && (
              <Icon
                className="flex-shrink-0 text-default-500"
                height={14}
                icon="solar:user-speak-rounded-bold"
                width={14}
              />
            )}
            {chat.isBranchChat && (
              <Icon
                className="flex-shrink-0 text-default-500"
                height={14}
                icon="solar:branch-bold"
                width={14}
              />
            )}
            <span className="truncate text-left">{chat.title}</span>
          </div>
        </div>
      </Link>

      <div className="absolute right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <ChatHistoryDropdown chatId={chat.chatId} isPinned={chat.isPinned} />
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Pinned Section */}
      {pinnedChats.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 flex items-center gap-2 py-0 pl-[6px] text-small text-neutral-100">
            <Icon
              className="text-neutral-100"
              height={14}
              icon="solar:pin-bold"
              width={14}
            />
            Pinned
          </div>
          <div className="flex flex-col gap-1">
            {pinnedChats.map(renderChatItem)}
          </div>
        </div>
      )}

      {/* Today Section */}
      {categorizedChats.today.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 py-0 pl-[6px] text-small text-neutral-100">
            Today
          </div>
          <div className="flex flex-col gap-1">
            {categorizedChats.today.map(renderChatItem)}
          </div>
        </div>
      )}

      {/* Yesterday Section */}
      {categorizedChats.yesterday.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 py-0 pl-[6px] text-small text-neutral-100">
            Yesterday
          </div>
          <div className="flex flex-col gap-1">
            {categorizedChats.yesterday.map(renderChatItem)}
          </div>
        </div>
      )}

      {/* Previous 7 Days Section */}
      {categorizedChats.previous7Days.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 py-0 pl-[6px] text-small text-neutral-100">
            Previous 7 days
          </div>
          <div className="flex flex-col gap-1">
            {categorizedChats.previous7Days.map(renderChatItem)}
          </div>
        </div>
      )}

      {/* Previous 30 Days Section */}
      {categorizedChats.previous30Days.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 py-0 pl-[6px] text-small text-neutral-100">
            Previous 30 days
          </div>
          <div className="flex flex-col gap-1">
            {categorizedChats.previous30Days.map(renderChatItem)}
          </div>
        </div>
      )}

      {/* Older Section */}
      {categorizedChats.older.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 py-0 pl-[6px] text-small text-neutral-100">
            Older
          </div>
          <div className="flex flex-col gap-1">
            {categorizedChats.older.map(renderChatItem)}
          </div>
        </div>
      )}
    </div>
  );
}
