#include <sstream>
#include <algorithm>
#include <v8.h>
#include <node.h>

extern "C" {
    #include "common.h"
    #include "bigWig.h"
}

using namespace v8;
using namespace node;

static Handle<Value> summary(const Arguments& args)
{
    Local<String> kstart = String::New("start");
    Local<String> kend = String::New("end");
    Local<String> kscore = String::New("score");
    Local<Array> output;
    Local<Object> doc;
    std::stringstream ss_msg;

    unsigned int start;
    unsigned int end;
    unsigned int nbins;
    //double nan0;
    //double *summaryValues;

    if (args.Length() != 5)
    {
        ss_msg << "summary() takes exactly 5 arguments (" << args.Length() << " given)";
        return ThrowException(Exception::Error(String::New(ss_msg.str().c_str())));
    }
    if (!(args[0]->IsString() && args[1]->IsString() && args[2]->IsNumber() && args[3]->IsNumber() && args[4]->IsNumber()))
    {
        return ThrowException(Exception::Error(String::New("Wrong argument type. Should be <String>, <String>, <Number>, <Number>, <Number>.")));
    }

    String::Utf8Value bwfname(args[0]->ToString());
    String::Utf8Value seqid(args[1]->ToString());
    start = args[2]->ToNumber()->NumberValue();
    end = args[3]->ToNumber()->NumberValue();
    nbins = args[4]->ToNumber()->NumberValue();

    struct bbiFile *bwf = bigWigFileOpen(*bwfname);
    bigWigFileClose(&bwf);

    // Initialize array
    //nan0 = strtod("NaN", NULL);

    output = Array::New();
    output->Set(Number::New(output->Length()), String::New(*bwfname));
    output->Set(Number::New(output->Length()), String::New(*seqid));
    output->Set(Number::New(output->Length()), Number::New(start));
    output->Set(Number::New(output->Length()), Number::New(end));
    output->Set(Number::New(output->Length()), Number::New(nbins));

    return output;
}

extern "C" {
    static void init(Handle<Object> target)
    {
        NODE_SET_METHOD(target, "summary", summary);
    }
    NODE_MODULE(bigwig, init);
}

