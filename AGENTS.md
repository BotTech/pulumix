# Agent Instructions

Use pnpm.

devDependencies must go in the root [package.json](./package.json).

There is a bug in the your interaction with the terminal. For every command that you run, the terminal is executing two commands. The first is empty and always fails. The second is the actual command. Please ignore the first command failure and only consider the second command's output.

Never ever interrupt a command or attempt to wait by executing another command such as sleep as that will interrupt it.

pnpm test:types does not exist. Use pnpm test.

TLO = execute the terminalLastCommmand MCP tool

If a test fails then you must confirm what the correct behavior is before making any changes. If you are unsure, ask for help.
