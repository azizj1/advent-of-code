import { IntcodeComputer } from '~/2019/9';
import { getProgram } from '~/2019/21';
import input from './23.txt';
import { Queue } from '~/util/Queue';
import { timer } from '~/util/Timer';

interface IPacket {
    to: number;
    x: number;
    y: number;
}

class Computer {
    private id: number;
    private intcode: IntcodeComputer;
    private queue: Queue<IPacket>;

    constructor(id: number, intcode: IntcodeComputer) {
        this.id = id;
        this.intcode = intcode;
        this.queue = new Queue();
    }

    process() {
        const msgs: IPacket[] = [];
        if (this.queue.isEmpty())
            this.intcode.pushInputs(-1);
        else {
            const { x, y } = this.queue.dequeue()!;
            this.intcode.pushInputs(x, y);
            console.info(`${this.identifier}: ingested msg x=${x},y=${y}`);
        }

        const to = this.intcode.run();
        const x = this.intcode.run();
        const y = this.intcode.run();

        if (!isNaN(to) && !isNaN(x) && !isNaN(y)) {
            msgs.push({to, x, y});
            console.info(`${this.identifier}: send msg to ${to}. Msg: x=${x},y=${y}`);
        }
        return msgs;
    }

    receive(packet: IPacket) {
        this.queue.enqueue(packet);
    }

    private get identifier() {
        return this.id.toString().padStart(2, '0');
    }
}

class Network {
    private computers: Computer[];

    constructor(size: number) {
        this.computers = Array.from({length: size}, (_, i) => i)
            .map(id => new IntcodeComputer(getProgram(input), id))
            .map((intcode, id) => new Computer(id, intcode));
    }

    reboot() {
        let i = 0,
            numOfCompWithNoOutput = 0;

        while (numOfCompWithNoOutput < 50) {
            const msgsToSend = this.computers[i].process();
            for (const msg of msgsToSend) {
                if (msg.to === 255) {
                    console.log(`DONE MSG SENT 255: x=${msg.x},y=${msg.y}`);
                    break;
                }
                if (msg.to < 0 || msg.to >= this.computers.length)
                    throw `Comp ${i} attempted to send message to unknown comp ${msg.to} with x=${msg.x},y=${msg.y}`;
                this.computers[msg.to].receive(msg);
            }

            numOfCompWithNoOutput = msgsToSend.length === 0 ? (numOfCompWithNoOutput + 1) : 0;
            i = (i + 1) % this.computers.length;
        }
    }
}

export const run = () => {
    console.log(timer.start('day 23'));
    const network = new Network(50);
    network.reboot();
    console.log(timer.stop());
};
