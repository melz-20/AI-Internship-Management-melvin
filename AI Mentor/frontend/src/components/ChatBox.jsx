import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaCopy, FaCheck } from "react-icons/fa";
import { useState } from "react";

function CodeBlock({ className, children }) {
  const [copied, setCopied] = useState(false);

  // className comes through as "language-python", "language-js", etc.
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "text";
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative my-3 rounded-lg overflow-hidden text-sm">
      <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-1.5 text-xs">
        <span className="uppercase tracking-wide">{language}</span>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition"
        >
          {copied ? (
            <>
              <FaCheck size={12} />
              Copied
            </>
          ) : (
            <>
              <FaCopy size={12} />
              Copy
            </>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: "1rem",
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

function ChatBox({ messages, loading }) {
  const bottomRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const copyMessage = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-purple-100 p-6 rounded-t-2xl space-y-4">

      {messages.length === 0 && !loading ? (
        <div className="text-center text-gray-500 mt-16">
          <h2 className="text-2xl font-bold text-purple-700 mb-3">
            👋 Welcome to AI Mentor
          </h2>

          <p>
            Ask questions about your uploaded notes,
            programming, AI, machine learning or anything
            related to your studies.
          </p>
        </div>
      ) : (
        <>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-5 py-4 rounded-2xl shadow-lg break-words ${
                  msg.sender === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                <div className="prose prose-sm max-w-none prose-headings:text-purple-700 prose-code:text-red-600 prose-code:before:content-none prose-code:after:content-none prose-table:border prose-th:border prose-td:border prose-a:text-blue-600">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children, ...props }) {
                        if (inline) {
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }

                        return (
                          <CodeBlock className={className}>
                            {children}
                          </CodeBlock>
                        );
                      },
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>

                {msg.sender === "ai" && (
                  <button
                    onClick={() => copyMessage(msg.text, index)}
                    className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition"
                  >
                    {copiedIndex === index ? (
                      <>
                        <FaCheck size={11} />
                        Copied
                      </>
                    ) : (
                      <>
                        <FaCopy size={11} />
                        Copy response
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-5 py-4 rounded-2xl shadow-lg">

                <p className="font-semibold text-purple-700 mb-3">
                  🤖 AI Mentor is thinking...
                </p>

                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-600 animate-bounce"></span>

                  <span className="w-3 h-3 rounded-full bg-purple-600 animate-bounce [animation-delay:150ms]"></span>

                  <span className="w-3 h-3 rounded-full bg-purple-600 animate-bounce [animation-delay:300ms]"></span>
                </div>

              </div>
            </div>
          )}

          <div ref={bottomRef}></div>
        </>
      )}
    </div>
  );
}

export default ChatBox;
