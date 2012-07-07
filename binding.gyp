{
  'conditions': [
    [
      'OS=="mac"',
      {
        'target_defaults': {
          'xcode_settings': {
            'OTHER_CFLAGS': [ '-Wno-sign-compare' ]
          }
        }
      }
    ]
  ],
  'targets': [
    {
      'target_name': 'cutils',
      'sources': [ 'src/addons/cutils/src/cutils.cc' ]
    },
    {
      'target_name': 'bigwig',
      'sources': [ 'src/addons/bigwig/src/bigwig.cc' ],
      'dependencies': [ 'jk' ],
      'include_dirs': [ 'src/addons/bigwig/inc/' ]
    },
    {
      'target_name': 'wigToBigWig',
      'type': 'executable',
      'product_dir': '../bin/',
      'sources': [ 'src/utils/wigToBigWig/src/wigToBigWig.c' ],
      'dependencies': [ 'jk' ],
      'include_dirs': [
        'src/addons/bigwig/inc/',
        'src/utils/wigToBigWig/inc/'
      ],
      'libraries': [ '-lpthread' ]
    },
    {
      'target_name': 'jk',
      'type': 'static_library',
      'sources': [
        'src/addons/bigwig/src/bPlusTree.c',
        'src/addons/bigwig/src/bbiRead.c',
        'src/addons/bigwig/src/bbiWrite.c',
        'src/addons/bigwig/src/bwgCreate.c',
        'src/addons/bigwig/src/bwgQuery.c',
        'src/addons/bigwig/src/cirTree.c',
        'src/addons/bigwig/src/common.c',
        'src/addons/bigwig/src/errabort.c',
        'src/addons/bigwig/src/hash.c',
        'src/addons/bigwig/src/lineFile.c',
        'src/addons/bigwig/src/localmem.c',
        'src/addons/bigwig/src/memalloc.c',
        'src/addons/bigwig/src/obscure.c',
        'src/addons/bigwig/src/options.c',
        'src/addons/bigwig/src/sqlNum.c',
        #'src/addons/bigwig/src/textOut.c',
        'src/addons/bigwig/src/udc.c',
        'src/addons/bigwig/src/verbose.c',
        'src/addons/bigwig/src/zlibFace.c'
      ],
      'include_dirs': [
        'src/addons/bigwig/inc/',
      ],
    }
  ]
}

