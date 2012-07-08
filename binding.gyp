{
  'conditions': [
    [
      'OS=="mac"',
      {
        'target_defaults': {
          'xcode_settings': {
            'GCC_OPTIMISATION_LEVEL': '3',
            'WARNING_CFLAGS': [
              '-Wno-sign-compare',
            ],
            'OTHER_CFLAGS': [
              '-D_FILE_OFFSET_BITS=64',
              '-D_LARGEFILE_SOURCE'
            ]
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
      'sources': [ 'src/utils/wigToBigWig/src/wigToBigWig.c' ],
      'dependencies': [ 'jk' ],
      'include_dirs': [
        'src/addons/bigwig/inc/',
        'src/utils/wigToBigWig/inc/'
      ],
      'libraries': [ '-lpthread', '-lz' ],
      'postbuilds': [
        {
          'postbuild_name': 'Copy to ./bin',
          'action': [
            'cp',
            '${BUILT_PRODUCTS_DIR}/${EXECUTABLE_PATH}',
            '${SRCROOT}bin/wigToBigWig'
          ]
        }
      ]
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
        'src/addons/bigwig/src/udc.c',
        'src/addons/bigwig/src/verbose.c',
        'src/addons/bigwig/src/zlibFace.c'
      ],
      'include_dirs': [
        'src/addons/bigwig/inc/',
      ]
    }
  ]
}

