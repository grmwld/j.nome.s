{
  'includes': [ 'common.gypi' ],

  'targets': [
    { # CUTILS
      'target_name': 'cutils',
      'sources': [ 'src/node_addons/cutils/src/cutils.cc' ]
    },
    { # BIGWIG
      'target_name': 'bigwig',
      'sources': [ 'src/node_addons/bigwig/src/bigwig.cc' ],
      'libraries': [ '-lpthread', '-lz', '-lm' ],
      'dependencies': [ 'jk' ],
    },
    { # WIGTOBIGWIG
      'target_name': 'wigtobigwig',
      'type': 'executable',
      'sources': [ 'src/vendor/utils/wigToBigWig/src/wigToBigWig.c' ],
      'include_dirs': [ 'src/vendor/utils/wigToBigWig/inc/' ],
      'libraries': [ '-lpthread', '-lz', '-lm' ],
      'dependencies': [ 'jk' ],
    },
    { # JK
      'target_name': 'jk',
      'type': 'static_library',
      'sources': [ '<@(jk_files)' ],
      'libraries': [ '-lpthread', '-lz', '-lm' ],
      'include_dirs': [ 'src/vendor/lib/jk/inc' ],
      'direct_dependent_settings': {
        'include_dirs': [ 'src/vendor/lib/jk/inc/' ]
      },
    },
    { # POST-BUILDS
      'target_name': 'wigtobig-postbuild',
      'type': 'none',
      'dependencies': [ 'wigtobigwig' ],
      'actions': [
        {
          'action_name': 'cp WigToBigWig',
          'message': 'Copying wigToBigWig to executables directory',
          'inputs': [ '<(PRODUCT_DIR)/wigtobigwig.node' ],
          'outputs': [ '<(module_root_dir)/bin/wigToBigWig' ],
          'action': [ 'cp', '<@(_inputs)', '<@(_outputs)' ]
        }
      ]
    }
  ]
}

