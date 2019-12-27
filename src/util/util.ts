export const last = <T>(arr: T[]) => arr[arr.length - 1];
export const first = <T>(arr: T[]) => arr[0];

export const getRunsFromIniFile = (content: string) =>
    Array.from(content.matchAll(/\[([^\]]+)\]\r?\n?(.+?(?=(\[|$)))/sg))
        .map(run => ({
            name: run[1],
            content: run[2]
        })
);
