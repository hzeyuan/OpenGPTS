import { useCallback, useEffect, useId, useRef, useState } from 'react';
import useSWR from 'swr';
import { callCompletionApi } from '../../shared/call-completion-api';
import type { JSONValue, RequestOptions, UseCompletionOptions } from 'ai';
// import {
//   JSONValue,
//   RequestOptions,
//   UseCompletionOptions,
// } from '../shared/types';

export type UseCompletionHelpers = {
    /** The current completion result */
    completion: string;
    /**
     * Send a new prompt to the API endpoint and update the completion state.
     */
    complete: (
        prompt: string,
        options?: RequestOptions,
    ) => Promise<string | null | undefined>;
    /** The error object of the API request */
    error: undefined | Error;
    /**
     * Abort the current API request but keep the generated tokens.
     */
    stop: () => void;
    /**
     * Update the `completion` state locally.
     */
    setCompletion: (completion: string) => void;
    /** The current value of the input */
    input: string;
    /** setState-powered method to update the input value */
    setInput: React.Dispatch<React.SetStateAction<string>>;
    /**
     * An input/textarea-ready onChange handler to control the value of the input
     * @example
     * ```jsx
     * <input onChange={handleInputChange} value={input} />
     * ```
     */
    handleInputChange: (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>,
    ) => void;
    /**
     * Form submission handler to automatically reset input and append a user message
     * @example
     * ```jsx
     * <form onSubmit={handleSubmit}>
     *  <input onChange={handleInputChange} value={input} />
     * </form>
     * ```
     */
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    /** Whether the API request is in progress */
    isLoading: boolean;
    /** Additional data added on the server via StreamData */
    data?: JSONValue[] | undefined;
};

export function useCompletion({
    api = '/api/completion',
    id,
    initialCompletion = '',
    initialInput = '',
    credentials,
    headers,
    body,
    onResponse,
    onFinish,
    onError,
}: UseCompletionOptions = {}): UseCompletionHelpers {
    // Generate an unique id for the completion if not provided.
    const hookId = useId();
    const completionId = id || hookId;

    // Store the completion state in SWR, using the completionId as the key to share states.
    const { data, mutate } = useSWR<string>([api, completionId], null, {
        fallbackData: initialCompletion,
    });

    const { data: isLoading = false, mutate: mutateLoading } = useSWR<boolean>(
        [completionId, 'loading'],
        null,
    );

    const { data: streamData, mutate: mutateStreamData } = useSWR<
        JSONValue[] | undefined
    >([completionId, 'streamData'], null);

    const [error, setError] = useState<undefined | Error>(undefined);
    const completion = data!;

    // Abort controller to cancel the current API call.
    const [abortController, setAbortController] =
        useState<AbortController | null>(null);

    const extraMetadataRef = useRef({
        credentials,
        headers,
        body,
    });
    useEffect(() => {
        extraMetadataRef.current = {
            credentials,
            headers,
            body,
        };
    }, [credentials, headers, body]);

    const triggerRequest = useCallback(
        async (prompt: string, options?: RequestOptions) =>
            callCompletionApi({
                api,
                prompt,
                credentials: extraMetadataRef.current.credentials,
                headers: { ...extraMetadataRef.current.headers, ...options?.headers },
                body: {
                    ...extraMetadataRef.current.body,
                    ...options?.body,
                },
                setCompletion: completion => mutate(completion, false),
                setLoading: mutateLoading,
                setError,
                setAbortController,
                onResponse,
                onFinish,
                onError,
                onData: data => {
                    mutateStreamData([...(streamData || []), ...(data || [])], false);
                },
            }),
        [
            mutate,
            mutateLoading,
            api,
            extraMetadataRef,
            setAbortController,
            onResponse,
            onFinish,
            onError,
            setError,
            streamData,
            mutateStreamData,
        ],
    );

    const stop = useCallback(() => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
        }
    }, [abortController]);

    const setCompletion = useCallback(
        (completion: string) => {
            mutate(completion, false);
        },
        [mutate],
    );

    const complete = useCallback<UseCompletionHelpers['complete']>(
        async (prompt, options) => {
            return triggerRequest(prompt, options);
        },
        [triggerRequest],
    );

    const [input, setInput] = useState(initialInput);

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!input) return;
            return complete(input);
        },
        [input, complete],
    );

    const handleInputChange = (e: any) => {
        setInput(e.target.value);
    };

    return {
        completion,
        complete,
        error,
        setCompletion,
        stop,
        input,
        setInput,
        handleInputChange,
        handleSubmit,
        isLoading,
        data: streamData,
    };
}