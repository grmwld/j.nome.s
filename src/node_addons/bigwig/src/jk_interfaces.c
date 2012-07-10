#include <string.h>
#include "common.h"
#include "linefile.h"
#include "hash.h"
#include "localmem.h"
#include "options.h"
#include "sig.h"
#include "sqlNum.h"
#include "obscure.h"
#include "dystring.h"
#include "bPlusTree.h"
#include "cirTree.h"
#include "rangeTree.h"
#include "udc.h"
#include "zlibFace.h"
#include "bbiFile.h"
#include "bwgInternal.h"
#include "bigWig.h"
#include "bigBed.h"
#include "jk_interfaces.h"


enum bbiSummaryType I_bbiSummaryTypeFromString(const char *string)
{
    char c_string[256];
    strcpy(c_string, string);
    return bbiSummaryTypeFromString(c_string);
}

struct bbiFile *I_bigWigFileOpen(const char *fileName)
{
    char c_fileName[256];
    strcpy(c_fileName, fileName);
    return bigWigFileOpen(c_fileName);
}

boolean I_bigWigSummaryArray(struct bbiFile *bwf, const char *chrom, bits32 start, bits32 end,
        enum bbiSummaryType summaryType, int summarySize, double *summaryValues)
{
    char c_chrom[256];
    strcpy(c_chrom, chrom);
    return bigWigSummaryArray(bwf, c_chrom, start, end, summaryType, summarySize, summaryValues);
}

