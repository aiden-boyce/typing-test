import { resetTest } from "helpers/resetTest";
import { useSelector } from "react-redux";
import { State } from "store/reducer";
import "stylesheets/Result.scss";
import { useEffect } from "react";


const key_pos : {[id: string]: number[]} = {
    "`": [0,0],
    "1": [1,0],
    "2": [2,0],
    "3": [3,0],
    "4": [4,0],
    "5": [5,0],
    "6": [6,0],
    "7": [7,0],
    "8": [8,0],
    "9": [9,0],
    "0": [10,0],
    "-": [11,0],
    "=": [12,0],
    "←": [13,0],
    "q": [1,1],
    "w": [2,1],
    "e": [3,1],
    "r": [4,1],
    "t": [5,1],
    "y": [6,1],
    "u": [7,1],
    "i": [8,1],
    "o": [9,1],
    "p": [10,1],
    "[": [11,1],
    "]": [12,1],
    "\\": [13,1],
    "a": [2,2],
    "s": [3,2],
    "d": [4,2],
    "f": [5,2],
    "g": [6,2],
    "h": [7,2],
    "j": [8,2],
    "k": [9,2],
    "l": [10,2],
    ";": [11,2],
    "'": [12,2],
    "z": [2,3],
    "x": [3,3],
    "c": [4,3],
    "v": [5,3],
    "b": [6,3],
    "n": [7,3],
    "m": [8,3],
    ",": [9,3],
    ".": [10,3],
    "/": [11,3],
    " ": [6,4],
}

const calculateDistance = (k1: string, k2: string) => {
    
    let [x1,y1] = key_pos[k1]
    let [x2,y2] = key_pos[k2]
    let d = Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2))

    console.log(`${k1}-${k2} : ${d}`)

    return d
}

export default function Result() {
    const {
        word: { wordList, typedHistory, currWord, charHistory, testDuration },
        preferences: { timeLimit, pid },
    } = useSelector((state: State) => state);
    const spaces = wordList.indexOf(currWord);
    let correctChars = 0;
    const result = typedHistory.map(
        (typedWord, idx) => typedWord === wordList[idx]
    );

    let distances : number[] = []
    let i = 0;
    let m : number[] = [];
    let lastMistake = -1;
    let wordStr = wordList.join(" ")
    charHistory.forEach((c)=>{
        switch (c){
            case "←":
                if(m.length){
                    if(lastMistake == i) {
                        m.pop();
                        lastMistake = m[m.length-1]
                    }
                    distances.push(calculateDistance(c, "←"))
                } else {
                    distances.push(calculateDistance(c, wordStr[i]))
                }
                i-=2
                break;

            default:
                if(c!=wordStr[i]){
                    m.push(i)
                    lastMistake = i
                }
                distances.push(calculateDistance(c, wordStr[i]))
        }
        i++
    })

    let nearMisses = 0
    let totalMisses = 0
    let totalcharacters = 0
    distances.forEach((d)=>{
        
        console.log(d)
        if (d){
            if (d<=1.5) nearMisses++;
            totalMisses++;
        }
        totalcharacters++
    })

    result.forEach((r, idx) => {
        if (r) correctChars += wordList[idx].length;
    });
    const wpm = ((correctChars + spaces) * 60) / timeLimit / 5;
    console.log(`pid is ${pid}`)
    let csvObject = {
        prompt_id: pid,
        WPM: Math.round(wpm),
        accuracy: `${Math.round(((totalcharacters-totalMisses)/totalcharacters)*1000)/10} %`,
        time:(testDuration ? testDuration : timeLimit),
        totalMisses: totalMisses,
        nearMisses: nearMisses,
    };
    const csvmaker = function (data: Object) {
        // Empty array for storing the values
        let csvRows = [];

        // Headers is basically a keys of an object
        // which is id, name, and profession
        const headers = Object.keys(data);

        // As for making csv format, headers must
        // be separated by comma and pushing it
        // into array
        csvRows.push(headers.join(","));

        // Pushing Object values into array
        // with comma separation
        const values = Object.values(data).join(",");
        csvRows.push(values);

        // Returning the array joining with new line
        return csvRows.join("\n");
    };

    const downloadCSV = (csv: string, filename: string) => {
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.setAttribute("hidden", "");
        a.setAttribute("href", url);
        a.setAttribute("download", filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    useEffect(() => {
        const csv = csvmaker(csvObject);
        downloadCSV(csv, "result.csv");
    }, []);
    return (
        <div className="result">
            <table>
                <tbody>
                    <tr>
                        <td colSpan={2} align="center">
                            <h1>{Math.round(wpm) + " wpm"}</h1>
                        </td>
                    </tr>
                    <tr>
                        <th>Correct Words:</th>
                        <td>{result.filter((x) => x).length}</td>
                    </tr>
                    <tr className="wrong">
                        <th>Incorrect Words:</th>
                        <td>{result.filter((x) => !x).length}</td>
                    </tr>
                    <tr>
                        <td colSpan={2} align="center">
                            <button onClick={() => resetTest()}>Restart</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
