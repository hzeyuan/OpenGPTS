"use client";

import {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

// import { Gpts } from "@/app/types/gpts";

interface Props {
  setGpts: Dispatch<SetStateAction<any[]>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default ({ setGpts, setLoading }: Props) => {
  const [inputDisabled, setInputDisabled] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [content, setContent] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleInputKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter" && !e.shiftKey) {
      if (e.keyCode !== 229) {
        e.preventDefault();
        handleSubmit("", content);
      }
    }
  };

  const handleSubmit = async (keyword: string, question: string) => {
    try {
      const uri = "/api/gpts/search";
      const params = {
        keyword: keyword,
        question: question,
      };

      setLoading(true);
      const resp = await fetch(uri, {
        method: "POST",
        body: JSON.stringify(params),
      });
      setLoading(false);

      if (resp.ok) {
        const res = await resp.json();
        if (res.data) {
          setGpts(res.data);
        }
      }
    } catch (e) {
      console.log("search failed: ", e);
    }
  };

  useEffect(() => {
    if (content) {
      // handleSubmit(content, "");
    }
  }, [content]);

  return (
    <section className="mt-4 relatve md:mt-8">
      <div className="w-full max-w-2xl px-6 mx-auto text-center">
        <div className="relative flex items-center">
          <input
            type="text"
            className="flex-1 px-4 py-3 text-sm bg-white border-2 rounded-lg border-primary"
            placeholder="keyword or prompt for searching GPTs"
            ref={inputRef}
            value={content}
            disabled={inputDisabled}
            onChange={handleInputChange}
            onKeyDown={handleInputKeydown}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute cursor-pointer right-4"
            onClick={() => {
              if (content) {
                handleSubmit("", content);
              }
            }}
          >
            <polyline points="9 10 4 15 9 20"></polyline>
            <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
          </svg>
        </div>
      </div>
    </section>
  );
};
