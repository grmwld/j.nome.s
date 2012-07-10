#include <sstream>
#include <fstream>
#include <algorithm>
#include <v8.h>
#include <node.h>

extern "C" {
    #include "common.h"
    #include "bigWig.h"
    #include "jk_interfaces.h"
}

using namespace v8;
using namespace node;


const char* ToCString(const v8::String::Utf8Value& value) {
    return *value ? *value : "<str conversion failed>";
}


struct Baton {
    uv_work_t request;
    Persistent<Function> callback;
    std::string bwfname;
    std::string seqid;
    unsigned int start;
    unsigned int end;
    unsigned int nbins;
    unsigned int error_code;
    double *summaryValues;
};


void bw_work(uv_work_t *req)
{
    Baton* baton = static_cast<Baton*>(req->data);
    if (!baton->error_code)
    {
        baton->summaryValues = (double *) calloc(baton->nbins, sizeof(double));
        if (baton->summaryValues != NULL)
        {
            struct bbiFile *bwf = I_bigWigFileOpen((const char*)baton->bwfname.c_str());
            I_bigWigSummaryArray(bwf, (const char*)baton->seqid.c_str(), baton->start, baton->end, I_bbiSummaryTypeFromString("mean"), baton->nbins, baton->summaryValues);
            bigWigFileClose(&bwf);
        }
    }
}


void bw_work_After(uv_work_t *req)
{
    HandleScope scope;
    Baton* baton = static_cast<Baton*>(req->data);

    Local<Value> argv[2];
    Local<String> kstart = String::New("start");
    Local<String> kend = String::New("end");
    Local<String> kscore = String::New("score");
    Local<Array> output = Array::New();
    Local<Object> point;
    unsigned int lstart = 0;
    unsigned int lend = 0;
    double bin_size = 0;

    if (baton->error_code)
    {
        argv[0] = Local<Value>::New(String::New("Could not process bigwig file"));
        argv[1] = Local<Value>::New(output);
        baton->callback->Call(Context::GetCurrent()->Global(), 2, argv);
    }
    else
    {
        bin_size = (baton->end - baton->start) / baton->nbins;

        for (unsigned int i = 0 ; i < baton->nbins ; ++i)
        {
            lstart = baton->start + (i * bin_size);
            lend = lstart + bin_size;
            point = Object::New();
            point->Set(kstart, Number::New(lstart));
            point->Set(kend, Number::New(lend));
            point->Set(kscore, Number::New(baton->summaryValues[i]));
            output->Set(Number::New(output->Length()), point);
        }

        lstart = lend;
        lend = baton->end;
        point = Object::New();
        point->Set(kstart, Number::New(lstart));
        point->Set(kend, Number::New(lend));
        point->Set(kscore, Number::New(0));
        output->Set(Number::New(output->Length()), point);

        argv[0] = Local<Value>::New(Null());
        argv[1] = Local<Value>::New(output);

        TryCatch try_catch;
        baton->callback->Call(Context::GetCurrent()->Global(), 2, argv);
        if (try_catch.HasCaught())
        {
            node::FatalException(try_catch);
        }

        free(baton->summaryValues);
    }

    baton->callback.Dispose();
    delete baton;
}


static Handle<Value> summary(const Arguments& args)
{
    HandleScope scope;

    std::stringstream ss_msg;

    if (args.Length() != 6)
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
    
    Baton* baton = new Baton();
    baton->request.data = baton;
    Local<Function> callback = Local<Function>::Cast(args[5]);
    baton->callback = Persistent<Function>::New(callback);
    baton->start = args[2]->ToNumber()->NumberValue();
    baton->end = args[3]->ToNumber()->NumberValue();
    baton->nbins = args[4]->ToNumber()->NumberValue();
    baton->bwfname.assign(ToCString(bwfname), bwfname.length());
    baton->seqid.assign(ToCString(seqid), seqid.length());

    std::ifstream bwfile(baton->bwfname.c_str());
    if (bwfile.good())
    {
        baton->error_code = 0;
    }
    else
    {
        baton->error_code = 1;
    }

    uv_queue_work(uv_default_loop(), &baton->request, bw_work, bw_work_After);
    
    return Undefined();
}


extern "C" {
    static void init(Handle<Object> target)
    {
        NODE_SET_METHOD(target, "summary", summary);
    }
    NODE_MODULE(bigwig, init);
}

