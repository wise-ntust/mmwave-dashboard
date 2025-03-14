"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MeterBand {
  type: string;
  rate: number;
}

interface MeterCommand {
  command: "meter";
  method: "add" | "modify" | "delete";
  data: {
    dpid: number;
    flags: string;
    meter_id: number;
    bands: MeterBand[];
  };
}

interface FlowCommand {
  command: "flow";
  method: "add" | "modify" | "delete";
  data: {
    dpid: number;
    priority: number;
    match: {
      in_port: number;
      dl_type?: string;
    };
    actions: {
      type: string;
      port?: number;
      meter_id?: number;
    }[];
  };
}

type Command = MeterCommand | FlowCommand;

interface Message {
  id: number;
  type: "user" | "system";
  text: string;
  timestamp: Date;
  command?: Command;
}

// 格式化時間的函數
const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

const actionTypeMap: Record<string, string> = {
  OUTPUT: "輸出",
  METER: "限速器",
  DROP: "丟棄",
};

// 格式化動作的函數
const formatAction = (action: {
  type: string;
  port?: number;
  meter_id?: number;
}) => {
  const type = actionTypeMap[action.type] || action.type;
  if (action.type === "OUTPUT") {
    return `  類型：${type}\n  出口埠：${action.port}`;
  } else if (action.type === "METER") {
    return `  類型：${type}\n  限速器 ID：${action.meter_id}`;
  }
  return `  類型：${type}`;
};

// 格式化指令的函數
const formatCommand = (command: Command): string => {
  if (command.command === "meter") {
    return `指令類型：限速器設置
交換機：${command.data.dpid}
限速器 ID：${command.data.meter_id}
限速方式：${command.data.flags}
限速設定：
  類型：${
    actionTypeMap[command.data.bands[0].type] || command.data.bands[0].type
  }
  速率：${command.data.bands[0].rate / 1000} Mbps`;
  } else {
    const matchStr = Object.entries(command.data.match)
      .map(([key, value]) => {
        if (key === "in_port") return `  入口埠：${value}`;
        if (key === "dl_type") return `  封包類型：${value}`;
        return `  ${key}：${value}`;
      })
      .join("\n");

    const actionsStr = command.data.actions
      .map((action) => formatAction(action))
      .join("\n");

    return `指令類型：流表規則
交換機：${command.data.dpid}
優先級：${command.data.priority}
匹配條件：
${matchStr}
動作：
${actionsStr}`;
  }
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 自動滾動到底部
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // 監聽訊息變化，自動滾動
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMounted(true);
    setMessages([
      {
        id: 0,
        type: "system",
        text: "您好！我是 SDN 助手，請問有什麼可以幫您的嗎？",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleApplyCommand = async (command: Command) => {
    console.log("準備套用指令:", command);

    if (!command || !command.data || !command.data.dpid) {
      console.error("無效的指令格式:", command);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "system",
          text: "指令格式錯誤，無法套用。",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      let response;

      if (command.command === "meter") {
        // 處理 meter 指令
        response = await fetch(`/api/switch/${command.data.dpid}/meter`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flags: command.data.flags,
            meter_id: command.data.meter_id,
            bands: command.data.bands,
          }),
        });
      } else {
        // 處理 flow 指令
        const requestBody =
          command.method === "delete"
            ? {
                dpid: command.data.dpid,
                table_id: 0,
                priority: command.data.priority,
                match: command.data.match || {},
              }
            : {
                ...command.data,
              };

        // 根據 method 決定使用的 HTTP 方法
        const httpMethod =
          command.method === "modify"
            ? "PUT"
            : command.method === "delete"
            ? "DELETE"
            : "POST";

        response = await fetch(`/api/switch/${command.data.dpid}/flow`, {
          method: httpMethod,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "套用指令失敗");
      }

      const systemMessage: Message = {
        id: Date.now(),
        type: "system",
        text: "指令已成功套用！",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error: unknown) {
      console.error("套用指令時發生錯誤:", error);
      const errorMessage: Message = {
        id: Date.now(),
        type: "system",
        text: `套用指令失敗：${
          error instanceof Error ? error.message : "未知錯誤"
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputValue }),
      });

      if (!response.ok) {
        throw new Error("請求失敗");
      }

      const data = await response.json();
      console.log("API 回應:", data);

      if (data.status === "success") {
        try {
          // 將字串陣列合併並解析為 JSON
          const commandStr = data.data.commands.join("");
          const commandData = JSON.parse(commandStr);
          console.log("解析後的指令數據:", commandData);

          // 顯示描述
          const descriptionMessage: Message = {
            id: Date.now() + 1,
            type: "system",
            text: commandData.description,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, descriptionMessage]);

          // 顯示指令
          if (commandData.commands?.length > 0) {
            // 顯示每個指令
            for (const command of commandData.commands) {
              const commandMessage: Message = {
                id: Date.now() + Math.random(), // 確保唯一 ID
                type: "system",
                text: formatCommand(command),
                command: command,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, commandMessage]);
            }
          }
        } catch (parseError) {
          console.error("解析指令數據時發生錯誤:", parseError);
          throw new Error("解析指令數據失敗");
        }
      }
    } catch (error: unknown) {
      console.error("發送訊息時發生錯誤:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: "system",
        text: `處理請求失敗：${
          error instanceof Error ? error.message : "未知錯誤"
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full h-full border border-input rounded-lg p-2">
      <div className="flex flex-col h-full gap-4">
        <div className="flex-1 min-h-0">
          <ScrollArea ref={scrollAreaRef} className="h-full pr-4">
            <div className="flex flex-col gap-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground ml-12"
                      : "bg-muted mr-12"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  {message.command && (
                    <Button
                      className="mt-2"
                      onClick={() => handleApplyCommand(message.command!)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      套用指令
                    </Button>
                  )}
                  {mounted && (
                    <span className="text-xs opacity-70 block mt-2">
                      {formatTime(message.timestamp)}
                    </span>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="bg-muted p-3 rounded-lg mr-12 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>正在處理您的請求...</span>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="flex-1"
            placeholder="輸入訊息..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SendIcon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
