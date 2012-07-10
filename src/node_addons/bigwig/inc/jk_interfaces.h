#ifndef JK_INTERFACES_H
#define JK_INTERFACES_H


/*
 * Interface to :       bbiSummaryTypeFromString
 * Defined in :         jk/inc/bbiFile.h
 * Implemented in :     jk/src/bbiRead.c
 */
enum bbiSummaryType 
I_bbiSummaryTypeFromString(
        const char          *string
);


/*
 * Interface to :       bigWigFileOpen
 * Defined in :         jk/inc/bigWig.h
 * Implemented in :     jk/src/bwgQuery.c
 */
struct bbiFile *
I_bigWigFileOpen(
        const char          *fileName
);


/*
 * Interface to :       bigWigSummaryArray
 * Defined in :         jk/inc/bigWig.h
 * Implemented in :     jk/src/bwgQuery.c
 */
boolean 
I_bigWigSummaryArray(
        struct bbiFile      *bwf,
        const char          *chrom,
        bits32              start,
        bits32              end,
        enum bbiSummaryType summaryType,
        int                 summarySize,
        double              *summaryValues
);

#endif /* JK_INTERFACES_H */
