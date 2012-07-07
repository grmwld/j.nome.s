{
    "targets": [
        {
            "target_name": "cutils",
            "sources": [ "addons/cutils/src/cutils.cc" ]
        },
        {
            "target_name": "bigwig",
            "sources": [ "addons/bigwig/src/bigwig.cc" ],
            "dependencies": [
                "jk"
            ],
            "include_dirs": [
                'addons/bigwig/inc/'
            ]
        },
        {
            "target_name": "jk",
            "type": "static_library",
            "sources": [
                "addons/bigwig/src/bPlusTree.c",
                "addons/bigwig/src/bbiRead.c",
                "addons/bigwig/src/bwgQuery.c",
                "addons/bigwig/src/cirTree.c",
                "addons/bigwig/src/common.c",
                "addons/bigwig/src/errabort.c",
                "addons/bigwig/src/hash.c",
                "addons/bigwig/src/localmem.c",
                "addons/bigwig/src/memalloc.c",
                "addons/bigwig/src/udc.c",
                "addons/bigwig/src/verbose.c",
                "addons/bigwig/src/zlibFace.c"
            ],
            "include_dirs": [
                'addons/bigwig/inc/'
            ]
        }
    ]
}

