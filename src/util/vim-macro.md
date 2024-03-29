Yank the lines below into a register, and then play it as a macro to paste new
file boilerplate. E.g.,

1. `"ayy`
2. `@a`

```
iimport { assert } from '~/util/assert';import { timer } from '~/util/Timer';import { declareProblem, getRunsFromIniNewlineSep } from '~/util/util';import input from './=expand('%:t:r').txt';interface Simulation {name: string;}function getSimulations(): Simulation[] {throw new Error('Not implemented.');}export function run() {declareProblem('day =expand('%:t:r')');const sim = getSimulations()[0];timer.run(() => void 0, `day =expand('%:t:r') - ${sim.name}`, sim);}ii
```

Useful for part 2:
```
iimport { assert } from '~/util/assert';import { timer } from '~/util/Timer';import { declareProblem } from '~/util/util';import { Simulation, getSimulations } from './=trim(expand('%:t:r'), 'ab')';export function run() {declareProblem('day =expand('%:t:r')');const sim = getSimulations()[0];timer.run(() => void 0, `day =expand('%:t:r') - ${sim.name}`, sim);}ii
```

When modifying this file, make sure to first do

```
:setlocal textwidth=0
```

So that vim doesn't break the long line above.

And when saving, you want to do the following instead of `:w`:

```
:noa w
```

This disables Vim's autocommands for just one command. See `:help :noautocmd`
for more information.
