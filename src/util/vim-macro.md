Yank the lines below into a register, and then play it as a macro to paste new
file boilerplate. E.g.,

1. `"ayy`
2. `@a`

```
iimport { timer } from '~/util/Timer';
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