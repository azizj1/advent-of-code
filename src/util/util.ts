export const last = <T>(arr: T[]) => arr[arr.length - 1];
export const first = <T>(arr: T[]) => arr[0];

export const getRunsFromIniFile = (content: string) =>
    Array.from(content.matchAll(/\[([^\]]+)\]\r?\n?(.+?(?=(\[|$)))/sg))
        .map(run => ({
            name: run[1],
            content: run[2]
        })
);

let savedConsoleInfo: ((message?: string) => void) | null = null;
export const dropConsoleInfo = () => {
    savedConsoleInfo = console.info;
    console.info = () => void 0;
};

export const resetConsoleInfo = () => {
    if (savedConsoleInfo != null)
        console.info = savedConsoleInfo;
};
