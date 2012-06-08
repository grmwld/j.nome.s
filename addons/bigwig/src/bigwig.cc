#include <sstream>
#include <algorithm>
#include <v8.h>
#include <node.h>
#include <common.h>
#include <bigWig.h>

using namespace v8;
using namespace node;

static Handle<Value> bigWigQuery(const Arguments& args)
{
    Local<String> kstart = String::New("start");
    Local<String> kend = String::New("end");
    Local<String> kscore = String::New("score");
    Local<String> vseqid;
    Local<Array> output;
    Local<Array> input;
    Local<Object> doc;
    Local<Object> point;
    unsigned int length = 0;
    unsigned int score = 0;
    unsigned int step;
    unsigned int input_length;
    unsigned int doc_start;
    unsigned int doc_end;
    unsigned int doc_score;
    unsigned int start;
    unsigned int i;
    unsigned int j;
    std::stringstream ss_msg;
    
    if (args.Length() != 2)
    {
        ss_msg << "processProfile() takes exactly 2 arguments (" << args.Length() << " given)";
        return ThrowException(Exception::Error(String::New(ss_msg.str().c_str())));
    }
    if (!(args[0]->IsArray() && args[1]->IsNumber()))
    {
        return ThrowException(Exception::Error(String::New("Wrong argument type. Should be <Array>, <Number>.")));
    }

    input = Local<Array>(Array::Cast(*args[0]));

    output = Array::New();

    return output;
}

extern "C" {
    static void init(Handle<Object> target)
    {
        NODE_SET_METHOD(target, "bigWigQuery", bigWigQuery);
    }
    NODE_MODULE(bigwig, init);
}

