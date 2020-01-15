import { IntcodeComputer } from '~/2019/9';
import { getProgram } from '~/2019/21';
import input from './23.txt';
import { timer } from '~/util/Timer';
import { IPacket, Computer } from '~/2019/23';
import chalk from 'chalk';

class NATComputer {
    private lastPacket: IPacket | null;
    private id = 255;

    constructor() {
        this.lastPacket = null;
    }

    process() {
        if (this.lastPacket == null)
            return [];
        const { x, y } = this.lastPacket;
        console.info(`${this.identifier}: send msg to 0. Msg: x=${x},y=${y}`);
        return [{to: 0, x, y}];
    }

    receive(packet: IPacket) {
        this.lastPacket = packet;
    }

    private get identifier() {
        return chalk.blue(this.id.toString().padStart(2, '0'));
    }
}

class Network {
    private computers: Computer[];
    private nat: NATComputer;

    constructor(size: number) {
        this.computers = Array.from({length: size}, (_, i) => i)
            .map(id => new IntcodeComputer(getProgram(input), id))
            .map((intcode, id) => new Computer(id, intcode));
        this.nat = new NATComputer();
    }

    runUntilIdle() {
        let i = 0,
            numOfCompWithNoOutput = 0,
            numOfCompWithNoInput = 0,
            totalMsgsSent = 0;

        while (numOfCompWithNoOutput < 50 || numOfCompWithNoInput < 50) {
            const msgsToSend = this.computers[i].process();
            for (const msg of msgsToSend) {
                if (msg.to === 255) {
                    this.nat.receive(msg);
                    continue;
                }
                if (msg.to < 0 || msg.to >= this.computers.length)
                    throw `Comp ${i} attempted to send message to unknown comp ${msg.to} with x=${msg.x},y=${msg.y}`;
                this.computers[msg.to].receive(msg);
            }

            numOfCompWithNoOutput = msgsToSend.length === 0 ? (numOfCompWithNoOutput + 1) : 0;
            numOfCompWithNoInput = this.computers[i].hasPacketsToProcess() ? 0 : (numOfCompWithNoInput + 1);
            totalMsgsSent += msgsToSend.length;
            i = (i + 1) % this.computers.length;
        }
        this.nat.process().forEach(m => this.computers[m.to].receive(m));
        return totalMsgsSent;
    }

    run() {
        let count = 0;
        while (count < 50) {
            console.log(chalk.red(`MESSAGES TRANSMITTED: ${this.runUntilIdle()}`));
            count++;
        }
    }
}

export const run = () => {
    console.log(timer.start('day 23'));
    const network = new Network(50);
    network.run();
    console.log(timer.stop());
};
