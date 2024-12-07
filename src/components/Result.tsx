import { resetTest } from "helpers/resetTest";
import { useSelector } from "react-redux";
import { State } from "store/reducer";
import "stylesheets/Result.scss";
import { useEffect } from "react";

export default function Result() {
    const {
        word: { wordList, typedHistory, currWord, charHistory },
        preferences: { timeLimit },
    } = useSelector((state: State) => state);
    const spaces = wordList.indexOf(currWord);
    let correctChars = 0;
    const result = typedHistory.map(
        (typedWord, idx) => typedWord === wordList[idx]
    );
    result.forEach((r, idx) => {
        if (r) correctChars += wordList[idx].length;
    });
    const wpm = ((correctChars + spaces) * 60) / timeLimit / 5;

    let csvObject = {
        WPM: Math.round(wpm),
        "Correct Words": result.filter((x) => x).length,
        "Incorrect Words": result.filter((x) => !x).length,
        Accuracy:
            Math.round((result.filter((x) => x).length / result.length) * 100) +
            "%",
        History: charHistory.join(""),
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
