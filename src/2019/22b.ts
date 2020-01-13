import { getSimulations, getDeck } from '~/2019/22';
import { timer } from '~/util/Timer';

const newDeckSize = 119315717514047;

export const run = () => {
    const sims = getSimulations();
    for (const s of sims) {
        const isInput = s.name === 'input';
        console.log(timer.start(`22 - ${s.name} (size ${s.size} techniques ${s.techniques.length})`));
        const shuffled = s.techniques.reduce((a, c) => c(a), getDeck(isInput ? newDeckSize : s.size));
        if (isInput)
            console.log(shuffled.indexOf(2019));
        else
            console.log(shuffled);
        console.log(timer.stop());
    }
};
