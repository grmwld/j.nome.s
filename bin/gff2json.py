#!/usr/bin/env python2.7
# -*- coding:utf-8 -*-

import sys
import json
import argparse
import traceback


def tryint(val):
    try: return int(val)
    except ValueError: return val
    
def tryfloat(val):
    try: return float(val)
    except ValueError: return val

def nullify(val):
    if val != '.':
        return val
    return None



class Anon_JSON:
    def __init__(self, keys):
        self.__keys = keys

    def raw_json(self, flat_list):
        json_struct = {}
        for k, v in zip(self.__keys, flat_list):
            if k != 'attributes':
                json_struct[k] = v
            else:
                for kk, vv in v.iteritems():
                    if kk == 'ID': json_struct['_id'] = tryint(vv)
                    elif kk == 'Parent': json_struct['parents'] = map(tryint, vv.split(','))
                    elif kk == 'Name': json_struct['name'] = vv
                    elif kk == 'Alias': json_struct['alias'] = vv
                    else: json_struct[kk] = vv
        return json_struct



class GFFParser:
    '''Class defining a GFF parser
    '''
    
    def __init__(self, infile, version=3):
        self.__infile = infile
        self.__version = version
        self.__initVersion(version)

    def __initVersion(self, version):
        self.__attributeSeparator = ';'
        self.__fieldSeparator = '\t'
        if version == 2:
            self.__keyValAttributeSeparator = ' '
        elif version == 3:
            self.__keyValAttributeSeparator = '='
        else:
            raise ValueError

    def parse(self):
        for line in self.__infile:
            l = line.strip().split(self.__fieldSeparator)
            if not l[0].startswith('##'):
                l = map(tryint, l)
                l[5] = tryfloat(l[5])
                l = map(nullify, l)
                try:
                    attributes = l[8].strip().split(self.__attributeSeparator)
                    l[8] = {}
                    for a in attributes:
                        try:
                            k = a.strip().split(self.__keyValAttributeSeparator)[0].strip('"').strip("'")
                            v = self.__keyValAttributeSeparator.join(a.strip().split(self.__keyValAttributeSeparator)[1:]).strip('"').strip("'")
                            o = [k, v]
                            l[8].update([o])
                        except:
                            print a
                            traceback.print_exc()
                            sys.exit(-1)
                except IndexError:
                    pass
                yield l


def main():

    parser = argparse.ArgumentParser()

    parser.add_argument(
            '-i', '--in', dest='infile',
            type=argparse.FileType('r'),
            nargs='?',
            default=sys.stdin,
            metavar='FILE',
            help='Input file.'
    )
    parser.add_argument(
            '-o', '--out', dest='outfile',
            type=argparse.FileType('w'),
            nargs='?',
            default=sys.stdout,
            metavar='FILE',
            help='Output file.'
    )
    parser.add_argument(
            '-g', '--gff_version', dest='gff_version',
            type=int,
            choices=[2, 3],
            default=3,
            metavar='{2, 3}',
            help='GFF version of the file to parse.'
    )

    args = parser.parse_args()

    try:
        gff_parser = GFFParser(args.infile, args.gff_version)
        jsonizer = Anon_JSON([
            'seqid',
            'source',
            'type',
            'start',
            'end',
            'score',
            'strand',
            'phase',
            'attributes'
        ])
        for i in gff_parser.parse():
            t = jsonizer.raw_json(i)
            print >>args.outfile, json.dumps(t)
    except KeyboardInterrupt:
        pass
    except Exception as err:
        traceback.print_exc()
    finally:
        args.infile.close()
        args.outfile.close()
 

if __name__ == '__main__':
    main()
