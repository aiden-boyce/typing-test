import { setTimerId, setWordList, timerSet, setPromptID} from "store/actions";
import { store } from "store/store";

export const resetTest = async () => {
    const { dispatch, getState } = store;
    const {
        time: { timerId },
        preferences: { timeLimit, type, pid },
    } = getState();
    document
        .querySelectorAll(".wrong, .right")
        .forEach((el) => el.classList.remove("wrong", "right"));
    if (timerId) {
        clearInterval(timerId);
        dispatch(setTimerId(null));
    }

    if (type == "CS_TEST") {
        import(`wordlists/typing_prompts.json`).then((dct) => {
            let fnd = false
            let prompt_id : string | null = null
            let words : string = "not found"
            let prompt_string : string = ""

            if(pid != "") {
                prompt_string = pid
                words = `${dct[prompt_string]}`
            } else {
                while(!fnd){
                    prompt_id = prompt("Enter prompt id")
                    prompt_string = `${prompt_id}`
                    if(dct[prompt_string]) {words = `${dct[prompt_string]}`; fnd = true;}
                }        
            }
            dispatch(setPromptID(prompt_string))
            console.log(`set PID to ${prompt_string}`)
            dispatch(setWordList(words.split(" ").map((w)=>w.toLowerCase())))
        })
    } else {
        import(`wordlists/${type}.json`).then((words) =>
            dispatch(setWordList(words.default))
        );
    }
    dispatch(timerSet(timeLimit));
};
