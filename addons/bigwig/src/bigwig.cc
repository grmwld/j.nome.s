#include <sstream>
#include <fstream>
#include <algorithm>
#include <v8.h>
#include <node.h>

extern "C" {
    #include "common.h"
    #include "bigWig.h"
}

using namespace v8;
using namespace node;

struct Baton {
    uv_work_t request;
    Persistent<Function> callback;
    int32_t result;
};

void bw_work(uv_work_t *req)
{
    Baton* baton = static_cast<Baton*>(req->data);
    baton->result = 1 + 1;
}

void bw_work_After(uv_work_t *req)
{
    HandleScope scope;
    Baton* baton = static_cast<Baton*>(req->data);
    Local<Value> argv[] = {
        Local<Value>::New(Null()),
        Local<Value>::New(Integer::New(baton->result))
    };
    TryCatch try_catch;
    baton->callback->Call(Context::GetCurrent()->Global(), 2, argv);
    if (try_catch.HasCaught())
    {
        node::FatalException(try_catch);
    }
    baton->callback.Dispose();
    delete baton;
}

static Handle<Value> summary(const Arguments& args)
{
    HandleScope scope;
    Baton* baton = new Baton();
    baton->request.data = baton;
    Local<Function> callback = Local<Function>::Cast(args[5]);
    baton->callback = Persistent<Function>::New(callback);
    uv_queue_work(uv_default_loop(), &baton->request, bw_work, bw_work_After);
    return Undefined();

    Local<String> kstart = String::New("start");
    Local<String> kend = String::New("end");
    Local<String> kscore = String::New("score");
    Local<Array> output;
    Local<Object> point;
    std::stringstream ss_msg;

    unsigned int start;
    unsigned int end;
    unsigned int nbins;
    unsigned int lstart;
    unsigned int lend;
    double bin_size;
    double *summaryValues;

    if (args.Length() != 5)
    {
        ss_msg << "summary() takes exactly 6 arguments (" << args.Length() << " given)";
        return ThrowException(Exception::Error(String::New(ss_msg.str().c_str())));
    }
    if (!(args[0]->IsString() && args[1]->IsString() && args[2]->IsNumber() && args[3]->IsNumber() && args[4]->IsNumber() && args[5]->IsFunction()))
    {
        return ThrowException(Exception::Error(String::New("Wrong argument type. Should be <String>, <String>, <Number>, <Number>, <Number>, <Function>.")));
    }
    
    String::Utf8Value bwfname(args[0]->ToString());
    String::Utf8Value seqid(args[1]->ToString());
    start = args[2]->ToNumber()->NumberValue();
    end = args[3]->ToNumber()->NumberValue();
    nbins = args[4]->ToNumber()->NumberValue();
    
    output = Array::New();

    bin_size = (end - start) / nbins;

    std::ifstream bwfile(*bwfname);
    if (bwfile.good())
    {
        struct bbiFile *bwf = bigWigFileOpen(*bwfname);

        summaryValues = (double *) calloc(nbins, sizeof(double));
        if (summaryValues == NULL)
        {
            return Null();
        }

        bigWigSummaryArray(bwf, *seqid, start, end, bbiSummaryTypeFromString("mean"), nbins, summaryValues);
        
        for (unsigned int i = 0 ; i < nbins ; ++i)
        {
            lstart = start + (i * bin_size);
            lend = lstart + bin_size;
            point = Object::New();
            point->Set(kstart, Number::New(lstart));
            point->Set(kend, Number::New(lend));
            point->Set(kscore, Number::New(summaryValues[i]));
            output->Set(Number::New(output->Length()), point);
        }

        lstart = lend;
        lend = end;
        point = Object::New();
        point->Set(kstart, Number::New(lstart));
        point->Set(kend, Number::New(lend));
        point->Set(kscore, Number::New(0));
        output->Set(Number::New(output->Length()), point);

        free(summaryValues);
        bigWigFileClose(&bwf);
    }
    
    return output;
}

extern "C" {
    static void init(Handle<Object> target)
    {
        NODE_SET_METHOD(target, "summary", summary);
    }
    NODE_MODULE(bigwig, init);
}

