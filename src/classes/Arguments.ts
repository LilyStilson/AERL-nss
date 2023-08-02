import { CliMatches, getMatches } from "@tauri-apps/api/cli"

type PossibleArgument = string | boolean | string[] | null | undefined

type Argument = {
    name: string,
    count: number,
    value: PossibleArgument
}

export default class Arguments {   
    arguments?: Argument[]

    static isEmpty(matches: CliMatches) {
        let argc = 0
        for (const key in matches.args) {
            argc += matches.args[key].occurrences
        }
        return argc == 0
    }

    static parse(matches: CliMatches): Argument[] | undefined {
        if (this.isEmpty(matches)) return undefined
        let result: Argument[] = []

        for (const key in matches.args) {
            const arg = matches.args[key]
            if (arg.occurrences == 0) continue
            result.push({
                name: key,
                count: arg.occurrences,
                value: arg.value
            })
        }

        return result
    }

    async init() {
        if (this.arguments) return
        this.arguments = Arguments.parse(await getMatches())
    }
}