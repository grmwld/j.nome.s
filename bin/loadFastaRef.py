#!/usr/bin/env python2.7

import sys
import argparse
import json
import pymongo
import bson
import gridfs


class Sequence:
    '''Represent a fasta sequence, with header and a sequence.
    '''
    def __init__(self, header, sequence):
        self.header = header
        self.seq = sequence

    def save(self, fs):
        return fs.put(self.seq, filename=self.header, _id=self.header)



def loadSequences(infile):
    '''Lazily load all sequences in a fasta file and yield corresponding
    Sequence objects.
    '''
    inseq = False
    tmp = []
    for line in infile:
        if line.startswith( '>' ):
            if inseq:
                yield Sequence(
                        header=tmp[0].strip()[1:],
                        sequence=''.join(tmp[1:]).strip()
                )
                tmp = []
                inseq = False
            inseq = True
        if inseq:
            tmp.append(line.strip())
    if tmp:
        yield Sequence(
                header=tmp[0].strip(),
                sequence=''.join(tmp[1:]).strip()
        )


def parseArguments():
    parser = argparse.ArgumentParser(
            description='Load in MongoDB a FASTA file containing a reference genome.'
    )
    parser.add_argument(
            '-i', '--infile', dest='infile',
            type=argparse.FileType( 'r' ),
            nargs='?',
            default=sys.stdin,
            metavar='FILE',
            help='Input file.'
    )
    parser.add_argument(
            '-d', '--database', dest='database',
            metavar='DATABASE',
            help='MongoDB database where the data is stored.'
    )
    parser.add_argument(
            '-D', '--debug', dest='debug',
            action='store_true',
            default=False,
            help='Debug mode.'
    )
  
    return parser.parse_args()



def main():
    
    args = parseArguments()

    connection = pymongo.Connection()
    db = connection[args.database]
    fs = gridfs.GridFS(db)
    
    sequences = loadSequences(args.infile)
    
    try:

        for seq in sequences:
            if args.debug:
                print >>sys.stderr, seq.header
            seq.save(fs)

    except KeyboardInterrupt:
        pass
    except Exception as err:
        print >>sys.stderr, err
    finally:
        if args.debug:
            print >>sys.stderr, '\nCleaning up ...'
        args.infile.close()



if __name__ == "__main__":
    main()

