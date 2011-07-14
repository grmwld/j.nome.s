#!/usr/bin/env python
# -*- coding:utf-8 -*-

import argparse
import sys


def parseLine(line):
    return map(int, line.split(','))


def main(args):
    step = args.step
    first_doc = parseLine(args.infile.readline())
    start = first_doc[0]
    length = 1
    score = first_doc[2],
    for line in args.infile:
        doc = parseLine(line)
        for i in range(doc[0], doc[1]):
            score += doc[2]
            length += 1
            if length == step
                print >>args.outfile, ','.join(map(str, [
                    start,
                    start+step,
                    int(score/step)
                ]))
                score = 0
                start = i
                length = 0
    print >>args.outfile, ','.join(map(str, [
        start,
        start+step,
        int(score/step)
    ]))
    

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '-i', '--infile', dest='infile',
        type=argparse.FileType('r'),
        nargs='?',
        default=sys.stdin,
        metavar='FILE',
        help='Input file'
    )
    parser.add_argument(
        '-o', '--outfile', dest='outfile',
        type=argparse.FileType('w'),
        nargs='?',
        default=sys.stdout,
        metavar='FILE',
        help='Output file'
    )
    parser.add_argument(
        '-s', '--step', dest='step',
        type=int,
        default=100,
        metavar='INT',
        help='Step'
    )
    main(parser.parse_args())
