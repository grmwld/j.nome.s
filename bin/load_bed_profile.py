#!/usr/bin/env python
# -*- coding:utf-8 -*-

import os
import sys
import subprocess
import argparse
import pymongo


def importData(infile, database, collection):
    cmd = [
        'mongoimport',
        '-d', database,
        '-c', collection,
        '--type tsv',
        '-f seqid,start,end,score',
        '--file', infile
    ]
    subprocess.call(' '.join(cmd), shell=True)


def ensureIndexes(database, collection):
    connection = pymongo.Connection()
    db = connection[database]
    col = db[collection]
    col.create_index([
        ('seqid', pymongo.ASCENDING),
        ('start', pymongo.ASCENDING),
        ('end', pymongo.ASCENDING)
    ])



def main(args):
    importData(args.infile, args.database, args.collection)
    ensureIndexes(args.database, args.collection)



if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '-i', '--infile', dest='infile',
        help='Input file.'
    )
    parser.add_argument(
        '-d', '--db', dest='database',
        help='Database to use.'
    )
    parser.add_argument(
        '-c', '--collection', dest='collection',
        help='Collection to use.'
    )
    main(parser.parse_args())
