#!/usr/bin/env python
# -*- coding:utf-8 -*-

import os
import sys
import argparse
import json
from bx.bbi.bigwig_file import BigWigFile



class DataPoint:
    def __init__(self, query, index, value):
        self.seqid = query.seqid
        self.index = index
        self.score = int(value['mean'])
        step = (query.end - query.start) / float(query.nbins)
        self.start = int(query.start + self.index * step)
        self.end = int(self.start + step)

    def __str__(self):
        return '\t'.join(map(str, [
            self.seqid,
            self.start,
            self.end,
            self.score
        ]))

    def toJSON(self):
        return json.dumps({
            #'seqid': self.seqid,
            'start': self.start,
            'end': self.end,
            'score': self.score
        })



class BW_Query:
    def __init__(self, bwfile, seqid, start, end, nbins):
        self.bwf = BigWigFile(bwfile)
        self.seqid = seqid
        self.start = start
        self.end = end
        self.nbins = nbins
        self.rawdata = []
        self.data = []

    def __str__(self):
        return '\n'.join([point.toJSON() for point in self.data])
        #return '\n'.join(map(str, self.data))

    def run(self):
        self.rawdata = self.bwf.query(self.seqid, self.start, self.end, self.nbins)
        a = self.bwf.query(self.seqid, self.start, self.end, self.nbins)
        self.formatRawData()

    def formatRawData(self):
        for i, value in enumerate(self.rawdata):
            self.data.append(DataPoint(self, i, value))




def main(args):
    query = BW_Query(args.infile, args.seqid, args.start, args.end, args.nbins)
    query.run()
    print query


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '-i', '--infile', dest='infile',
        type=argparse.FileType('r'),
        nargs='?',
        default=sys.stdin,
        help='Input file'
    )
    parser.add_argument(
        '-o', '--outfile', dest='outfile',
        type=argparse.FileType('w'),
        nargs='?',
        default=sys.stdout,
        help='Output file'
    )
    parser.add_argument(
        '-s', '--seqid', dest='seqid',
        help='Restrict search to seqid'
    )
    parser.add_argument(
        '-t', '--start', dest='start',
        default=0,
        type=int,
        help='Start position'
    )
    parser.add_argument(
        '-e', '--end', dest='end',
        type=int,
        help='End position'
    )
    parser.add_argument(
        '-n', '--nbins', dest='nbins',
        type=int,
        help='Number of data points to fetch'
    )
    main(parser.parse_args())
