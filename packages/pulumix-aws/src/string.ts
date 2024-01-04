export function splitFirst(
  s: string,
  separator: string | RegExp,
): [string, string] {
  if (typeof separator === "string") {
    const i = s.indexOf(separator);
    if (i === -1) {
      return [s, ""];
    } else {
      return [s.substring(0, i), s.substring(i + 1)];
    }
  } else {
    const result = separator.exec(s);
    if (result === null) {
      return [s, ""];
    } else {
      return [
        s.substring(0, result.index),
        s.substring(result.index + result[0].length),
      ];
    }
  }
}
