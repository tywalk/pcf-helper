export function getArg(args: string[], arg: string): string | undefined {
    const index = args.indexOf(arg);
    if (index !== -1 && index + 1 < args.length) {
        return args[index + 1];
    }
    return undefined;
}
export function getArgValue(args: string[], argOpts: string[]): string | undefined {
  const arg = args.find(a => argOpts.includes(a));
  if (typeof arg === 'undefined') {
    return undefined;
  }
  
  const argIndex = args.indexOf(arg) + 1;
  return args.at(argIndex);
}