#!/usr/bin/env python
# -*- coding:utf-8 -*-

import os
import sys
import subprocess
import argparse
import pymongo


def importData(infile, database, collection, drop=False):
    cmd = [
        'mongoimport',
        '-d', database,
        '-c', collection,
        '--type tsv',
        '-f seqid,start,end,score',
        '--file', infile
    ]
    if drop: cmd.append('--drop')
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
    importData(args.infile, args.database, args.collection, args.drop)
    ensureIndexes(args.database, args.collection)



if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawDescriptionHelpFormatter,
        description='''
  ||    Script used to easily load bed profiles.
  ||
  ||       The data should be formated as follow:
  ||
  ||           scaffold_1      0       26      0
  ||           scaffold_1      26      80      1
  ||           scaffold_1      80      130     2
  ||           scaffold_1      130     157     3
  ||           scaffold_1      157     259     4
  ||
  ||       where columns correspond to (from left to right): seqid, start, end, score
        '''
    )
    parser.add_argument(
        '-i', '--infile', dest='infile',
        required=True,
        help='Input file.'
    )
    parser.add_argument(
        '-d', '--db', dest='database',
        required=True,
        help='Database to use.'
    )
    parser.add_argument(
        '-c', '--collection', dest='collection',
        required=True,
        help='Collection to use.'
    )
    parser.add_argument(
        '-r', '--drop', dest='drop',
        action='store_true',
        default=False,
        help="Drop the collection if it already exists."
    )
    main(parser.parse_args())
