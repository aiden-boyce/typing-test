import {
    appendTypedHistory,
    backtrackWord,
    setChar,
    setTypedWord,
    appendKey,
    timerSet,
    setTime,
    setTimerId,
    recordDuration,
} from "store/actions";
import { store } from "store/store";
import { resetTest } from "./resetTest";
import { startTimer } from "./startTimer";

const handleBackspace = (ctrlKey: boolean) => {
    const { dispatch, getState } = store;
    const {
        word: { typedWord, activeWordRef, typedHistory, wordList },
    } = getState();
    const currIdx = typedHistory.length - 1;
    const currWordEl = activeWordRef?.current!;
    if (!typedWord && typedHistory[currIdx] !== wordList[currIdx]) {
        dispatch(backtrackWord(ctrlKey));
        currWordEl.previousElementSibling!.classList.remove("right", "wrong");
        if (ctrlKey) {
            currWordEl.previousElementSibling!.childNodes.forEach(
                (char: HTMLSpanElement) => {
                    char.classList.remove("wrong", "right");
                }
            );
        }
    } else {
        if (ctrlKey) {
            dispatch(setTypedWord(""));
            currWordEl.childNodes.forEach((char: HTMLSpanElement) => {
                char.classList.remove("wrong", "right");
            });
        } else {
            const newTypedWord = typedWord.slice(0, typedWord.length - 1);
            dispatch(setTypedWord(newTypedWord));
        }
    }
};

export const recordTest = (key: string, ctrlKey: boolean) => {
    const { dispatch, getState } = store;
    const {
        time: { timer, timerId },
        word: {
            typedWord,
            currWord,
            activeWordRef,
            caretRef,
            wordList,
            typedHistory,
        },
        preferences: { timeLimit },
    } = getState();

    if (!timer) {
        if (key === "Tab") {
            resetTest();
        }
        return;
    }
    if (!timerId && key !== "Tab") startTimer();
    const currWordEl = activeWordRef?.current!;
    currWordEl.scrollIntoView({ behavior: "smooth", block: "center" });
    const caret = caretRef?.current!;
    caret.classList.remove("blink");
    setTimeout(() => caret.classList.add("blink"), 500);
    switch (key) {
        case "Tab":
            if (timer !== timeLimit || timerId) {
                resetTest();
                document.getElementsByClassName("word")[0].scrollIntoView();
            }
            break;
        case " ":
            dispatch(appendKey(" "));

            if (typedWord === "") return;
            currWordEl.classList.add(
                typedWord !== currWord ? "wrong" : "right"
            );
            dispatch(appendTypedHistory());

            let nxt_wrd = wordList[typedHistory.length + 1];
            console.log(nxt_wrd);
            if (nxt_wrd === "endtest") {
                console.log("end detected");
                // end the test
                clearInterval(timerId);
                dispatch(recordDuration(timeLimit - timer));
                dispatch(timerSet(0));
                return;
            }
            break;
        case "Backspace":
            dispatch(appendKey("←"));
            handleBackspace(ctrlKey);
            break;
        default:
            dispatch(appendKey(key.toLowerCase()));
            dispatch(setChar(typedWord + key));
            break;
    }
};
