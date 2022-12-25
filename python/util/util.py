import re

def getRunsFromIniNewlineSep(file: str) -> list[tuple[str, list[str]]]:
    '''List of (name: string, content: string[]), where content is per line.'''
    result: list[tuple[str, list[str]]] = []
    content: list[str] = []
    name: str = ''
    with open(file) as f:
        for line in f:
            if not line.strip('\n'): continue
            match = re.search(r'^\[([^\]]+)\]$', line)
            if match:
                if len(content) > 0:
                    result.append((name, content))
                content = []
                name = match.group(1)
            else:
                content.append(line.strip('\n'))

    if name and len(content) > 0:
        result.append((name, content))
    return result

