import { Expression } from "./Command";
import { Event } from "./Event";
import { Printer } from "./Printer";
import { mustString } from "./Utils";

export function printHelp(printer: Printer, event: Event, expressions: Expression<any>[], path: string[] = []) {
  if (event.length === 0) {
    let banner;

    if (path.length === 0) {
      banner = `
## Venus Command Runner

The Venus Command Runner makes it easy to interact with Venus. You can input simple commands
and it will construct Web3 calls to pull data or generate transactions. A list of available commands
is included below. To dig further into a command run \`Help <Command>\`, such as \`Help From\` or for
sub-commands run \`Help VToken\` or \`Help VToken Mint\`.
`.trim();
    } else {
      if (expressions.length > 0) {
        banner = `### ${path.join(" ")} Sub-Commands`;
      }
    }

    if (banner) {
      printer.printMarkdown(banner);
    }

    expressions.forEach(expression => {
      printer.printMarkdown(`\n${expression.doc}`);
      if (expression.subExpressions.length > 0) {
        printer.printMarkdown(`For more information, run: \`Help ${path} ${expression.name}\``);
      }
    });
  } else {
    const [first, ...rest] = event;
    const expressionName = mustString(<Event>first);

    const expression = expressions.find(expression => expression.name.toLowerCase() === expressionName.toLowerCase());

    if (expression) {
      if (rest.length === 0) {
        printer.printMarkdown(`${expression.doc}`);
      }

      printHelp(printer, rest, expression.subExpressions, path.concat(expression.name));
    } else {
      const matchingExpressions = expressions.filter(expression =>
        expression.name.toLowerCase().startsWith(expressionName.toLowerCase()),
      );

      if (matchingExpressions.length === 0) {
        printer.printLine(`\nError: cannot find help docs for ${path.concat(<string>first).join(" ")}`);
      } else {
        if (rest.length === 0) {
          matchingExpressions.forEach(expression => {
            printer.printMarkdown(`${expression.doc}`);
          });
        } else {
          printer.printLine(`\nError: cannot find help docs for ${path.concat(<string[]>event).join(" ")}`);
        }
      }
    }
  }
}
